// server/services/availabilityService.js
// ============================================================
// Plazzaa V1 availability engine
//
// Turns a service (duration + capacity), the weekly opening
// hours, blocked slots and existing bookings into the list of
// times a customer is actually allowed to pick.
//
// Business hours are stored as local wall-clock times. Nigeria
// has no daylight saving, so a fixed offset is enough and keeps
// slot maths predictable. Override with BUSINESS_UTC_OFFSET_MINUTES.
// ============================================================

const DEFAULT_UTC_OFFSET_MINUTES = 60; // Africa/Lagos (UTC+1)

// day_of_week follows the existing dashboard: 0 = Monday ... 6 = Sunday
const MONDAY_FIRST_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function utcOffsetMinutes() {
  const raw = parseInt(process.env.BUSINESS_UTC_OFFSET_MINUTES, 10);
  return Number.isFinite(raw) ? raw : DEFAULT_UTC_OFFSET_MINUTES;
}

// '09:30' or '09:30:00' -> minutes since midnight
function parseTimeToMinutes(value) {
  if (typeof value !== 'string') return null;
  const parts = value.trim().split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// A local wall-clock time on a given date -> the real instant (Date)
function localToInstant(dateStr, minutesIntoDay, offset) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(utcMidnight + (minutesIntoDay - offset) * 60000);
}

// 0 = Monday ... 6 = Sunday, to match the existing dashboard
function dayIndexMondayFirst(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

// Opening hours rows may say is_closed (database) or is_open (older dashboard payloads)
function isDayClosed(hoursRow) {
  if (!hoursRow) return true;
  if (typeof hoursRow.is_closed === 'boolean') return hoursRow.is_closed;
  if (typeof hoursRow.is_open === 'boolean') return !hoursRow.is_open;
  return false;
}

function findHoursForDate(hoursRows, dateStr) {
  const wanted = dayIndexMondayFirst(dateStr);
  const rows = Array.isArray(hoursRows) ? hoursRows : [];

  return rows.find(function (row) {
    if (row == null) return false;
    if (typeof row.day_of_week === 'number') return row.day_of_week === wanted;
    if (typeof row.day_of_week === 'string') {
      const asNumber = parseInt(row.day_of_week, 10);
      if (Number.isFinite(asNumber)) return asNumber === wanted;
      return MONDAY_FIRST_DAYS[wanted] === row.day_of_week.trim().toLowerCase();
    }
    return false;
  }) || null;
}

function overlapsBlockedSlot(slotStart, slotEnd, blockedRows, serviceId) {
  return (Array.isArray(blockedRows) ? blockedRows : []).some(function (row) {
    if (!row || row.is_available === true) return false;
    if (row.service_id && row.service_id !== serviceId) return false;
    if (!row.start_datetime || !row.end_datetime) return false;

    const blockedStart = new Date(row.start_datetime).getTime();
    const blockedEnd = new Date(row.end_datetime).getTime();
    if (Number.isNaN(blockedStart) || Number.isNaN(blockedEnd)) return false;

    return blockedStart < slotEnd.getTime() && blockedEnd > slotStart.getTime();
  });
}

function countTakenAt(bookingRows, slotStart) {
  const target = slotStart.getTime();
  return (Array.isArray(bookingRows) ? bookingRows : []).filter(function (row) {
    if (!row || !row.start_datetime) return false;
    return new Date(row.start_datetime).getTime() === target;
  }).length;
}

/**
 * Build the bookable slots for one service on one date.
 *
 * @param {object}   input
 * @param {string}   input.date      'YYYY-MM-DD' in business local time
 * @param {object}   input.service   { id, duration_minutes, capacity }
 * @param {Array}    input.hours     operating_hours rows for the business
 * @param {Array}    input.blocked   availability rows with is_available = false
 * @param {Array}    input.bookings  active bookings (payment_pending / awaiting_validation / confirmed)
 * @param {Date}     [input.now]     current time, injectable for tests
 * @returns {{ date: string, closed: boolean, slots: Array }}
 */
function buildSlots(input) {
  const date = input.date;
  const service = input.service || {};
  const now = input.now instanceof Date ? input.now : new Date();
  const offset = utcOffsetMinutes();

  const duration = parseInt(service.duration_minutes, 10);
  const capacity = parseInt(service.capacity, 10);

  if (!Number.isFinite(duration) || duration <= 0) {
    return { date: date, closed: true, reason: 'Service has no duration', slots: [] };
  }

  const hoursRow = findHoursForDate(input.hours, date);
  if (isDayClosed(hoursRow)) {
    return { date: date, closed: true, reason: 'Closed on this day', slots: [] };
  }

  const openMinutes = parseTimeToMinutes(hoursRow.open_time);
  const closeMinutes = parseTimeToMinutes(hoursRow.close_time);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return { date: date, closed: true, reason: 'Opening hours are not set', slots: [] };
  }

  const slots = [];
  const maxPerSlot = Number.isFinite(capacity) && capacity > 0 ? capacity : 1;

  for (let start = openMinutes; start + duration <= closeMinutes; start += duration) {
    const slotStart = localToInstant(date, start, offset);
    const slotEnd = localToInstant(date, start + duration, offset);

    // Past times must never be bookable
    if (slotStart.getTime() <= now.getTime()) continue;
    if (overlapsBlockedSlot(slotStart, slotEnd, input.blocked, service.id)) continue;

    const taken = countTakenAt(input.bookings, slotStart);
    const remaining = maxPerSlot - taken;
    if (remaining <= 0) continue;

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: minutesToLabel(start),
      end_label: minutesToLabel(start + duration),
      capacity: maxPerSlot,
      // The booking page only shows spaces left when capacity > 1
      remaining: remaining
    });
  }

  return { date: date, closed: false, slots: slots };
}

module.exports = {
  buildSlots,
  findHoursForDate,
  isDayClosed,
  parseTimeToMinutes,
  localToInstant,
  dayIndexMondayFirst,
  utcOffsetMinutes
};
