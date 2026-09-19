import { Link } from 'react-router-dom';
import { motion, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, Link2 } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import DashboardMock from '../components/DashboardMock';
import { venueById, venues, naira, merchantTrades } from '../lib/data';
import { step, mix, band } from '../lib/phase';
import useMediaQuery from '../lib/useMediaQuery';

const SHOWN = ['ayaba', 'kofa', 'ruwa', 'ile'];

/**
 * THE HAND-OVER — the one section that transforms rather than travels.
 *
 *   0.00 → 0.22  the places a customer was just browsing gather
 *   0.22 → 0.38  they become a single business profile
 *   0.38 → 0.54  the profile collapses into one booking link
 *   0.54 → 0.72  the link opens into what a customer sees
 *   0.70 → 0.90  that becomes the dashboard the owner works in
 *
 * Each step replaces the last in the same spot on screen, so the customer
 * story visibly turns into the merchant product instead of cutting to it.
 */
function Scene({ progress }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduce = useReducedMotion();
  const cards = SHOWN.map(venueById).filter(Boolean);
  const business = venueById('ruwa') || venues[0];

  const copyOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.08, 0.92, 0.08, 0.06)));
  const copyY = useTransform(progress, (p) => (reduce ? 0 : mix(44, 0, step(p, 0, 0.2))));

  // stage 2 — one business profile
  const profileOpacity = useTransform(progress, (p) =>
    reduce ? 0 : band(p, 0.26, 0.42, 0.06, 0.05)
  );
  const profileScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(0.9, 1, step(p, 0.22, 0.34)) * mix(1, 0.72, step(p, 0.42, 0.52))
  );

  // stage 3 — the link
  const linkOpacity = useTransform(progress, (p) => (reduce ? 0 : band(p, 0.46, 0.58, 0.05, 0.05)));
  const linkScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(0.86, 1, step(p, 0.44, 0.54))
  );

  // stage 4 — what the customer sees
  const previewOpacity = useTransform(progress, (p) =>
    reduce ? 0 : band(p, 0.6, 0.72, 0.05, 0.05)
  );
  const previewScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(0.88, 1, step(p, 0.56, 0.68)) * mix(1, 0.82, step(p, 0.72, 0.8))
  );

  // stage 5 — the dashboard
  const dashOpacity = useTransform(progress, (p) =>
    reduce ? 1 : step(p, 0.74, 0.84) * (1 - step(p, 0.95, 1))
  );
  const dashScale = useTransform(progress, (p) =>
    reduce ? 1 : mix(0.9, 1, step(p, 0.72, 0.86))
  );

  const ctaOpacity = useTransform(progress, (p) => (reduce ? 1 : band(p, 0.8, 0.94, 0.06, 0.05)));

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="plz-edge flex h-full items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ------------------------------------------------------ the copy */}
          <motion.div style={{ opacity: copyOpacity, y: copyY }} className="lg:col-span-5">
            <p className="text-[15px] font-semibold text-plz-yellow">Own a business?</p>
            <h2 className="mt-3 text-h2 text-white" style={{ textWrap: 'balance' }}>
              We have something
              <span className="mt-1 block plz-serif italic">for you.</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-lead text-white/70">
              Give your customers a simpler way to book. Create your services, set your
              availability, and share one Plazzaa link.
            </p>

            <motion.div
              style={{ opacity: ctaOpacity }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/business" className="plz-btn plz-btn-primary w-full sm:w-auto">
                  Explore Plazzaa for Business
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="plz-btn w-full border border-white/25 text-white hover:border-white sm:w-auto"
                >
                  Create your booking link
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ------------------------------------------- the transformation */}
          <div className="relative h-[420px] lg:col-span-7 lg:h-[560px]">
            {/* 1 — the places, gathering */}
            {cards.map((card, index) => (
              <GatheringCard
                key={card.id}
                card={card}
                index={index}
                progress={progress}
                reduce={reduce}
                isDesktop={isDesktop}
              />
            ))}

            {/* 2 — one business profile */}
            <motion.div
              style={{ opacity: profileOpacity, scale: profileScale }}
              className="absolute inset-0 z-[3] flex items-center justify-center"
            >
              <div className="w-[260px] overflow-hidden rounded-visual bg-white md:w-[300px]">
                <img
                  src={business.image}
                  alt={`${business.name}, ${business.kind} in ${business.area}`}
                  className="block aspect-[3/2] w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-[17px] font-semibold text-plz-ink">Glow Spa</p>
                  <p className="text-[14px] text-plz-body">Day spa · Lekki Phase 1</p>
                </div>
              </div>
            </motion.div>

            {/* 3 — the link */}
            <motion.div
              style={{ opacity: linkOpacity, scale: linkScale }}
              className="absolute inset-0 z-[4] flex items-center justify-center"
            >
              <div className="flex items-center gap-2.5 rounded-full bg-white px-5 py-3.5 shadow-panel">
                <Link2 size={17} className="shrink-0 text-plz-blue" />
                <span className="whitespace-nowrap font-mono text-[15px] text-plz-ink md:text-[17px]">
                  plazzaa.com/glowspa
                </span>
              </div>
            </motion.div>

            {/* 4 — what the customer sees */}
            <motion.div
              style={{ opacity: previewOpacity, scale: previewScale }}
              className="absolute inset-0 z-[5] flex items-center justify-center"
            >
              <div className="w-[290px] rounded-visual bg-white p-5 md:w-[340px]">
                <p className="font-mono text-[12px] text-plz-blue">plazzaa.com/glowspa</p>
                <p className="mt-3 text-[17px] font-semibold text-plz-ink">Glow Spa, Lekki</p>
                <ul className="mt-3 divide-y divide-plz-line">
                  {merchantTrades.slice(0, 2).map((trade) => (
                    <li key={trade.id} className="flex items-center justify-between py-2.5">
                      <span className="text-[14px] font-medium text-plz-ink">{trade.service}</span>
                      <span className="text-[13px] text-plz-body">
                        {naira(trade.price)} · {trade.minutes}m
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  {['11:00', '13:30', '16:00'].map((time, i) => (
                    <span
                      key={time}
                      className={
                        'rounded-ctl px-3 py-2 text-[13px] font-medium ' +
                        (i === 1 ? 'bg-plz-blue text-white' : 'bg-plz-surface text-plz-ink')
                      }
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 5 — the dashboard behind it */}
            <motion.div
              style={{ opacity: dashOpacity, scale: dashScale }}
              className="absolute inset-0 z-[6] flex items-center justify-center"
            >
              <div className="w-[min(96%,640px)]">
                <DashboardMock compact />
                <p className="mt-3 text-center text-[12px] text-white/55">
                  Merchant dashboard preview
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A place the customer was browsing, pulled into the middle and handed over. */
function GatheringCard({ card, index, progress, reduce, isDesktop }) {
  const spread = [
    { x: -0.3, y: -0.28 },
    { x: 0.28, y: -0.22 },
    { x: -0.26, y: 0.3 },
    { x: 0.3, y: 0.26 }
  ][index % 4];

  const reach = isDesktop ? 1 : 0.62;

  const x = useTransform(progress, (p) =>
    reduce ? 0 : mix(spread.x * 620 * reach, 0, step(p, 0.04, 0.3))
  );
  const y = useTransform(progress, (p) =>
    reduce ? 0 : mix(spread.y * 470 * reach, 0, step(p, 0.04, 0.3))
  );
  const scale = useTransform(progress, (p) =>
    reduce ? 0.8 : mix(1, 0.72, step(p, 0.04, 0.32))
  );
  const rotate = useTransform(progress, (p) =>
    reduce ? 0 : mix(index % 2 ? 7 : -6, 0, step(p, 0.04, 0.32))
  );
  const opacity = useTransform(progress, (p) =>
    reduce ? 0 : step(p, 0, 0.12) * (1 - step(p, 0.24, 0.34))
  );

  return (
    <div
      className="absolute left-1/2 top-1/2 z-[2] w-[180px] md:w-[210px]"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
    <motion.div style={{ x, y, scale, rotate, opacity }}>
      <div className="overflow-hidden rounded-visual bg-white">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="block aspect-[3/2] w-full object-cover"
        />
      </div>
    </motion.div>
    </div>
  );
}

export default function MerchantStage() {
  return (
    <ScrollStage id="for-business" length={4.2} mobileLength={3.4} backdrop="#18181B">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
