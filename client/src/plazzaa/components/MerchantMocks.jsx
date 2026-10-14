import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, Copy, Instagram, MessageCircle, Music2, Plus, Clock, BellRing } from 'lucide-react';
import { merchantTrades, merchantHours, naira } from '../lib/data';
import { EASE } from '../lib/motion';

/**
 * The product, drawn at rest.
 *
 * Each "how it works" row is paired with the screen it describes, built from
 * the same tokens as the real interface rather than a screenshot — so it stays
 * sharp, animates, and can be read by a screen reader.
 */

const frame =
  'rounded-visual border border-plz-line bg-white p-5 shadow-lift md:p-6';

/** 1 — services: name, price, duration. That is the whole form. */
export function ServicesMock() {
  const [added, setAdded] = useState(false);

  return (
    <div className={frame}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
        Your services
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-plz-line">
        {merchantTrades.slice(0, 3).map((trade) => (
          <li key={trade.id} className="flex items-center justify-between gap-4 py-3">
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-medium text-plz-ink">
                {trade.service}
              </span>
              <span className="text-[13px] text-plz-body">{trade.minutes} mins · capacity 1</span>
            </span>
            <span className="shrink-0 text-[15px] font-semibold text-plz-ink">
              {trade.price ? naira(trade.price) : '—'}
            </span>
          </li>
        ))}
        <AnimatePresence>
          {added && (
            <motion.li
              key="new"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center justify-between gap-4 overflow-hidden py-3"
            >
              <span>
                <span className="block text-[15px] font-medium text-plz-ink">Bridal makeup</span>
                <span className="text-[13px] text-plz-body">150 mins · capacity 1</span>
              </span>
              <span className="text-[15px] font-semibold text-plz-ink">{naira(120000)}</span>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>

      <motion.button
        type="button"
        onClick={() => setAdded((v) => !v)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-btn border border-dashed border-plz-line-strong text-[15px] font-semibold text-plz-ink hover:border-plz-ink"
      >
        <Plus size={16} />
        {added ? 'Remove that one' : 'Add a service'}
      </motion.button>
    </div>
  );
}

/** 2 — availability: the days you open become the times people can pick. */
export function AvailabilityMock() {
  const [open, setOpen] = useState(() => merchantHours.map((h) => h.day));

  return (
    <div className={frame}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
        Opening hours
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
          const isOpen = open.includes(day);
          const hours = merchantHours.find((h) => h.day === day);
          return (
            <li key={day} className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isOpen}
                aria-label={day}
                onClick={() =>
                  setOpen((prev) => (isOpen ? prev.filter((d) => d !== day) : [...prev, day]))
                }
                className={
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-micro ease-plz ' +
                  (isOpen ? 'bg-plz-blue' : 'bg-plz-line-strong')
                }
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white"
                  style={{ left: isOpen ? 23 : 3 }}
                />
              </button>
              <span className="w-10 text-[14px] font-medium text-plz-ink">{day}</span>
              <span className={'text-[14px] ' + (isOpen ? 'text-plz-body' : 'text-plz-grey')}>
                {isOpen ? (hours ? hours.hours.replace('-', '–') : '10–6') : 'Closed'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 3 — the link, and the places it goes. */
export function LinkMock() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className={frame}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
        Your booking link
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-input border border-plz-line bg-plz-surface px-4 py-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[14px] text-plz-ink">
          plazzaa.com/glowspa
        </span>
        <motion.button
          type="button"
          onClick={() => setCopied(true)}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-ctl bg-plz-ink px-3 text-[13px] font-semibold text-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <Check size={14} /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <Copy size={14} /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { icon: Instagram, label: 'Instagram bio' },
          { icon: MessageCircle, label: 'WhatsApp status' },
          { icon: Music2, label: 'TikTok' }
        ].map(({ icon: Icon, label }) => (
          <motion.span
            key={label}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2 rounded-ctl border border-plz-line px-3 py-2 text-[13px] font-medium text-plz-ink"
          >
            <Icon size={14} className="text-plz-body" />
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/** 4 — what the customer sees, and the moment it lands with you. */
export function BookingMock() {
  const [slot, setSlot] = useState('13:30');
  const reduce = useReducedMotion();

  return (
    <div className={frame}>
      <div className="flex items-center gap-2 border-b border-plz-line pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-plz-line-strong" />
        <span className="font-mono text-[13px] text-plz-body">plazzaa.com/glowspa</span>
      </div>

      <p className="mt-4 text-[15px] font-medium text-plz-ink">Saturday 12 October</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {['11:00', '13:30', '16:00', '17:30'].map((time) => {
          const active = time === slot;
          return (
            <motion.button
              key={time}
              type="button"
              onClick={() => setSlot(time)}
              aria-pressed={active}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 440, damping: 26 }}
              className={
                'rounded-ctl px-3 py-2 text-[14px] font-medium transition-colors duration-micro ease-plz ' +
                (active ? 'bg-plz-blue text-white' : 'bg-plz-surface text-plz-ink hover:bg-plz-line/70')
              }
            >
              {time}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={slot}
        initial={reduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="mt-4 flex items-start gap-3 rounded-ctl bg-plz-blue-wash p-3.5"
      >
        <BellRing size={16} className="mt-0.5 shrink-0 text-plz-blue" />
        <p className="text-[14px] text-plz-ink">
          <span className="font-semibold">Amaka O.</span> booked Deep tissue, 60 mins for{' '}
          {slot}. Reference PLZ-8F21.
        </p>
      </motion.div>
    </div>
  );
}

/** 5 — the transfer landed, so you validate and Plazzaa writes to the customer. */
export function ValidateMock() {
  const [state, setState] = useState('awaiting');

  return (
    <div className={frame}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
        Bookings
      </p>

      <div className="mt-4 rounded-ctl border border-plz-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-plz-ink">Amaka O.</p>
            <p className="text-[13px] text-plz-body">Sat 13:30 · Deep tissue · {naira(25000)}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: EASE }}
              className={
                'shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ' +
                (state === 'awaiting' ? 'bg-plz-cream text-plz-ink' : 'bg-plz-blue-wash text-plz-blue')
              }
            >
              {state === 'awaiting' ? 'Awaiting validation' : 'Confirmed'}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {state === 'awaiting' ? (
            <>
              <span className="flex items-center gap-1.5 text-[13px] text-plz-body">
                <Clock size={14} />
                Transfer received?
              </span>
              <motion.button
                type="button"
                onClick={() => setState('confirmed')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                className="ml-auto h-10 rounded-btn bg-plz-blue px-4 text-[14px] font-semibold text-white"
              >
                Validate booking
              </motion.button>
            </>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[14px] text-plz-ink"
            >
              <Check size={16} className="text-plz-blue" strokeWidth={2.5} />
              Confirmation emailed to Amaka
            </motion.p>
          )}
        </div>
      </div>

      {state === 'confirmed' && (
        <motion.button
          type="button"
          onClick={() => setState('awaiting')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-[13px] font-medium text-plz-body underline decoration-plz-line-strong underline-offset-4"
        >
          Play it again
        </motion.button>
      )}
    </div>
  );
}
