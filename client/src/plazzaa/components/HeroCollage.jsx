import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { categories, cities, venues, venuesByCategory, nairaShort } from '../lib/data';
import { EASE, swapItem } from '../lib/motion';
import useMediaQuery from '../lib/useMediaQuery';

/**
 * The first screen is the product, not a picture of it.
 *
 * A scattered scene of places sits around the question. Choosing a category or
 * a city rearranges the scene. Scrolling parts it — the cards drift outward and
 * the answer to the question assembles in the middle. On phones the same idea
 * is recomposed vertically: statement, controls, then a rail you can push.
 */

// left/top are percentages of the stage; dx/dy is the direction each card
// travels as the collage opens. Deliberately uneven, not a ring.
const LAYOUT = [
  // top band — nothing sits in the middle third, that belongs to the question
  { key: 'a', left: 9,  top: 11,  w: 186, ratio: 'aspect-[4/5]',  dx: -300, dy: -110, z: 2 },
  { key: 'b', left: 21, top: 10,  w: 150, ratio: 'aspect-square', dx: -170, dy: -240, z: 1 },
  { key: 'c', left: 74, top: 10,  w: 208, ratio: 'aspect-[3/2]',  dx: 200,  dy: -230, z: 1 },
  { key: 'd', left: 93, top: 13,  w: 196, ratio: 'aspect-[4/5]',  dx: 320,  dy: -90,  z: 2 },
  // bottom band
  { key: 'e', left: 7,  top: 64, w: 204, ratio: 'aspect-[3/2]',  dx: -330, dy: 150,  z: 2 },
  { key: 'f', left: 27, top: 70, w: 162, ratio: 'aspect-square', dx: -180, dy: 250,  z: 1 },
  { key: 'g', left: 72, top: 67, w: 214, ratio: 'aspect-[3/2]',  dx: 240,  dy: 220,  z: 1 },
  { key: 'h', left: 93, top: 62, w: 178, ratio: 'aspect-square', dx: 340,  dy: 130,  z: 2 }
];

function CollageCard({ spec, venue, progress, reduce }) {
  const drift = reduce ? 0 : 1;
  const x = useTransform(progress, [0, 0.42], [0, spec.dx * drift]);
  const y = useTransform(progress, [0, 0.42], [0, spec.dy * drift]);
  const scale = useTransform(progress, [0, 0.42], [1, reduce ? 1 : 1.35]);
  const opacity = useTransform(progress, [0, 0.2, 0.36], [1, 1, 0]);

  return (
    <motion.figure
      className="absolute"
      style={{
        left: spec.left + '%',
        top: spec.top + '%',
        width: spec.w,
        x,
        y,
        scale,
        opacity,
        zIndex: spec.z,
        translateX: '-50%'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={venue.id}
          variants={swapItem}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative overflow-hidden rounded-visual bg-plz-surface"
        >
          <img
            src={venue.image}
            alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
            className={'block w-full object-cover ' + spec.ratio}
          />
        </motion.div>
      </AnimatePresence>
    </motion.figure>
  );
}

export default function HeroCollage({ category, setCategory, city, setCity }) {
  const stageRef = useRef(null);
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [hoveredBudget, setHoveredBudget] = useState(false);

  // Progress across the pinned range, measured live from layout. useScroll's
  // target/offset form reads the sticky child's moving box and ping-pongs, so
  // the stage owns its own maths: 0 when the section reaches the top of the
  // screen, 1 when it has been scrolled through.
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, (y) => {
    const el = stageRef.current;
    if (!el || typeof window === 'undefined') return 0;
    const top = el.getBoundingClientRect().top + y;
    const span = Math.max(1, el.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, (y - top) / span));
  });

  const statementOpacity = useTransform(scrollYProgress, [0, 0.18, 0.34], [1, 1, 0]);
  const statementY = useTransform(scrollYProgress, [0, 0.34], [0, reduce ? 0 : -60]);
  const answerOpacity = useTransform(scrollYProgress, [0.3, 0.46], [0, 1]);
  const answerScale = useTransform(scrollYProgress, [0.3, 0.46], [reduce ? 1 : 0.94, 1]);
  const answerY = useTransform(scrollYProgress, [0.3, 0.46], [reduce ? 0 : 28, 0]);
  const budgetCardX = useTransform(scrollYProgress, [0, 0.4], [0, reduce ? 0 : -260]);
  const moodCardX = useTransform(scrollYProgress, [0, 0.4], [0, reduce ? 0 : 280]);
  const annotationOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 1, 0]);

  const matches = venuesByCategory(category, city);

  // Chosen category first, then the rest of that city, then anywhere — so the
  // scene answers the filter without ever showing the same place twice.
  const pool = [];
  const seen = new Set();
  [...matches, ...venues.filter((v) => v.city === city), ...venues].forEach((v) => {
    if (!seen.has(v.id)) { seen.add(v.id); pool.push(v); }
  });
  const scene = LAYOUT.map((spec, i) => ({ spec, venue: pool[i % pool.length] }));
  const cheapest = matches.length
    ? Math.min(...matches.map((v) => v.forTwo))
    : Math.min(...venues.map((v) => v.forTwo));

  const controls = (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => {
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(active ? null : c.id)}
              aria-pressed={active}
              className={
                'h-11 rounded-full px-5 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
                (active
                  ? 'bg-plz-ink text-white'
                  : 'border border-plz-line bg-white text-plz-ink hover:border-plz-ink')
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 text-[15px] text-plz-body">
        <MapPin size={15} className="text-plz-grey" />
        <span>in</span>
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            aria-pressed={c === city}
            className={
              'ml-1 h-9 rounded-full px-3 text-[15px] font-semibold transition-colors duration-micro ease-plz ' +
              (c === city ? 'bg-plz-blue text-white' : 'text-plz-ink hover:bg-plz-surface')
            }
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  // ---------------- Mobile: vertical editorial, no scroll hijack -------------
  if (!isDesktop) {
    return (
      <section className="pt-[92px]">
        <div className="plz-edge">
          <h1 className="text-hero max-w-[15ch] text-plz-ink">
            Where could <span className="plz-serif italic">today</span> take you?
          </h1>
          <p className="mt-5 max-w-[46ch] text-lead text-plz-body">
            Discover somewhere new, plan around what you want to spend, and find something
            that fits tonight.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = c.id === category;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(active ? null : c.id)}
                    aria-pressed={active}
                    className={
                      'h-11 rounded-full px-4 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
                      (active ? 'bg-plz-ink text-white' : 'border border-plz-line text-plz-ink')
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-[15px] text-plz-body">
              <MapPin size={15} className="text-plz-grey" />
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  aria-pressed={c === city}
                  className={
                    'h-9 rounded-full px-3 font-semibold transition-colors duration-micro ease-plz ' +
                    (c === city ? 'bg-plz-blue text-white' : 'text-plz-ink')
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="plz-rail mt-8 px-4 pb-2">
          <AnimatePresence mode="popLayout">
            {(matches.length ? matches : venues).slice(0, 6).map((venue) => (
              <motion.figure
                key={venue.id}
                layout
                variants={swapItem}
                initial="hidden"
                animate="show"
                exit="exit"
                className="w-[74vw] max-w-[300px]"
              >
                <div className="relative overflow-hidden rounded-visual bg-plz-surface">
                  <img
                    src={venue.image}
                    alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
                    className="block aspect-[4/5] w-full object-cover"
                  />
                </div>
                <figcaption className="flex items-baseline justify-between gap-2 pt-3">
                  <span className="text-[16px] font-semibold text-plz-ink">{venue.name}</span>
                  <span className="text-[14px] text-plz-body">{nairaShort(venue.from)}</span>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>

        <div className="plz-edge mt-8">
          <div className="rounded-card bg-plz-cream p-5">
            <p className="text-[15px] text-plz-body">
              Two of you, tonight, in {city}
            </p>
            <p className="mt-1 text-h4 text-plz-ink">
              from {nairaShort(cheapest)}
            </p>
            <Link to="/explore" className="plz-btn plz-btn-primary mt-4 w-full">
              Explore places
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ---------------- Desktop: the collage opens as you scroll -----------------
  return (
    <section ref={stageRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-page">
          {/* the scene */}
          <div className="absolute inset-0" aria-hidden="true">
            {scene.map(({ spec, venue }) => (
              <CollageCard
                key={spec.key}
                spec={spec}
                venue={venue}
                progress={scrollYProgress}
                reduce={reduce}
              />
            ))}

            {/* two annotation cards carry Plazzaa's voice into the scene */}
            <motion.div
              className="absolute left-[3%] top-[40%] z-[4] w-[206px] rounded-card bg-plz-yellow p-4"
              style={{ x: budgetCardX, opacity: annotationOpacity }}
              onHoverStart={() => setHoveredBudget(true)}
              onHoverEnd={() => setHoveredBudget(false)}
            >
              <p className="text-[22px] font-semibold leading-none text-plz-ink">
                {nairaShort(cheapest)} tonight
              </p>
              <p className="mt-2 text-[14px] leading-snug text-plz-ink/70">
                {matches.length || venues.length} places in {city} fit that
              </p>
            </motion.div>

            <motion.div
              className="absolute right-[3%] top-[42%] z-[4] w-[216px] rounded-card border border-plz-line bg-white p-4"
              style={{ x: moodCardX, opacity: annotationOpacity }}
            >
              <p className="text-[14px] text-plz-body">Looking for somewhere calm?</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Date night', 'Outdoor', 'Under ₦40k'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-plz-surface px-2.5 py-1 text-[12px] font-medium text-plz-ink"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* the question */}
          <motion.div
            style={{ opacity: statementOpacity, y: statementY }}
            className="relative z-[5] flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-[13ch] text-hero text-plz-ink"
              style={{ textWrap: 'balance' }}
            >
              Where could <span className="plz-serif italic">today</span> take you?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-6 max-w-[52ch] text-lead text-plz-body"
            >
              Discover somewhere new, plan around what you want to spend, and find
              something that fits tonight.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="mt-10"
            >
              {controls}
            </motion.div>
          </motion.div>

          {/* the answer, assembled once the scene has parted */}
          <motion.div
            style={{ opacity: answerOpacity, scale: answerScale, y: answerY }}
            className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center px-6"
          >
            <div className="pointer-events-auto w-full max-w-[860px]">
              <p className="text-center text-h3 text-plz-ink">
                {hoveredBudget ? 'Still within budget' : 'Tonight in ' + city}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-5">
                {(matches.length ? matches : venues).slice(0, 3).map((venue) => (
                  <Link key={venue.id} to="/explore" className="group block">
                    <div className="relative overflow-hidden rounded-visual bg-plz-surface">
                      <img
                        src={venue.image}
                        alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
                        className="block aspect-[4/5] w-full object-cover transition-transform duration-editorial ease-plz group-hover:scale-[1.025]"
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-2 pt-3">
                      <span className="text-[17px] font-semibold text-plz-ink">{venue.name}</span>
                      <span className="text-[14px] text-plz-body">{nairaShort(venue.from)}</span>
                    </div>
                    <p className="text-[14px] text-plz-grey">{venue.kind} · {venue.area}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Link to="/explore" className="plz-btn plz-btn-primary">
                  Explore places
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
