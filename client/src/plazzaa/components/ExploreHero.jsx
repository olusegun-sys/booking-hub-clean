import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { Star } from 'lucide-react';
import ExploreSearch from './ExploreSearch';
import HoverImage from './HoverImage';
import { venues, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

// The prints stacked behind the search panel, and how far each one drifts
// with the pointer. Depth reads as distance: small numbers sit further back.
const STACK = [
  { id: 'kofa', className: 'absolute left-[2%] top-[4%] w-[40%]', ratio: 'aspect-[4/5]', drift: 26 },
  { id: 'suya', className: 'absolute left-[46%] top-[0%] w-[30%]', ratio: 'aspect-square', drift: 14 },
  { id: 'ruwa', className: 'absolute left-[78%] top-[12%] w-[30%]', ratio: 'aspect-[4/5]', drift: 34 },
  { id: 'ilaje', className: 'absolute left-[8%] top-[56%] w-[34%]', ratio: 'aspect-[3/2]', drift: 20 },
  { id: 'court24', className: 'absolute left-[48%] top-[52%] w-[32%]', ratio: 'aspect-[3/2]', drift: 30 },
  { id: 'maitama-sky', className: 'absolute left-[84%] top-[62%] w-[26%]', ratio: 'aspect-square', drift: 16 }
];

/**
 * The marketplace opens the way a travel search engine does — the tool first,
 * with the places it searches stacked behind it. The stack answers the pointer,
 * so the hero has depth without a carousel.
 */
export default function ExploreHero({ search }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const px = useSpring(useMotionValue(0), { stiffness: 120, damping: 24 });
  const py = useSpring(useMotionValue(0), { stiffness: 120, damping: 24 });

  const onPointerMove = (event) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { px.set(0); py.set(0); }}
      className="relative overflow-hidden border-b border-plz-line bg-plz-surface"
    >
      <div className="plz-edge relative grid gap-10 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="relative z-[2] lg:col-span-7">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-h1 text-plz-ink"
            style={{ textWrap: 'balance' }}
          >
            What are you <span className="plz-serif italic">looking for</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-3 text-lead text-plz-body"
          >
            Search places in Lagos and Abuja by what you want and what you want to spend.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
            className="mt-7"
          >
            <ExploreSearch {...search} />
          </motion.div>
        </div>

        {/* the stack of places, drifting with the pointer */}
        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="relative h-[340px]">
            {STACK.map((item, index) => {
              const venue = venues.find((v) => v.id === item.id);
              if (!venue) return null;
              return (
                <Print
                  key={item.id}
                  item={item}
                  venue={venue}
                  index={index}
                  px={px}
                  py={py}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Print({ item, venue, index, px, py }) {
  const x = useTransform(px, (v) => v * -item.drift);
  const y = useTransform(py, (v) => v * -item.drift * 0.7);

  return (
    <motion.div
      className={item.className}
      style={{ x, y, zIndex: 10 - index }}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.2 + index * 0.07 }}
    >
      <div className="relative">
        <HoverImage
          src={venue.image}
          alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
          ratio={item.ratio}
          eager={index < 3}
        />
        <div className="pointer-events-none absolute -bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-lift">
          <Star size={11} className="fill-plz-yellow text-plz-yellow" />
          <span className="text-[12px] font-semibold text-plz-ink">{venue.rating}</span>
          <span className="text-[12px] text-plz-body">· {nairaShort(venue.from)}</span>
        </div>
      </div>
    </motion.div>
  );
}
