import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';
import HoverImage from '../components/HoverImage';
import { categories, cities, venues, venuesByCategory, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';
import useMediaQuery from '../lib/useMediaQuery';

// Where each print sits, and the direction it travels when the scene opens.
const SCENE = [
  { left: 8,  top: 10, w: 200, ratio: 'aspect-[4/5]',  vec: [-320, -110], depth: 1.5 },
  { left: 22, top: 9,  w: 156, ratio: 'aspect-square', vec: [-170, -250], depth: 1.1 },
  { left: 75, top: 9,  w: 214, ratio: 'aspect-[3/2]',  vec: [220, -240],  depth: 1.2 },
  { left: 93, top: 13, w: 200, ratio: 'aspect-[4/5]',  vec: [330, -90],   depth: 1.6 },
  { left: 6,  top: 63, w: 208, ratio: 'aspect-[3/2]',  vec: [-340, 160],  depth: 1.5 },
  { left: 27, top: 70, w: 166, ratio: 'aspect-square', vec: [-180, 260],  depth: 1.1 },
  { left: 73, top: 66, w: 220, ratio: 'aspect-[3/2]',  vec: [250, 230],   depth: 1.3 },
  { left: 94, top: 62, w: 182, ratio: 'aspect-square', vec: [350, 140],   depth: 1.6 }
];

// Same scene on a phone, fewer prints and closer to the edges.
const SCENE_MOBILE = [
  { left: 20, top: 9,  w: 132, ratio: 'aspect-[4/5]',  vec: [-150, -190], depth: 1.3 },
  { left: 82, top: 12, w: 122, ratio: 'aspect-square', vec: [170, -160],  depth: 1.2 },
  { left: 16, top: 73, w: 128, ratio: 'aspect-square', vec: [-160, 200],  depth: 1.3 },
  { left: 84, top: 70, w: 138, ratio: 'aspect-[4/5]',  vec: [180, 190],   depth: 1.4 }
];

/**
 * The first stage. A scene of places you could be tonight sits around the
 * question; choosing a category or city rearranges it. Scrolling sends the
 * prints back out past the camera and the answer assembles in the space they
 * leave behind.
 */
export default function HeroStage({ category, setCategory, city, setCity }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [hovering, setHovering] = useState(null);

  const matches = venuesByCategory(category, city);
  const pool = [];
  const seen = new Set();
  [...matches, ...venues.filter((v) => v.city === city), ...venues].forEach((v) => {
    if (!seen.has(v.id)) { seen.add(v.id); pool.push(v); }
  });
  const answer = (matches.length ? matches : pool).slice(0, isDesktop ? 3 : 2);
  const cheapest = Math.min(...(matches.length ? matches : venues).map((v) => v.forTwo));

  const chips = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((c) => {
        const active = c.id === category;
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => setCategory(active ? null : c.id)}
            aria-pressed={active}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={
              'h-11 rounded-full px-5 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
              (active
                ? 'bg-plz-ink text-white'
                : 'border border-plz-line bg-white/80 text-plz-ink hover:border-plz-ink')
            }
          >
            {c.label}
          </motion.button>
        );
      })}
    </div>
  );

  const cityToggle = (
    <div className="flex items-center justify-center gap-1 text-[15px] text-plz-body">
      <MapPin size={15} className="text-plz-grey" />
      <span>in</span>
      {cities.map((c) => (
        <motion.button
          key={c}
          type="button"
          onClick={() => setCity(c)}
          aria-pressed={c === city}
          whileTap={{ scale: 0.95 }}
          className={
            'ml-1 h-9 rounded-full px-3 text-[15px] font-semibold transition-colors duration-micro ease-plz ' +
            (c === city ? 'bg-plz-blue text-white' : 'text-plz-ink hover:bg-plz-surface')
          }
        >
          {c}
        </motion.button>
      ))}
    </div>
  );

  return (
    <ScrollStage id="hero" length={4} mobileLength={3.2}>
      {(p) => {
        const answerHold = [0.4, 0.92];
        return (
          <>
            {/* the scene, already in place, leaving as you scroll */}
            {(isDesktop ? SCENE : SCENE_MOBILE).map((spec, i) => (
                <StageLayer
                  key={spec.left + '-' + spec.top}
                  progress={p}
                  vec={spec.vec}
                  depth={spec.depth}
                  hold={[0, 0.3]}
                  arrive={false}
                  fade={0.1}
                  className="absolute"
                  style={{
                    left: spec.left + '%',
                    top: spec.top + '%',
                    width: spec.w,
                    translateX: '-50%',
                    zIndex: hovering === i ? 9 : 2
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pool[i % pool.length].id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onPointerEnter={() => setHovering(i)}
                      onPointerLeave={() => setHovering(null)}
                    >
                      <HoverImage
                        src={pool[i % pool.length].image}
                        alt={`${pool[i % pool.length].name}, ${pool[i % pool.length].kind} in ${pool[i % pool.length].area}`}
                        caption={pool[i % pool.length].name}
                        meta={`${pool[i % pool.length].kind} · from ${nairaShort(pool[i % pool.length].from)}`}
                        ratio={spec.ratio}
                        eager={i < 4}
                      />
                    </motion.div>
                  </AnimatePresence>
              </StageLayer>
            ))}

            {/* two annotations in Plazzaa's voice */}
            {isDesktop && (
              <>
                <StageLayer
                  progress={p}
                  vec={[-300, 0]}
                  depth={1.4}
                  hold={[0, 0.26]}
                  arrive={false}
                  className="absolute left-[3%] top-[40%] z-[4] w-[206px]"
                >
                  <div className="rounded-card bg-plz-yellow p-4">
                    <p className="text-[22px] font-semibold leading-none text-plz-ink">
                      {nairaShort(cheapest)} tonight
                    </p>
                    <p className="mt-2 text-[14px] leading-snug text-plz-ink/70">
                      {(matches.length || venues.length)} places in {city} fit that
                    </p>
                  </div>
                </StageLayer>

                <StageLayer
                  progress={p}
                  vec={[320, 0]}
                  depth={1.4}
                  hold={[0, 0.26]}
                  arrive={false}
                  className="absolute right-[3%] top-[42%] z-[4] w-[216px]"
                >
                  <div className="rounded-card border border-plz-line bg-white p-4">
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
                  </div>
                </StageLayer>
              </>
            )}

            {/* the question */}
            <StageLayer
              progress={p}
              vec={[0, -60]}
              depth={0.5}
              hold={[0, 0.28]}
              arrive={false}
              className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center"
            >
              <h1 className="max-w-[13ch] text-hero text-plz-ink" style={{ textWrap: 'balance' }}>
                Where could <span className="plz-serif italic">today</span> take you?
              </h1>
              <p className="mt-6 max-w-[50ch] text-lead text-plz-body">
                Discover somewhere new, plan around what you want to spend, and find
                something that fits tonight.
              </p>
              <div className="mt-10 flex flex-col gap-4">
                {chips}
                {cityToggle}
              </div>
            </StageLayer>

            {/* the answer, in the space the scene left */}
            <StageLayer
              progress={p}
              vec={[0, 90]}
              depth={0.8}
              hold={answerHold}
              className="absolute inset-0 z-[6] flex items-center justify-center px-5"
            >
              <div className="w-full max-w-[900px]">
                <p className="text-center text-h3 text-plz-ink">Tonight in {city}</p>
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                  {answer.map((venue) => (
                    <Link key={venue.id} to="/explore" className="block">
                      <HoverImage
                        src={venue.image}
                        alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
                        caption={venue.name}
                        meta={`${venue.kind} · from ${nairaShort(venue.from)}`}
                        ratio="aspect-[4/5]"
                      />
                    </Link>
                  ))}
                </div>
                <div className="mt-9 flex justify-center">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/explore" className="plz-btn plz-btn-primary">
                      Explore places
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </StageLayer>
          </>
        );
      }}
    </ScrollStage>
  );
}
