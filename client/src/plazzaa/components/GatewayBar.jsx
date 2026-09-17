import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { EASE } from '../lib/motion';

/**
 * The two doors, always within reach. Design system section 7: a persistent
 * product control, not a banner — and the labels describe intent rather than
 * asking someone to classify themselves as a customer or a merchant.
 *
 * Desktop: a floating pill above the fold line.
 * Mobile: a bottom-safe bar with the same two paths.
 */
export default function GatewayBar({ emphasis = 'customer' }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="plz-edge flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-[620px] items-stretch gap-1 rounded-[16px] border border-plz-line bg-white p-[6px] shadow-panel sm:w-auto">
          <Link
            to="/explore"
            className={
              'group flex flex-1 items-center justify-between gap-3 rounded-[11px] px-4 py-3 transition-colors duration-micro ease-plz sm:flex-none sm:px-5 ' +
              (emphasis === 'customer' ? 'bg-plz-ink text-white' : 'text-plz-ink hover:bg-plz-surface')
            }
          >
            <span className="flex flex-col text-left leading-tight">
              <span
                className={
                  'hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.09em] sm:block ' +
                  (emphasis === 'customer' ? 'text-white/60' : 'text-plz-grey')
                }
              >
                Somewhere to go?
              </span>
              <span className="whitespace-nowrap text-[15px] font-semibold">Explore places</span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 transition-transform duration-micro ease-plz group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/business"
            className={
              'group flex flex-1 items-center justify-between gap-3 rounded-[11px] px-4 py-3 transition-colors duration-micro ease-plz sm:flex-none sm:px-5 ' +
              (emphasis === 'merchant' ? 'bg-plz-ink text-white' : 'text-plz-ink hover:bg-plz-surface')
            }
          >
            <span className="flex flex-col text-left leading-tight">
              <span
                className={
                  'hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.09em] sm:block ' +
                  (emphasis === 'merchant' ? 'text-white/60' : 'text-plz-grey')
                }
              >
                Run a business?
              </span>
              <span className="whitespace-nowrap text-[15px] font-semibold">
                <span className="sm:hidden">For business</span>
                <span className="hidden sm:inline">Plazzaa for Business</span>
              </span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 transition-transform duration-micro ease-plz group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
