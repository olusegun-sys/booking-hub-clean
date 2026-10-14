import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, MapPin, Users, UtensilsCrossed } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import { budgetPlans, venueById, naira, nairaShort } from '../lib/data';
import { step, mix, band } from '../lib/phase';
import useViewport from '../lib/useViewport';
import useMediaQuery from '../lib/useMediaQuery';

const MIN = 5000;
const MAX = 200000;
const STEP = 5000;

/**
 * BUDGET — convergence onto a number.
 *
 *   0.00 → 0.18  the panel arrives and the amount is set
 *   0.18 → 0.46  scattered places travel in toward the amount
 *   0.42 → 0.60  the amount takes the screen; the places tuck behind it
 *   0.60 → 0.86  they spread back out as a priced, budget-checked row
 *   0.86 → 1.00  the row lifts away
 *
 * Different shape to the hero on purpose: nothing goes full-bleed here, the
 * focal point is a number, and the payload is a readable result rather than a
 * photograph. The slider stays live the whole way through.
 */
function Scene({ progress }) {
  const [budget, setBudget] = useState(40000);
  const [people, setPeople] = useState(2);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { width } = useViewport();
  const reduce = useReducedMotion();

  const fill = ((budget - MIN) / (MAX - MIN)) * 100;

  const results = budgetPlans.map((plan) => {
    const low = Math.round((budget * plan.share[0]) / 1000) * 1000;
    const high = Math.round((budget * plan.share[1]) / 1000) * 1000;
    return { plan, low, high, fits: high <= budget, venue: venueById(plan.venueIds[0]) };
  });

  const panelOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.06, 0.9, 0.08, 0.08)));
  const panelY = useTransform(progress, (p) => (reduce ? 0 : mix(46, 0, step(p, 0, 0.18))));

  // The amount grows as the places arrive at it, then settles back.
  const amountScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(1, isDesktop ? 1.5 : 1.25, step(p, 0.3, 0.52)) * (1 - 0.32 * step(p, 0.58, 0.72))
  );

  const rowOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.64, 0.88, 0.1, 0.08)));
  const amountOpacity = useTransform(progress, (p) => (reduce ? 0 : band(p, 0.34, 0.62, 0.1, 0.08)));

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden">
      <div className="plz-edge">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ------------------------------------------- the interactive panel */}
          <motion.div style={{ opacity: panelOpacity, y: panelY }} className="lg:col-span-5">
            <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Start with what you&apos;ve got.
              <span className="mt-1 block plz-serif italic text-plz-blue">
                See where it can take you.
              </span>
            </h2>
            <p className="mt-4 max-w-[42ch] text-lead text-plz-body">
              Set your budget and explore places and experiences that fit your plans.
            </p>

            <div className="mt-8 rounded-card border border-plz-line bg-white p-5 md:p-6">
              <label htmlFor="plz-budget" className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-body">
                Your budget
              </label>
              <output
                htmlFor="plz-budget"
                className="mt-2 block text-[clamp(38px,4.6vw,56px)] font-medium leading-none tracking-[-0.03em] text-plz-ink"
              >
                {naira(budget)}
              </output>

              <input
                id="plz-budget"
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="plz-range mt-5"
                aria-valuetext={naira(budget)}
                style={{
                  background: `linear-gradient(to right, #2D60EA 0%, #2D60EA ${fill}%, #E4E4E7 ${fill}%, #E4E4E7 100%)`
                }}
              />
              <div className="mt-2 flex justify-between text-[13px] text-plz-body">
                <span>{nairaShort(MIN)}</span>
                <span>{nairaShort(MAX)}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-plz-line pt-5">
                <span className="flex items-center gap-1.5 rounded-ctl bg-plz-surface px-3 py-2 text-[14px] font-medium text-plz-ink">
                  <MapPin size={14} className="text-plz-grey" /> Lagos
                </span>
                <span className="flex items-center gap-1.5 rounded-ctl bg-plz-surface px-3 py-2 text-[14px] font-medium text-plz-ink">
                  <UtensilsCrossed size={14} className="text-plz-grey" /> Dinner
                </span>
                <button
                  type="button"
                  onClick={() => setPeople((n) => (n >= 6 ? 1 : n + 1))}
                  className="flex items-center gap-1.5 rounded-ctl bg-plz-surface px-3 py-2 text-[14px] font-medium text-plz-ink transition-colors duration-micro ease-plz hover:bg-plz-line/70"
                  aria-label={`Party size: ${people}. Tap to change.`}
                >
                  <Users size={14} className="text-plz-grey" /> {people} {people === 1 ? 'person' : 'people'}
                </button>
              </div>
            </div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-6 inline-block">
              <Link to="/explore#budget" className="plz-btn plz-btn-primary">
                Plan with my budget
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* ------------------------------------- the places, converging on it */}
          <div className="relative min-h-[380px] lg:col-span-7 lg:min-h-[540px]">
            {/* the amount, as the thing everything gathers around */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
              style={{ opacity: amountOpacity, scale: amountScale }}
            >
              <div className="text-center">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-plz-body">
                  {people} {people === 1 ? 'person' : 'people'} · Lagos
                </p>
                <p className="mt-2 text-[clamp(44px,6vw,76px)] font-medium leading-none tracking-[-0.035em] text-plz-ink">
                  {naira(budget)}
                </p>
              </div>
            </motion.div>

            {results.map((result, index) => (
              <ConvergingPlace
                key={result.plan.id}
                result={result}
                index={index}
                total={results.length}
                progress={progress}
                reduce={reduce}
                isDesktop={isDesktop}
                width={width}
              />
            ))}
          </div>
        </div>

        {/* ------------------------------------------------- the priced result */}
        <motion.ul
          style={{ opacity: rowOpacity }}
          className="pointer-events-none mt-6 hidden gap-3 lg:grid lg:grid-cols-3"
        >
          {results.map((result) => (
            <li
              key={result.plan.id}
              className="flex items-center justify-between gap-3 rounded-card border border-plz-line bg-white px-4 py-3"
            >
              <span className="text-[15px] font-medium text-plz-ink">{result.plan.label}</span>
              <span
                className={
                  'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ' +
                  (result.fits ? 'bg-plz-blue-wash text-plz-blue' : 'bg-plz-cream text-plz-ink')
                }
              >
                {result.fits && <Check size={12} strokeWidth={3} />}
                {result.fits ? 'Within budget' : 'A stretch'}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

/** One place: scattered, pulled to the amount, then laid out as a priced card. */
function ConvergingPlace({ result, index, total, progress, reduce, isDesktop, width }) {
  const { plan, low, high, fits, venue } = result;

  // Where it starts, where it ends up in the result row — both as offsets from
  // the middle of the column.
  const spread = isDesktop ? 1 : 0.62;
  const start = [
    { x: -230 * spread, y: -150 * spread },
    { x: 240 * spread, y: -40 * spread },
    { x: -120 * spread, y: 180 * spread }
  ][index % 3];
  const laid = { x: (index - (total - 1) / 2) * (isDesktop ? 232 : 118), y: isDesktop ? 40 : 30 };

  const x = useTransform(progress, (p) => {
    if (reduce) return laid.x;
    const gather = step(p, 0.18, 0.46);
    const lay = step(p, 0.6, 0.84);
    return mix(mix(start.x, 0, gather), laid.x, lay);
  });

  const y = useTransform(progress, (p) => {
    if (reduce) return laid.y;
    const gather = step(p, 0.18, 0.46);
    const lay = step(p, 0.6, 0.84);
    return mix(mix(start.y, 0, gather), laid.y, lay);
  });

  const scale = useTransform(progress, (p) => {
    if (reduce) return 1;
    const gather = step(p, 0.18, 0.46);
    const lay = step(p, 0.6, 0.84);
    return mix(mix(1, 0.72, gather), 1, lay);
  });

  const opacity = useTransform(progress, (p) => {
    if (reduce) return 1;
    const appear = step(p, 0.08, 0.2);
    const behind = step(p, 0.42, 0.54) * 0.82; // tucked behind the amount
    const back = step(p, 0.6, 0.7) * 0.82;
    const leave = step(p, 0.88, 0.98);
    return appear * (1 - behind + back) * (1 - leave);
  });

  const detailOpacity = useTransform(progress, (p) => (reduce ? 1 : step(p, 0.66, 0.8)));

  return (
    // Centring lives on the wrapper in plain CSS; the motion element only
    // carries the scroll transforms, so the two can't overwrite each other.
    <div
      className="absolute left-1/2 top-1/2 w-[180px] md:w-[210px]"
      style={{ transform: 'translate(-50%, -50%)', zIndex: 2 }}
    >
    <motion.article style={{ x, y, scale, opacity }}>
      <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 340, damping: 26 }}>
        <div className="relative overflow-hidden rounded-visual bg-plz-surface">
          <img
            src={venue.image}
            alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
            loading="lazy"
            className="block aspect-[4/3] w-full object-cover"
          />
          <motion.span
            style={{ opacity: detailOpacity }}
            className={
              'absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
              (fits ? 'bg-white text-plz-blue' : 'bg-plz-cream text-plz-ink')
            }
          >
            {fits ? 'Within budget' : 'A stretch'}
          </motion.span>
        </div>
        <motion.div style={{ opacity: detailOpacity }} className="pt-2.5">
          <p className="truncate text-[15px] font-semibold text-plz-ink">{venue.name}</p>
          <p className="truncate text-[13px] text-plz-body">{venue.area}</p>
          <p className="mt-1 text-[14px] font-semibold text-plz-ink">
            Est. {nairaShort(low)}–{nairaShort(high)}
          </p>
        </motion.div>
      </motion.div>
    </motion.article>
    </div>
  );
}

export default function BudgetStage() {
  return (
    <ScrollStage id="budget" length={3.6} mobileLength={3} backdrop="#FFFFFF">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
