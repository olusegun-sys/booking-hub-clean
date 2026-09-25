import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';

/**
 * The parts the four dashboard sections share.
 *
 * Kept in one place so a card, a badge or a field looks identical wherever it
 * appears — the product reference is consistent about this, and a dashboard
 * that drifts between screens is the first thing that reads as unfinished.
 */

export const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

/* --------------------------------------------------------------- surfaces */

export function Card({ children, className = '', pad = true }) {
  return (
    <section
      className={
        'rounded-[14px] border border-plz-line bg-white ' +
        (pad ? 'p-5 ' : '') +
        className
      }
    >
      {children}
    </section>
  );
}

export function CardHead({ title, note, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-plz-ink">{title}</h2>
        {note && <p className="mt-1 text-[13px] leading-snug text-plz-body">{note}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ badge */

export function Badge({ tone = 'bg-plz-surface text-plz-body', children, dot = false }) {
  return (
    <span
      className={
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
        tone
      }
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- buttons */

/**
 * Size lives in a prop, not in the class string.
 *
 * Two utilities from the same family (px-4 and px-0) are decided by their order
 * in Tailwind's output, not by the order they are written, so a caller appending
 * `px-0` to this base could not actually shrink the padding — an icon button
 * ended up with 4px of content box and a squashed glyph. Choosing the size here
 * means only one padding utility is ever emitted.
 */
const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold ' +
  '[&>svg]:shrink-0 transition-colors duration-micro ease-plz ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const SIZES = {
  md: 'h-10 px-4 text-[14px]',
  sm: 'h-9 px-3 text-[13px]',
  icon: 'h-9 w-9 text-[13px]'
};

export function Button({
  variant = 'primary',
  size = 'md',
  busy = false,
  children,
  className = '',
  ...rest
}) {
  const skin =
    variant === 'primary'
      ? 'bg-plz-blue text-white hover:bg-plz-blue-deep'
      : variant === 'ghost'
        ? 'text-plz-body hover:bg-plz-surface hover:text-plz-ink'
        : variant === 'danger'
          ? 'border border-plz-line text-[#C0395A] hover:bg-[#FDEEF0]'
          : 'border border-plz-line bg-white text-plz-ink hover:bg-plz-surface';

  return (
    <motion.button
      type="button"
      whileHover={rest.disabled || busy ? undefined : { y: -1 }}
      whileTap={rest.disabled || busy ? undefined : { scale: 0.985 }}
      transition={SPRING}
      className={BASE + ' ' + (SIZES[size] || SIZES.md) + ' ' + skin + ' ' + className}
      disabled={rest.disabled || busy}
      {...rest}
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      {children}
    </motion.button>
  );
}

/* ----------------------------------------------------------------- fields */

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={'block ' + className}>
      <span className="block text-[13px] font-semibold text-plz-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#C0395A]">
          <AlertCircle size={12} />
          {error}
        </span>
      ) : (
        hint && <span className="mt-1.5 block text-[12px] text-plz-body">{hint}</span>
      )}
    </label>
  );
}

export const inputClass =
  'mt-2 h-11 w-full rounded-[10px] border border-plz-line bg-white px-3.5 text-[14px] text-plz-ink ' +
  'placeholder:text-plz-grey transition-colors duration-micro ease-plz ' +
  'focus:border-plz-blue focus:outline-none focus:ring-2 focus:ring-plz-blue/15';

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-micro ease-plz ' +
        (on ? 'bg-plz-blue' : 'bg-plz-line-strong')
      }
    >
      <motion.span
        layout
        transition={SPRING}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

/* ------------------------------------------------------------ empty / load */

export function EmptyState({ icon: Icon, title, note, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-plz-surface">
        <Icon size={20} className="text-plz-grey" />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-plz-ink">{title}</p>
      <p className="mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-plz-body">{note}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={'animate-pulse rounded-[8px] bg-plz-surface ' + className} />;
}

/** Shown when the V1 tables are missing, so the screen explains itself. */
export function SetupRequired({ message }) {
  return (
    <Card className="border-[#F2D98E] bg-plz-cream">
      <div className="flex gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#B0840F]" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-plz-ink">
            Your booking tables aren&apos;t set up yet
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-plz-body">
            {message ||
              'The Plazzaa V1 database migration has not been applied, so services, availability and bookings have nowhere to live yet.'}
          </p>
          <p className="mt-2 text-[12px] text-plz-body">
            Run <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">plazzaa_v1_migration.sql</code>{' '}
            in your Supabase SQL editor, then reload this page.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ toast */

export function Toast({ toast, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={SPRING}
            role="status"
            className={
              'pointer-events-auto flex max-w-[92vw] items-center gap-3 rounded-[12px] px-4 py-3 shadow-panel ' +
              (toast.tone === 'error' ? 'bg-[#C0395A] text-white' : 'bg-plz-ink text-white')
            }
          >
            {toast.tone === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : (
              <Check size={16} className="shrink-0" />
            )}
            <span className="text-[13px] font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="ml-1 shrink-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
