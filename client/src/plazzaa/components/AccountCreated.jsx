import { useEffect } from 'react';
import { motion } from 'motion/react';
import PlazzaaLogo from './PlazzaaLogo';

/**
 * The moment after sign-up.
 *
 * A ring draws itself, a tick strokes on inside it, confetti scatters once,
 * and the screen hands over to the dashboard. Drawn with SVG path-length and a
 * dozen absolutely positioned pieces rather than a video file: it starts on the
 * first frame with nothing to download, sits exactly on the brand blue, stays
 * sharp on any display, and respects a reduced-motion preference — none of
 * which a generated clip can do for a two-second confirmation.
 */

const PIECES = [
  { x: -120, y: -40, r: -28, c: '#2D60EA', w: 7, h: 12 },
  { x: -86, y: -96, r: 14, c: '#FCD451', w: 9, h: 9, round: true },
  { x: -34, y: -124, r: -8, c: '#EDE9FE', w: 8, h: 14 },
  { x: 28, y: -118, r: 22, c: '#2D60EA', w: 9, h: 9, round: true },
  { x: 84, y: -88, r: -18, c: '#FCD451', w: 7, h: 13 },
  { x: 124, y: -36, r: 32, c: '#1B7F43', w: 8, h: 8, round: true },
  { x: 132, y: 28, r: -24, c: '#2D60EA', w: 7, h: 12 },
  { x: 96, y: 84, r: 16, c: '#EDE9FE', w: 9, h: 9, round: true },
  { x: 36, y: 118, r: -30, c: '#FCD451', w: 8, h: 13 },
  { x: -30, y: 122, r: 10, c: '#2D60EA', w: 8, h: 8, round: true },
  { x: -92, y: 86, r: -14, c: '#1B7F43', w: 7, h: 12 },
  { x: -128, y: 30, r: 26, c: '#FCD451', w: 9, h: 9, round: true }
];

export default function AccountCreated({ businessName, onDone, delay = 2400 }) {
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
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      className="plz-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-6"
    >
      <div className="relative flex h-[200px] w-[200px] items-center justify-center">
        {/* confetti */}
        {!reduced && PIECES.map((p, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0], scale: 1, rotate: p.r * 6 }}
            transition={{ duration: 1.5, delay: 0.42 + i * 0.015, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: p.c,
              width: p.w,
              height: p.h,
              borderRadius: p.round ? '50%' : 2
            }}
            className="absolute"
            aria-hidden="true"
          />
        ))}

        {/* the ring and the tick */}
        <svg viewBox="0 0 120 120" className="relative h-[124px] w-[124px]" aria-hidden="true">
          <motion.circle
            cx="60" cy="60" r="52"
            fill="none" stroke="#2D60EA" strokeWidth="5" strokeLinecap="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotate: -90, transformOrigin: '60px 60px' }}
          />
          <motion.path
            d="M38 61.5 L53 76 L83 46"
            fill="none" stroke="#2D60EA" strokeWidth="7"
            strokeLinecap="round" strokeLinejoin="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.36, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-center text-h3 text-plz-ink"
        style={{ textWrap: 'balance' }}
      >
        Account created
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.74, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 max-w-[34ch] text-center text-body text-plz-body"
      >
        {businessName ? `${businessName} is on Plazzaa.` : 'You’re on Plazzaa.'}{' '}
        Let’s set up your booking page.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.1 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <PlazzaaLogo size={22} />
        <span className="h-0.5 w-[120px] overflow-hidden rounded-full bg-plz-line">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: (delay - 900) / 1000, delay: 0.9, ease: 'linear' }}
            className="block h-full bg-plz-blue"
          />
        </span>
      </motion.div>
    </motion.div>
  );
}
