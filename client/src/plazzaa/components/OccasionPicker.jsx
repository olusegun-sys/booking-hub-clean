import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { occasions, venueById, nairaShort } from '../lib/data';
import { revealUp, viewportOnce, swapItem, EASE } from '../lib/motion';

/**
 * You know the occasion, not the place. Picking one rearranges what's on the
 * page underneath it — the answer changes in front of you rather than on the
 * next screen.
 */
export default function OccasionPicker() {
  const [active, setActive] = useState(occasions[0].id);
  const current = occasions.find((o) => o.id === active) || occasions[0];
  const places = current.venues.map(venueById).filter(Boolean);

  return (
    <section id="experiences" className="py-18 md:py-30">
      <div className="plz-edge">
        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-[22ch] md:max-w-[26ch]"
        >
          <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
            Sometimes you know the occasion. You just don&apos;t know the place.
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-2 md:mt-12">
          {occasions.map((occasion) => {
            const isActive = occasion.id === active;
            return (
              <button
                key={occasion.id}
                type="button"
                onClick={() => setActive(occasion.id)}
                aria-pressed={isActive}
                className={
                  'h-12 rounded-full px-5 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
                  (isActive
                    ? 'bg-plz-yellow text-plz-ink'
                    : 'border border-plz-line text-plz-ink hover:border-plz-ink')
                }
              >
                {occasion.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {places.map((place, index) => (
              <motion.article
                key={current.id + '-' + place.id}
                layout
                variants={swapItem}
                initial="hidden"
                animate="show"
                exit="exit"
                transition={{ duration: 0.34, ease: EASE, delay: index * 0.05 }}
                className={
                  'group ' + (index === 0 ? 'lg:row-span-2' : '')
                }
              >
                <Link to="/explore" className="block">
                  <div
                    className="relative overflow-hidden rounded-visual bg-plz-surface"
                  >
                    <img
                      src={place.image}
                      alt={`${place.name}, ${place.kind} in ${place.area}`}
                      loading="lazy"
                      className={
                        'block w-full object-cover transition-transform duration-editorial ease-plz group-hover:scale-[1.025] ' +
                        (index === 0 ? 'aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[3/2]')
                      }
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-3 pt-4">
                    <h3 className="text-h4 text-plz-ink">{place.name}</h3>
                    <span className="shrink-0 text-[15px] text-plz-body">
                      from {nairaShort(place.from)}
                    </span>
                  </div>
                  <p className="mt-1 max-w-[46ch] text-[15px] text-plz-body">{place.blurb}</p>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12">
          <Link to="/explore#experiences" className="plz-link-cta">
            Explore experiences
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
