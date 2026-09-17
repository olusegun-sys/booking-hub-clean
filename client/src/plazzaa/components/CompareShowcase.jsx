import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Star } from 'lucide-react';
import { venueById, nairaShort } from '../lib/data';
import { revealUp, viewportOnce } from '../lib/motion';

const SHORTLIST = ['ayaba', 'kofa', 'ile'];

const ROWS = [
  { label: 'Dinner for two', get: (v) => nairaShort(v.forTwo) },
  { label: 'Area', get: (v) => v.area },
  { label: 'Good for', get: (v) => v.tags.slice(0, 2).join(', ') },
  { label: 'Rating', get: (v) => v.rating + ' (' + v.reviews + ')' }
];

/**
 * Three places you're deciding between, scattered — then scroll and they line
 * up into one comparison. The motion is the argument: this is what Plazzaa
 * does to a shortlist.
 */
export default function CompareShowcase() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const places = SHORTLIST.map(venueById).filter(Boolean);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'center 62%']
  });

  const spread = reduce ? 0 : 1;
  const leftX = useTransform(scrollYProgress, [0, 1], [-70 * spread, 0]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-4 * spread, 0]);
  const midY = useTransform(scrollYProgress, [0, 1], [40 * spread, 0]);
  const rightX = useTransform(scrollYProgress, [0, 1], [70 * spread, 0]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [4 * spread, 0]);
  const tableOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);

  const columnStyles = [
    { x: leftX, rotate: leftRotate },
    { y: midY },
    { x: rightX, rotate: rightRotate }
  ];

  return (
    <section className="bg-plz-surface py-18 md:py-30">
      <div className="plz-edge" ref={ref}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <motion.div
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-7"
          >
            <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Too many good options? Put them next to each other.
            </h2>
          </motion.div>
          <motion.p
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="max-w-[46ch] text-lead text-plz-body lg:col-span-5"
          >
            Compare places by price, area, ratings and what they&apos;re good for, without
            going back and forth between ten tabs.
          </motion.p>
        </div>

        <div className="-mx-6 mt-12 grid grid-cols-3 gap-3 overflow-x-clip px-6 md:gap-5">
          {places.map((place, index) => (
            <motion.div key={place.id} style={columnStyles[index]}>
              <div className="relative overflow-hidden rounded-visual bg-white">
                <img
                  src={place.image}
                  alt={`${place.name}, ${place.kind} in ${place.area}`}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover md:aspect-[3/2]"
                />
              </div>
              <div className="flex items-start justify-between gap-2 pt-3">
                <h3 className="text-[15px] font-semibold leading-tight text-plz-ink md:text-[18px]">
                  {place.name}
                </h3>
                <span className="hidden shrink-0 items-center gap-1 text-[14px] font-semibold text-plz-ink md:flex">
                  <Star size={13} className="fill-plz-yellow text-plz-yellow" />
                  {place.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div style={{ opacity: tableOpacity }} className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <caption className="sr-only">
              {places.map((p) => p.name).join(', ')} compared
            </caption>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-plz-line-strong">
                  <th
                    scope="row"
                    className="w-[128px] py-4 pr-4 align-top text-[13px] font-medium text-plz-body md:w-[180px]"
                  >
                    {row.label}
                  </th>
                  {places.map((place) => (
                    <td
                      key={place.id}
                      className="py-4 pr-4 align-top text-[15px] font-medium text-plz-ink md:text-[16px]"
                    >
                      {row.get(place)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-12">
          <Link to="/explore" className="plz-link-cta">
            Find places to compare
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
