import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Plus, Star, X } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import { venues, venueById, nairaShort } from '../lib/data';
import { step, mix, band } from '../lib/phase';
import useMediaQuery from '../lib/useMediaQuery';

const POOL = ['ayaba', 'kofa', 'ile', 'ilaje'];
const MIN_COMPARE = 2;
const MAX_COMPARE = 4;

const ROWS = [
  { label: 'Dinner for two', get: (v) => nairaShort(v.forTwo) },
  { label: 'Area', get: (v) => v.area },
  { label: 'Good for', get: (v) => v.tags.slice(0, 2).join(', ') },
  { label: 'Rating', get: (v) => `${v.rating} (${v.reviews})` }
];

/**
 * COMPARE — functional rather than cinematic. Cards that were scattered slide
 * into one aligned rank and the comparison writes itself underneath them, row
 * by row. Then it hands you the controls: add or drop a place and the table
 * follows, holding the product's real rules — at least two, never more than
 * four.
 *
 *   0.00 → 0.16  the claim
 *   0.16 → 0.46  four places converge into one rank
 *   0.44 → 0.68  the comparison writes in beneath them
 *   0.68 → 0.92  the selection controls become live
 */
function Scene({ progress }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(POOL.slice(0, 3));

  const places = selected.map(venueById).filter(Boolean);
  const spare = venues.filter((v) => !selected.includes(v.id)).slice(0, 4);

  const toggle = (id) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.length > MIN_COMPARE ? current.filter((x) => x !== id) : current;
      }
      return current.length < MAX_COMPARE ? [...current, id] : current;
    });
  };

  const headOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.05, 0.9, 0.06, 0.08)));
  const headY = useTransform(progress, (p) => (reduce ? 0 : mix(40, 0, step(p, 0, 0.16))));
  const tableOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.5, 0.9, 0.1, 0.06)));
  const controlsOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.72, 0.92, 0.08, 0.06)));

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden py-16">
      <div className="plz-edge">
        <motion.div style={{ opacity: headOpacity, y: headY }} className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h2 text-plz-ink lg:col-span-6" style={{ textWrap: 'balance' }}>
            Good options deserve a <span className="plz-serif italic text-plz-blue">closer look</span>.
          </h2>
          <p className="max-w-[48ch] text-lead text-plz-body lg:col-span-6">
            Compare places by price, menu, ratings and offers — side by side, without going
            back and forth.
          </p>
        </motion.div>

        {/* ------------------------------------------- the rank of places */}
        <div className="relative mt-8 h-[190px] md:mt-10 md:h-[240px]">
          <AnimatePresence initial={false}>
            {places.map((place, index) => (
              <ComparedCard
                key={place.id}
                place={place}
                index={index}
                total={places.length}
                progress={progress}
                reduce={reduce}
                isDesktop={isDesktop}
                onRemove={() => toggle(place.id)}
                removable={places.length > MIN_COMPARE}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------ the comparison */}
        <motion.div style={{ opacity: tableOpacity }} className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <caption className="sr-only">
              {places.map((p) => p.name).join(', ')} compared
            </caption>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-plz-line-strong">
                  <th
                    scope="row"
                    className="w-[124px] py-3 pr-4 align-top text-[13px] font-medium text-plz-body md:w-[170px]"
                  >
                    {row.label}
                  </th>
                  {places.map((place) => (
                    <td
                      key={place.id}
                      className="py-3 pr-4 align-top text-[15px] font-medium text-plz-ink"
                    >
                      {row.get(place)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* --------------------------------------------- live selection */}
        <motion.div
          style={{ opacity: controlsOpacity }}
          className="mt-6 flex flex-wrap items-center gap-3 border-t border-plz-line pt-5"
        >
          <span className="text-[14px] font-semibold text-plz-ink">
            Comparing {places.length} of {MAX_COMPARE}
          </span>
          <span className="text-[13px] text-plz-body">
            {places.length <= MIN_COMPARE
              ? `Keep at least ${MIN_COMPARE}`
              : 'Tap a place to drop it'}
          </span>

          <div className="ml-auto flex flex-wrap gap-2">
            {spare.map((venue) => {
              const full = places.length >= MAX_COMPARE;
              return (
                <motion.button
                  key={venue.id}
                  type="button"
                  onClick={() => toggle(venue.id)}
                  disabled={full}
                  whileHover={full ? undefined : { y: -2 }}
                  whileTap={full ? undefined : { scale: 0.96 }}
                  className={
                    'flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors duration-micro ease-plz ' +
                    (full
                      ? 'cursor-not-allowed border-plz-line text-plz-grey'
                      : 'border-plz-line text-plz-ink hover:border-plz-ink')
                  }
                >
                  <Plus size={13} />
                  {venue.name}
                </motion.button>
              );
            })}
          </div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link to="/explore#compare" className="plz-btn plz-btn-primary w-full sm:w-auto">
              Compare places
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/** One place in the rank: arrives from a scattered start, aligns, stays live. */
function ComparedCard({ place, index, total, progress, reduce, isDesktop, onRemove, removable }) {
  const spread = [
    { x: -0.34, y: -0.1, r: -7 },
    { x: 0.3, y: 0.16, r: 6 },
    { x: -0.12, y: 0.24, r: -3 },
    { x: 0.36, y: -0.16, r: 8 }
  ][index % 4];

  const columnWidth = isDesktop ? 236 : 150;
  const alignedX = (index - (total - 1) / 2) * (columnWidth + (isDesktop ? 22 : 12));

  const x = useTransform(progress, (p) =>
    reduce ? alignedX : mix(spread.x * 900, alignedX, step(p, 0.16, 0.46 + index * 0.03))
  );
  const y = useTransform(progress, (p) =>
    reduce ? 0 : mix(spread.y * 420, 0, step(p, 0.16, 0.46 + index * 0.03))
  );
  const rotate = useTransform(progress, (p) =>
    reduce ? 0 : mix(spread.r, 0, step(p, 0.16, 0.5))
  );
  const opacity = useTransform(progress, (p) =>
    reduce ? 1 : step(p, 0.1, 0.24) * (1 - step(p, 0.92, 1))
  );

  return (
    <motion.div
      layout
      className="absolute left-1/2 top-0"
      style={{ x, y, rotate, opacity, width: columnWidth, marginLeft: -columnWidth / 2 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="group relative"
      >
        <div className="relative overflow-hidden rounded-visual bg-white">
          <img
            src={place.image}
            alt={`${place.name}, ${place.kind} in ${place.area}`}
            loading="lazy"
            className="block aspect-[3/2] w-full object-cover"
          />
          {removable && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${place.name} from the comparison`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-plz-ink opacity-0 transition-opacity duration-micro ease-plz group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X size={14} />
            </button>
          )}
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-plz-blue px-2 py-1 text-[11px] font-semibold text-white">
            <Check size={11} strokeWidth={3} />
            Comparing
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 pt-2.5">
          <p className="truncate text-[15px] font-semibold text-plz-ink">{place.name}</p>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-plz-ink">
            <Star size={12} className="fill-plz-yellow text-plz-yellow" />
            {place.rating}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CompareStage() {
  return (
    <ScrollStage id="compare" length={3.6} mobileLength={3} backdrop="#F4F4F5">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
