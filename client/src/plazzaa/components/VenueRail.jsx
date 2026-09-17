import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VenueCard from './VenueCard';
import { swapItem } from '../lib/motion';

/**
 * One horizontal row of places. Arrows appear on desktop where there is
 * something to scroll to; on a phone you just push the row.
 */
export default function VenueRail({ title, note, venues, ratio = 'landscape', priceFor, id }) {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    });
  };

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [venues]);

  const nudge = (direction) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (!venues.length) return null;

  return (
    <section id={id} className="py-8 md:py-10">
      <div className="plz-edge">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-h3 text-plz-ink">{title}</h2>
            {note && <p className="mt-1 text-[15px] text-plz-body">{note}</p>}
          </div>

          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={edges.start}
              aria-label={`Scroll ${title} left`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-plz-line text-plz-ink transition-colors duration-micro ease-plz hover:border-plz-ink disabled:opacity-35 disabled:hover:border-plz-line"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={edges.end}
              aria-label={`Scroll ${title} right`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-plz-line text-plz-ink transition-colors duration-micro ease-plz hover:border-plz-ink disabled:opacity-35 disabled:hover:border-plz-line"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div ref={railRef} className="plz-rail mt-5 px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8">
        <AnimatePresence mode="popLayout">
          {venues.map((venue) => (
            <motion.div
              key={venue.id}
              layout
              variants={swapItem}
              initial="hidden"
              animate="show"
              exit="exit"
              className={ratio === 'portrait' ? 'w-[64vw] max-w-[260px]' : 'w-[78vw] max-w-[340px]'}
            >
              <VenueCard
                venue={venue}
                ratio={ratio}
                priceLabel={priceFor ? priceFor(venue) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
