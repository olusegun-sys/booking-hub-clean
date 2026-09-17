import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { dmChaos, merchantServices, naira } from '../lib/data';
import { EASE } from '../lib/motion';

/**
 * The merchant hero's argument, played rather than described: the same five
 * questions that land in a salon's DMs every week pile up, then collapse into
 * one booking link. Runs once on load, and holds on the resolved state.
 */
export default function DMCollapse() {
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(reduce);

  useEffect(() => {
    if (reduce) return undefined;
    const timer = setTimeout(() => setCollapsed(true), 2600);
    return () => clearTimeout(timer);
  }, [reduce]);

  return (
    <div className="relative min-h-[430px] overflow-x-clip md:min-h-[520px]">
      <AnimatePresence mode="wait">
        {!collapsed ? (
          <motion.ul
            key="chaos"
            className="absolute inset-0 flex flex-col justify-center gap-3"
            exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: EASE }}
            aria-label="Booking questions arriving as direct messages"
          >
            {dmChaos.map((message, index) => (
              <motion.li
                key={message.text}
                initial={{ opacity: 0, y: 16, x: index % 2 ? 26 : -18 }}
                animate={{ opacity: 1, y: 0, x: index % 2 ? 26 : -18 }}
                transition={{ duration: 0.34, ease: EASE, delay: index * 0.38 }}
                className={
                  'max-w-[78%] rounded-[18px] px-4 py-3 text-[15px] md:text-[16px] ' +
                  (index % 2
                    ? 'self-end rounded-br-[6px] bg-plz-ink text-white'
                    : 'self-start rounded-bl-[6px] bg-white text-plz-ink')
                }
              >
                {message.text}
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="link"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="absolute inset-0 flex items-center"
          >
            <div className="w-full rounded-visual border border-plz-line bg-white p-6 shadow-lift md:p-7">
              <p className="font-mono text-[14px] text-plz-blue md:text-[15px]">
                plazzaa.com/glowspa
              </p>
              <h3 className="mt-4 text-h4 text-plz-ink">Glow Spa, Lekki</h3>

              <ul className="mt-5 divide-y divide-plz-line">
                {merchantServices.map((service) => (
                  <li key={service.name} className="flex items-center justify-between py-3">
                    <span className="text-[15px] font-medium text-plz-ink">{service.name}</span>
                    <span className="text-[14px] text-plz-body">
                      {naira(service.price)} · {service.minutes} mins
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Sat 11:00', 'Sat 13:30', 'Sat 16:00'].map((slot, i) => (
                  <span
                    key={slot}
                    className={
                      'rounded-ctl px-3 py-2 text-[14px] font-medium ' +
                      (i === 1 ? 'bg-plz-blue text-white' : 'bg-plz-surface text-plz-ink')
                    }
                  >
                    {slot}
                  </span>
                ))}
              </div>

              <p className="mt-5 flex items-center gap-2 text-[14px] text-plz-body">
                <Check size={16} className="text-plz-blue" strokeWidth={2.5} />
                Booked in 40 seconds, no account needed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
