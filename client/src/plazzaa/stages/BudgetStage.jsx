import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';
import { budgetPlans, venueById, naira, nairaShort } from '../lib/data';

const MIN = 10000;
const MAX = 200000;
const STEP = 5000;

/**
 * The differentiator, made operable. Drag the amount and the three plans
 * reprice live — which explains planning around a budget faster than a
 * paragraph about planning around a budget.
 */
function Scene({ progress }) {
  const [budget, setBudget] = useState(40000);
  const fill = ((budget - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="relative h-full">
      <div className="plz-edge flex h-full flex-col justify-center py-24">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <StageLayer
            progress={progress}
            vec={[-260, 0]}
            depth={1.15}
            hold={[0.14, 0.88]}
            className="lg:col-span-5"
          >
            <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Start with what you <span className="plz-serif italic">want to spend</span>.
            </h2>
            <p className="mt-4 max-w-[42ch] text-lead text-plz-body">
              ₦20,000? ₦50,000? ₦100,000? See where your budget can take you before you
              step out.
            </p>

            <div className="mt-8">
              <label htmlFor="plz-budget" className="block text-[14px] font-medium text-plz-body">
                Your budget
              </label>
              <output
                htmlFor="plz-budget"
                className="mt-1 block text-[clamp(40px,5vw,60px)] font-medium leading-none tracking-[-0.03em] text-plz-ink"
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
                className="plz-range mt-6"
                aria-valuetext={naira(budget)}
                style={{
                  background: `linear-gradient(to right, #2D60EA 0%, #2D60EA ${fill}%, #D9D9DE ${fill}%, #D9D9DE 100%)`
                }}
              />
              <div className="mt-2 flex justify-between text-[13px] text-plz-body">
                <span>{nairaShort(MIN)}</span>
                <span>{nairaShort(MAX)}+</span>
              </div>
            </div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-7 inline-block">
              <Link to="/explore#budget" className="plz-btn plz-btn-primary">
                Plan with my budget
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </StageLayer>

          <div className="lg:col-span-7">
            <ul className="flex flex-col gap-3">
              {budgetPlans.map((plan, index) => {
                const low = Math.round((budget * plan.share[0]) / 1000) * 1000;
                const high = Math.round((budget * plan.share[1]) / 1000) * 1000;
                const stretch = low > budget;
                const places = plan.venueIds.map(venueById).filter(Boolean);

                return (
                  <StageLayer
                    key={plan.id}
                    progress={progress}
                    vec={[320 + index * 60, -40 + index * 60]}
                    depth={1.05 + index * 0.18}
                    hold={[0.16 + index * 0.03, 0.88]}
                  >
                    <motion.li
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className="flex items-center gap-5 rounded-card border border-plz-line bg-white p-4 md:p-5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="text-h4 text-plz-ink">{plan.label}</h3>
                          {stretch && (
                            <span className="rounded-full bg-plz-cream px-2.5 py-1 text-[12px] font-semibold text-plz-ink">
                              A stretch at this budget
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[15px] text-plz-body">{plan.detail}</p>
                        <p className="mt-3 text-[17px] font-semibold text-plz-ink">
                          Est. {nairaShort(low)}–{nairaShort(high)}
                        </p>
                        <p className="mt-1 truncate text-[14px] text-plz-body">
                          {places.map((pl) => pl.name).join(' · ')}
                        </p>
                      </div>

                      <div className="hidden shrink-0 sm:flex">
                        {places.slice(0, 3).map((place, i) => (
                          <img
                            key={place.id}
                            src={place.image}
                            alt={place.name}
                            loading="lazy"
                            className="h-[72px] w-[72px] rounded-[12px] border-2 border-white object-cover md:h-[84px] md:w-[84px]"
                            style={{ marginLeft: i === 0 ? 0 : -22, zIndex: 3 - i }}
                          />
                        ))}
                      </div>
                    </motion.li>
                  </StageLayer>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetStage() {
  return (
    <ScrollStage id="budget" length={3.2} mobileLength={2.7} backdrop="#EDE9FE">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
