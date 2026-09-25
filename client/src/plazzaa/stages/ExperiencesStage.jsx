import { Link } from 'react-router-dom';
import { motion, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import { images, nairaShort, venueById } from '../lib/data';
import { step, mix, band } from '../lib/phase';
import useViewport from '../lib/useViewport';
import useMediaQuery from '../lib/useMediaQuery';

const EXPERIENCES = [
  {
    id: 'date-night',
    name: 'Date Night',
    blurb: 'Quiet tables, good light, somewhere you can actually hear each other.',
    image: images.ikoyiGarden,
    from: 'ayaba'
  },
  {
    id: 'birthday',
    name: 'Birthday',
    blurb: 'Rooms that can take a crowd, and staff who will carry out the cake.',
    image: images.abujaLounge,
    from: 'maitama-sky'
  },
  {
    id: 'kids',
    name: 'Kids Packages',
    blurb: 'Space to run, food they will eat, and somewhere to sit while they do.',
    image: images.beachClub,
    from: 'ilaje'
  },
  {
    id: 'group',
    name: 'Group Hangout',
    blurb: 'Big tables, long evenings, splitting the bill without the maths.',
    image: images.suyaGrill,
    from: 'yaji'
  }
];

/**
 * EXPERIENCES — photographic. Four occasions arrive from the corners, stack
 * into one composition, and the featured one opens out across the screen with
 * its name on it. Keep scrolling and the stack deals itself back out as four
 * cards you can actually click.
 *
 *   0.00 → 0.18  the statement lands
 *   0.16 → 0.40  the four images converge into a stack
 *   0.40 → 0.62  the featured image opens to 88vw
 *   0.62 → 0.88  the stack deals out into four cards
 *   0.88 → 1.00  the row lifts away
 */
function Scene({ progress }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { width, height } = useViewport();
  const reduce = useReducedMotion();

  const featured = EXPERIENCES[0];
  const cardW = isDesktop ? 300 : 210;
  const cardH = isDesktop ? 375 : 264;

  const statementOpacity = useTransform(progress, (p) =>
    reduce ? 1 : band(p, 0.04, 0.3, 0.06, 0.08)
  );
  const statementScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(1, 0.94, step(p, 0.2, 0.36))
  );

  // The featured image leaves the stack and opens across the screen.
  const openClip = useTransform(progress, (p) => {
    const grow = reduce ? 1 : step(p, 0.4, 0.62);
    const startX = (width - cardW) / 2;
    const startY = (height - cardH) / 2;
    const endX = width * 0.06;
    const endY = height * 0.1;
    const x = mix(startX, endX, grow);
    const y = mix(startY, endY, grow);
    return `inset(${y}px ${x}px ${y}px ${x}px round ${mix(20, 14, grow)}px)`;
  });

  const openOpacity = useTransform(progress, (p) =>
    reduce ? 0 : step(p, 0.38, 0.44) * (1 - step(p, 0.66, 0.74))
  );
  const openVeil = useTransform(progress, (p) => (reduce ? 0 : band(p, 0.5, 0.68, 0.08, 0.06) * 0.46));
  const openLabel = useTransform(progress, (p) => (reduce ? 0 : band(p, 0.52, 0.68, 0.08, 0.05)));

  const ctaOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.78, 0.9, 0.08, 0.06)));

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* ------------------------------------------------------ the statement */}
      <motion.div
        style={{ opacity: statementOpacity, scale: statementScale }}
        className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-5 text-center"
      >
        <h2 className="max-w-[18ch] text-h1 text-plz-ink" style={{ textWrap: 'balance' }}>
          Sometimes you know the occasion.
        </h2>
        <p className="mt-3 plz-serif text-[clamp(30px,4vw,52px)] italic leading-tight text-plz-blue">
          You just don&apos;t know the place.
        </p>
      </motion.div>

      {/* ------------------------------------------------ converging pictures */}
      {EXPERIENCES.map((experience, index) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          index={index}
          total={EXPERIENCES.length}
          progress={progress}
          reduce={reduce}
          isDesktop={isDesktop}
          viewport={{ width, height }}
          cardW={cardW}
        />
      ))}

      {/* ------------------------------------------- the featured image, open */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
        style={{ clipPath: openClip, opacity: openOpacity }}
      >
        <img
          src={featured.image}
          alt={`${featured.name} — a table for two under the trees in Ikoyi`}
          className="plz-fill"
        />
        <motion.div className="absolute inset-0 bg-plz-ink" style={{ opacity: openVeil }} />
        <motion.div
          className="absolute inset-x-0 bottom-0 p-8 text-white md:p-14"
          style={{ opacity: openLabel }}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">
            Experience
          </p>
          <p className="mt-3 text-h1 text-white">{featured.name}</p>
          <p className="mt-3 max-w-[44ch] text-lead text-white/80">{featured.blurb}</p>
        </motion.div>
      </motion.div>

      {/* ------------------------------------------------------------- the CTA */}
      <motion.div
        style={{ opacity: ctaOpacity }}
        className="absolute inset-x-0 bottom-[104px] z-[6] flex justify-center px-5 md:bottom-[92px]"
      >
        <Link to="/explore#experiences" className="plz-link-cta">
          Explore experiences
          <ArrowUpRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}

/** One occasion: corner → stack → dealt out as a card you can click. */
function ExperienceCard({ experience, index, total, progress, reduce, isDesktop, viewport, cardW }) {
  const venue = venueById(experience.from);

  // corners of the frame
  const corners = [
    { x: -0.3, y: -0.26 },
    { x: 0.31, y: -0.3 },
    { x: -0.32, y: 0.28 },
    { x: 0.3, y: 0.27 }
  ][index % 4];

  const startX = corners.x * viewport.width;
  const startY = corners.y * viewport.height;

  // dealt-out row position
  const gap = isDesktop ? cardW + 26 : cardW * 0.56;
  const laidX = (index - (total - 1) / 2) * gap;
  const laidY = isDesktop ? 30 : 20;

  const x = useTransform(progress, (p) => {
    if (reduce) return laidX;
    const gather = step(p, 0.16, 0.4);
    const deal = step(p, 0.64, 0.86);
    return mix(mix(startX, index * 5 - 8, gather), laidX, deal);
  });

  const y = useTransform(progress, (p) => {
    if (reduce) return laidY;
    const gather = step(p, 0.16, 0.4);
    const deal = step(p, 0.64, 0.86);
    return mix(mix(startY, index * 6 - 10, gather), laidY, deal);
  });

  const scale = useTransform(progress, (p) => {
    if (reduce) return isDesktop ? 0.78 : 0.62;
    const gather = step(p, 0.16, 0.4);
    const deal = step(p, 0.64, 0.86);
    const dealt = isDesktop ? 0.78 : 0.62;
    return mix(mix(0.9, 1, gather), dealt, deal);
  });

  const rotate = useTransform(progress, (p) => {
    if (reduce) return 0;
    const gather = step(p, 0.16, 0.4);
    const deal = step(p, 0.64, 0.86);
    return mix(mix(index % 2 ? 6 : -5, index % 2 ? 2.5 : -2, gather), 0, deal);
  });

  const opacity = useTransform(progress, (p) => {
    if (reduce) return 1;
    const appear = step(p, 0.1, 0.22);
    // the featured card is the one that opens out, so it hides while that plays
    const swallowed = index === 0 ? step(p, 0.4, 0.46) : step(p, 0.44, 0.54) * 0.9;
    const back = index === 0 ? step(p, 0.66, 0.74) : step(p, 0.64, 0.72) * 0.9;
    const leave = step(p, 0.9, 0.99);
    return appear * Math.max(0, 1 - swallowed + back) * (1 - leave);
  });

  const detail = useTransform(progress, (p) => (reduce ? 1 : step(p, 0.72, 0.84)));

  return (
    <div
      className="absolute left-1/2 top-1/2 z-[3]"
      style={{ width: cardW, transform: 'translate(-50%, -50%)' }}
    >
    <motion.article style={{ x, y, scale, rotate, opacity }}>
      <Link to="/explore#experiences" className="group block">
        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
          <div className="relative overflow-hidden rounded-visual bg-plz-surface">
            <img
              src={experience.image}
              alt={experience.name}
              loading="lazy"
              className="block aspect-[4/5] w-full object-cover transition-transform duration-editorial ease-plz group-hover:scale-[1.04]"
            />
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-plz-ink">
              {experience.name}
            </span>
          </div>

          <motion.div style={{ opacity: detail }} className="pt-3">
            <p className="text-[15px] leading-snug text-plz-body">{experience.blurb}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-plz-ink">
              From {venue ? nairaShort(venue.from) : '—'}
              <ArrowRight
                size={14}
                className="transition-transform duration-micro ease-plz group-hover:translate-x-1"
              />
            </p>
          </motion.div>
        </motion.div>
      </Link>
    </motion.article>
    </div>
  );
}

export default function ExperiencesStage() {
  return (
    <ScrollStage id="experiences" length={4} mobileLength={3.2} backdrop="#FFFBEB">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
