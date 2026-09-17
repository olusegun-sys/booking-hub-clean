import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { EASE } from '../lib/motion';

const DOORS = [
  { to: '/explore', eyebrow: 'Somewhere to go?', label: 'Explore places', short: 'Explore places' },
  { to: '/business', eyebrow: 'Run a business?', label: 'Plazzaa for Business', short: 'For business' }
];

/**
 * The two doors, always in reach. Design system section 7: a persistent product
 * control, not a banner, and the labels describe intent rather than asking
 * anyone to classify themselves.
 *
 * Neither door is pre-selected — they are both just open. The page you are
 * currently on is marked with a quiet dot for orientation, and the fill only
 * appears under the pointer or the press.
 */
export default function GatewayBar() {
  const reduce = useReducedMotion();
  const { pathname } = useLocation();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.5 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="plz-edge flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-[600px] items-stretch gap-1 rounded-[16px] border border-plz-line bg-white/95 p-[6px] shadow-panel backdrop-blur-sm sm:w-auto">
          {DOORS.map((door) => {
            const here = pathname === door.to;
            return (
              <Link
                key={door.to}
                to={door.to}
                aria-current={here ? 'page' : undefined}
                className="group relative flex flex-1 items-center justify-between gap-3 rounded-[11px] px-4 py-3 text-plz-ink transition-colors duration-micro ease-plz hover:bg-plz-surface active:bg-plz-line/60 sm:flex-none sm:px-5"
              >
                <span className="flex flex-col text-left leading-tight">
                  <span className="hidden items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.09em] text-plz-grey sm:flex">
                    {here && <span className="h-1.5 w-1.5 rounded-full bg-plz-blue" aria-hidden="true" />}
                    {door.eyebrow}
                  </span>
                  <span className="whitespace-nowrap text-[15px] font-semibold">
                    <span className="sm:hidden">{door.short}</span>
                    <span className="hidden sm:inline">{door.label}</span>
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-plz-grey transition-all duration-micro ease-plz group-hover:translate-x-1 group-hover:text-plz-ink"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
