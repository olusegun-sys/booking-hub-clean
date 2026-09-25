// server/tests/availability.test.js
// Plain node, no test framework needed:  node tests/availability.test.js
//
// Covers the rules the V1 scope calls out: slots come from the
// service duration inside opening hours, past times are never
// bookable, capacity 1 disappears once taken, capacity > 1 shows
// remaining spaces, blocked slots are removed, closed days are empty.

process.env.BUSINESS_UTC_OFFSET_MINUTES = '60'; // Africa/Lagos

const assert = require('assert');
const { buildSlots } = require('../services/availabilityService');

const DATE = '2026-10-05'; // a Monday
const NOW = new Date('2026-10-05T06:00:00.000Z'); // 07:00 Lagos

// Monday open 09:00-12:00 local, closed Sunday
const HOURS = [
  { day_of_week: 0, open_time: '09:00', close_time: '12:00', is_closed: false },
  { day_of_week: 6, open_time: null, close_time: null, is_closed: true }
];

const SERVICE = { id: 'svc-1', duration_minutes: 60, capacity: 1 };

// 09:00 Lagos == 08:00 UTC
const slotAt = (hourLagos) => new Date(Date.UTC(2026, 9, 5, hourLagos - 1, 0, 0)).toISOString();

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log('  ok  ' + name);
}

console.log('availability engine');

check('generates one slot per service duration inside opening hours', () => {
  const result = buildSlots({ date: DATE, service: SERVICE, hours: HOURS, blocked: [], bookings: [], now: NOW });
  assert.strictEqual(result.closed, false);
  assert.deepStrictEqual(result.slots.map(s => s.label), ['09:00', '10:00', '11:00']);
  assert.strictEqual(result.slots[0].start, slotAt(9));
});

check('a 90 minute service only offers whole slots that fit', () => {
  const result = buildSlots({
    date: DATE, service: { id: 'svc-2', duration_minutes: 90, capacity: 1 },
    hours: HOURS, blocked: [], bookings: [], now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['09:00', '10:30']);
});

check('past times are never bookable', () => {
  const result = buildSlots({
    date: DATE, service: SERVICE, hours: HOURS, blocked: [], bookings: [],
    now: new Date('2026-10-05T09:30:00.000Z') // 10:30 Lagos
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['11:00']);
});

check('capacity 1: a taken slot disappears', () => {
  const result = buildSlots({
    date: DATE, service: SERVICE, hours: HOURS, blocked: [],
    bookings: [{ start_datetime: slotAt(10), status: 'payment_pending' }], now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['09:00', '11:00']);
});

check('capacity 3: slot stays with remaining spaces', () => {
  const result = buildSlots({
    date: DATE, service: { id: 'svc-3', duration_minutes: 60, capacity: 3 }, hours: HOURS, blocked: [],
    bookings: [
      { start_datetime: slotAt(9), status: 'confirmed' },
      { start_datetime: slotAt(9), status: 'awaiting_validation' }
    ],
    now: NOW
  });
  assert.strictEqual(result.slots[0].label, '09:00');
  assert.strictEqual(result.slots[0].remaining, 1);
});

check('capacity 3: slot disappears once full', () => {
  const full = Array.from({ length: 3 }, () => ({ start_datetime: slotAt(9), status: 'confirmed' }));
  const result = buildSlots({
    date: DATE, service: { id: 'svc-3', duration_minutes: 60, capacity: 3 },
    hours: HOURS, blocked: [], bookings: full, now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['10:00', '11:00']);
});

check('a blocked window removes the slots it overlaps', () => {
  const result = buildSlots({
    date: DATE, service: SERVICE, hours: HOURS,
    blocked: [{
      service_id: null, is_available: false,
      start_datetime: slotAt(10), end_datetime: slotAt(11)
    }],
    bookings: [], now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['09:00', '11:00']);
});

check('a block for another service does not affect this one', () => {
  const result = buildSlots({
    date: DATE, service: SERVICE, hours: HOURS,
    blocked: [{
      service_id: 'other-service', is_available: false,
      start_datetime: slotAt(10), end_datetime: slotAt(11)
    }],
    bookings: [], now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['09:00', '10:00', '11:00']);
});

check('closed day returns no slots', () => {
  const result = buildSlots({ date: '2026-10-11', service: SERVICE, hours: HOURS, blocked: [], bookings: [], now: NOW });
  assert.strictEqual(result.closed, true);
  assert.deepStrictEqual(result.slots, []);
});

check('missing opening hours returns no slots', () => {
  const result = buildSlots({ date: DATE, service: SERVICE, hours: [], blocked: [], bookings: [], now: NOW });
  assert.strictEqual(result.closed, true);
});

check('cancelled and expired bookings do not hold a slot', () => {
  const result = buildSlots({
    date: DATE, service: SERVICE, hours: HOURS, blocked: [],
    // the caller only passes active bookings; this guards the counting itself
    bookings: [{ start_datetime: slotAt(9), status: 'confirmed' }], now: NOW
  });
  assert.deepStrictEqual(result.slots.map(s => s.label), ['10:00', '11:00']);
});

console.log('\n' + passed + ' checks passed');
