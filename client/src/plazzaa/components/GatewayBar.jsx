import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { EASE } from '../lib/motion';

const DOORS = [
  { to: '/explore', eyebrow: 'Somewhere to go?', label: 'Explore places', short: 'Explore places' },
  { to: '/business', eyebrow: 'Run a business?', label: 'Plazzaa for Business', short: 'For business' }
];

/**
 * The two doors, always in reach — but not during the opening.
 *
 * On the landing page the hero already carries both calls to action, so a
 * floating bar over it is just clutter sitting on the brand moment. Pass
 * `revealAfter` with a selector and the bar waits until that section has been
 * scrolled past, then rises into place and stays for the rest of the page.
 *
 * Neither door is pre-selected; the page you are on gets a quiet dot.
 */
export default function GatewayBar({ revealAfter }) {
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(!revealAfter);

  useEffect(() => {
    if (!revealAfter) {
      setVisible(true);
      return undefined;
    }

    const check = () => {
      const gate = document.querySelector(revealAfter);
      if (!gate) return;
      // Reveal once the gating section has left the top of the screen.
      const past = gate.getBoundingClientRect().bottom <= window.innerHeight * 0.4;
      setVisible((was) => (was === past ? was : past));
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [revealAfter]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="gateway"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
          transition={{ duration: 0.45, ease: EASE }}
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
      )}
    </AnimatePresence>
  );
}
