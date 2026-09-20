import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import HeroPrint from '../components/HeroPrint';
import { venues, venueById } from '../lib/data';
import { step, mix, band } from '../lib/phase';
import useViewport from '../lib/useViewport';
import useMediaQuery from '../lib/useMediaQuery';

/**
 * THE HERO TIMELINE
 *
 *   0.00 → 0.16  discovery    scattered prints at rest, headline readable,
 *                             hover live — the scene is interesting before
 *                             anyone scrolls
 *   0.14 → 0.40  convergence  prints travel in and gather around one focal
 *                             image; headline steps back
 *   0.40 → 0.68  expansion    the focal image leaves the card grid entirely
 *                             and opens to 94vw × 88vh
 *   0.68 → 0.94  dispersion   the gathered prints burst back out past the
 *                             camera; the statement lands on the focal
 *   0.88 → 1.00  handoff      the focal pushes in and dissolves into the
 *                             next stage
 *
 * Every value is a pure function of scroll position, so scrubbing backwards
 * retraces the whole sequence exactly.
 */

// Rest positions as a share of the viewport, with the direction each print
// travels. Asymmetric on purpose; several sit hard against the edges.
// Rest positions, as a share of the viewport, for the centre of each print.
// The middle of the screen is left clear for the headline; several prints sit
// hard against the edges and bleed off them. Index 0 is the focal image — the
// one that later leaves the grid and opens across the screen.
const SCENE_DESKTOP = [
  { id: 'kofa', x: 0.115, y: 0.34, w: 188, ratio: 'aspect-[4/5]', focal: true },
  { id: 'suya', x: 0.255, y: 0.20, w: 128, ratio: 'aspect-square' },
  { id: 'ilaje', x: 0.10, y: 0.755, w: 180, ratio: 'aspect-[3/2]' },
  { id: 'ile', x: 0.265, y: 0.83, w: 124, ratio: 'aspect-[4/5]' },
  { id: 'ruwa', x: 0.885, y: 0.315, w: 174, ratio: 'aspect-[4/5]' },
  { id: 'maitama-sky', x: 0.745, y: 0.195, w: 146, ratio: 'aspect-[3/2]' },
  { id: 'court24', x: 0.905, y: 0.755, w: 168, ratio: 'aspect-[3/2]' },
  { id: 'adio', x: 0.735, y: 0.845, w: 128, ratio: 'aspect-square' }
];

// Phones carry the same choreography with four prints and shorter travel.
const SCENE_MOBILE = [
  { id: 'kofa', x: 0.27, y: 0.215, w: 112, ratio: 'aspect-[4/5]', focal: true },
  { id: 'ruwa', x: 0.80, y: 0.26, w: 96, ratio: 'aspect-[4/5]' },
  { id: 'ilaje', x: 0.22, y: 0.815, w: 116, ratio: 'aspect-[3/2]' },
  { id: 'maitama-sky', x: 0.80, y: 0.80, w: 100, ratio: 'aspect-square' }
];

// Supporting prints gather on a ring behind the focal image rather than
// stacking on one point, so the gathered composition still reads as a group.
function ringSlot(index, count, isDesktop) {
  const radius = isDesktop ? 178 : 104;
  const angle = (index / Math.max(1, count - 1)) * Math.PI * 2 + 0.7;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.72 };
}

function HeroScene({ progress }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { width, height } = useViewport();
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(null);
  const [interactive, setInteractive] = useState(true);

  // Hover only belongs to the discovery phase; once the scene starts moving
  // the prints stop taking the pointer so they can't fight the scroll.
  useMotionValueEvent(progress, 'change', (p) => {
    const live = p < 0.22;
    setInteractive((was) => (was === live ? was : live));
    if (!live && hovered !== null) setHovered(null);
  });

  const layout = isDesktop ? SCENE_DESKTOP : SCENE_MOBILE;
  const focalSpot = layout.find((spot) => spot.focal) || layout[0];
  const focal = venueById(focalSpot.id) || venues[0];

  // Where the expansion begins: the focal print's own rect, once it has
  // gathered at the centre. Matching it exactly makes the hand-over invisible.
  const cardW = focalSpot.w;
  const cardH = Math.round(focalSpot.w * 1.25);

  // ---- focal image: card rect → 94vw × 88vh -------------------------------
  const focalClip = useTransform(progress, (p) => {
    const grow = reduce ? 1 : step(p, 0.4, 0.68);
    const startX = (width - cardW) / 2;
    const startY = (height - cardH) / 2;
    const endX = width * 0.03;
    const endY = height * 0.06;
    const x = mix(startX, endX, grow);
    const y = mix(startY, endY, grow);
    const r = mix(20, 12, grow);
    return `inset(${y}px ${x}px ${y}px ${x}px round ${r}px)`;
  });

  const focalOpacity = useTransform(progress, (p) =>
    reduce ? 1 : step(p, 0.36, 0.41) * (1 - step(p, 0.9, 1))
  );
  const focalScale = useTransform(progress, (p) => (reduce ? 1 : mix(1, 1.09, step(p, 0.86, 1))));
  const focalImageScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(1.2, 1.02, step(p, 0.4, 0.72))
  );

  // ---- headline ------------------------------------------------------------
  const headOpacity = useTransform(progress, (p) => (reduce ? 1 : 1 - step(p, 0.13, 0.28)));
  const headScale = useTransform(progress, (p) => (reduce ? 1 : mix(1, 0.9, step(p, 0.13, 0.32))));
  const headY = useTransform(progress, (p) => (reduce ? 0 : mix(0, -70, step(p, 0.13, 0.32))));
  const hintOpacity = useTransform(progress, (p) => (reduce ? 0 : 1 - step(p, 0.03, 0.1)));

  // ---- statement over the opened image ------------------------------------
  const veil = useTransform(progress, (p) => (reduce ? 0.35 : band(p, 0.6, 0.86, 0.12, 0.08) * 0.52));
  const statementOpacity = useTransform(progress, (p) =>
    reduce ? 1 : band(p, 0.62, 0.86, 0.1, 0.06)
  );
  const statementY = useTransform(progress, (p) => (reduce ? 0 : mix(40, 0, step(p, 0.56, 0.7))));

  return (
    <div className="relative h-full w-full">
      {/* ---------------------------------------------- the scattered scene */}
      {layout.map((spot, index) => (
        <HeroPrint
          key={spot.id}
          venue={venueById(spot.id) || venues[index]}
          spot={spot}
          ring={ringSlot(index, layout.length, isDesktop)}
          progress={progress}
          viewport={{ width, height }}
          index={index}
          hovered={hovered}
          hoveredSpot={hovered === null ? null : layout[hovered]}
          onHover={setHovered}
          interactive={interactive}
          reduce={reduce}
          isFocal={Boolean(spot.focal)}
        />
      ))}

      {/* ------------------------------------------- the focal image opening */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
        style={{ clipPath: focalClip, opacity: focalOpacity, scale: focalScale }}
      >
        <motion.img
          src={focal.image}
          alt={`${focal.name}, ${focal.kind} in ${focal.area}`}
          className="plz-fill"
          style={{ scale: focalImageScale }}
        />
        <motion.div className="absolute inset-0 bg-plz-ink" style={{ opacity: veil }} />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: statementOpacity, y: statementY }}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">
            {focal.area}, {focal.city}
          </p>
          <p
            className="mt-4 max-w-[16ch] text-hero text-white md:max-w-[18ch]"
            style={{ textWrap: 'balance' }}
          >
            Know before <span className="plz-serif italic">you go</span>.
          </p>
        </motion.div>
      </motion.div>

      {/* ------------------------------------------------------- the question */}
      <motion.div
        // The headline sits above the prints, so it must not swallow their hover.
        // Its buttons re-enable pointer events on themselves.
        className="pointer-events-none absolute inset-0 z-[6] flex flex-col items-center justify-center px-5 text-center"
        style={{ opacity: headOpacity, scale: headScale, y: headY }}
      >
        <h1 className="max-w-[12ch] text-hero text-plz-ink" style={{ textWrap: 'balance' }}>
          Where could <span className="plz-serif italic text-plz-blue">today</span> take you?
        </h1>
        <p className="mt-6 max-w-[48ch] text-lead text-plz-body">
          Discover places, explore experiences, and see where your budget can take you.
        </p>

        <div className="pointer-events-auto mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/explore" className="plz-btn plz-btn-primary w-full sm:w-auto">
              Explore places
              <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link to="/business" className="plz-btn plz-btn-quiet w-full sm:w-auto">
              Plazzaa for Business
            </Link>
          </motion.div>
        </div>

        <motion.p
          className="mt-12 flex items-center gap-2 text-[13px] font-medium text-plz-grey"
          style={{ opacity: hintOpacity }}
        >
          <ArrowDown size={14} />
          Scroll
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function HeroStage() {
  return (
    <ScrollStage id="hero" length={4.6} mobileLength={3.6}>
      {(progress) => <HeroScene progress={progress} />}
    </ScrollStage>
  );
}
