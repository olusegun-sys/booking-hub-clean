import { useEffect } from 'react';
import { motion } from 'motion/react';

/**
 * The moment a customer's slot is held.
 *
 * A calendar page turns up, a tick lands on it, and a small burst scatters —
 * then the screen hands over to the payment details. It stays shorter and
 * quieter than the merchant's sign-up confirmation: the booking is not finished
 * until they have transferred, so this reads as "that worked", not "you're
 * done", and the copy says what happens next.
 *
 * Drawn rather than played: it starts on the first frame with nothing to
 * download, matches the brand exactly, and collapses to a static state when the
 * viewer has asked for reduced motion.
 */

const SPARKS = [
  { x: -96, y: -52, c: '#2D60EA', s: 7 },
  { x: -54, y: -88, c: '#FCD451', s: 9 },
  { x: 4, y: -102, c: '#EDE9FE', s: 8 },
  { x: 60, y: -84, c: '#1B7F43', s: 7 },
  { x: 100, y: -46, c: '#2D60EA', s: 9 },
  { x: 104, y: 22, c: '#FCD451', s: 7 },
  { x: 64, y: 72, c: '#EDE9FE', s: 8 },
  { x: -8, y: 92, c: '#2D60EA', s: 7 },
  { x: -68, y: 70, c: '#1B7F43', s: 8 },
  { x: -104, y: 18, c: '#FCD451', s: 9 }
];

export default function BookingCelebration({
  businessName,
  serviceName,
  onDone,
  delay = 2100
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, delay);
    return () => clearTimeout(timer);
  }, [onDone, delay]);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      role="status"
      aria-live="polite"
      className="plz-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F7F8FB] px-6"
    >
      <div className="relative flex h-[190px] w-[190px] items-center justify-center">
        {!reduced && SPARKS.map((p, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
            animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 1.25, delay: 0.5 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: p.c, width: p.s, height: p.s, borderRadius: 2 }}
            className="absolute"
            aria-hidden="true"
          />
        ))}

        {/* a calendar page, with the day ticked */}
        <motion.svg
          viewBox="0 0 120 120"
          className="relative h-[116px] w-[116px]"
          aria-hidden="true"
          initial={reduced ? { scale: 1 } : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <rect x="16" y="24" width="88" height="82" rx="14" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="3" />
          <path d="M16 46 H104" stroke="#E4E4E7" strokeWidth="3" />
          <rect x="36" y="14" width="7" height="20" rx="3.5" fill="#2D60EA" />
          <rect x="77" y="14" width="7" height="20" rx="3.5" fill="#2D60EA" />

          <motion.path
            d="M42 74 L55 87 L80 60"
            fill="none" stroke="#2D60EA" strokeWidth="8"
            strokeLinecap="round" strokeLinejoin="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.38, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.svg>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-1 text-center text-h3 text-plz-ink"
        style={{ textWrap: 'balance' }}
      >
        Your slot is held
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 max-w-[36ch] text-center text-body text-plz-body"
      >
        {serviceName ? `${serviceName} at ` : ''}{businessName}.
        Next, send the transfer to confirm it.
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 1 }}
        className="mt-9 h-0.5 w-[110px] overflow-hidden rounded-full bg-plz-line"
      >
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: (delay - 800) / 1000, delay: 0.8, ease: 'linear' }}
          className="block h-full bg-plz-blue"
        />
      </motion.span>
    </motion.div>
  );
}
