import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { budgetPlans, venueById, naira, nairaShort } from '../lib/data';
import { EASE, revealUp, viewportOnce } from '../lib/motion';

const MIN = 10000;
const MAX = 200000;
const STEP = 5000;

/**
 * The differentiator, made usable rather than described. Drag the amount and
 * the three plans reprice against it live — which explains "plan around your
 * budget" faster than a paragraph about planning around your budget.
 */
export default function BudgetPlanner() {
  const [budget, setBudget] = useState(40000);
  const reduce = useReducedMotion();
  const fill = ((budget - MIN) / (MAX - MIN)) * 100;

  return (
    <section className="bg-plz-lavender py-18 md:py-30">
      <div className="plz-edge">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-5"
          >
            <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Start with what you <span className="plz-serif italic">want to spend</span>.
            </h2>
            <p className="mt-5 max-w-[46ch] text-lead text-plz-body">
              ₦20,000? ₦50,000? ₦100,000? See where your budget can take you before you
              step out.
            </p>

            <div className="mt-10">
              <label htmlFor="plz-budget" className="block text-[14px] font-medium text-plz-body">
                Your budget
              </label>
              <output
                htmlFor="plz-budget"
                className="mt-2 block text-[clamp(44px,6vw,64px)] font-medium leading-none tracking-[-0.03em] text-plz-ink"
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
                className="plz-range mt-7"
                style={{
                  background: `linear-gradient(to right, #2D60EA 0%, #2D60EA ${fill}%, #D8D2F7 ${fill}%, #D8D2F7 100%)`
                }}
                aria-valuetext={naira(budget)}
              />
              <div className="mt-3 flex justify-between text-[13px] text-plz-body">
                <span>{nairaShort(MIN)}</span>
                <span>{nairaShort(MAX)}+</span>
              </div>
            </div>

            <Link to="/explore" className="plz-btn plz-btn-primary mt-9">
              Plan with my budget
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="lg:col-span-7">
            <ul className="flex flex-col gap-4">
              {budgetPlans.map((plan, index) => {
                const low = Math.round((budget * plan.share[0]) / 1000) * 1000;
                const high = Math.round((budget * plan.share[1]) / 1000) * 1000;
                const overBudget = low > budget;
                const places = plan.venueIds.map(venueById).filter(Boolean);

                return (
                  <motion.li
                    key={plan.id}
                    variants={reduce ? revealUp : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    transition={{ duration: 0.5, ease: EASE, delay: index * 0.08 }}
                    className="flex items-center gap-5 rounded-card bg-white p-5 md:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-h4 text-plz-ink">{plan.label}</h3>
                        {overBudget && (
                          <span className="rounded-full bg-plz-cream px-2.5 py-1 text-[12px] font-semibold text-plz-ink">
                            A stretch at this budget
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[15px] text-plz-body">{plan.detail}</p>
                      <p className="mt-4 text-[17px] font-semibold text-plz-ink">
                        Est. {nairaShort(low)}–{nairaShort(high)}
                      </p>
                      <p className="mt-1 text-[14px] text-plz-body">
                        {places.map((p) => p.name).join(' · ')}
                      </p>
                    </div>

                    <div className="hidden shrink-0 sm:flex">
                      {places.slice(0, 3).map((place, i) => (
                        <img
                          key={place.id}
                          src={place.image}
                          alt={place.name}
                          loading="lazy"
                          className="h-[76px] w-[76px] rounded-[12px] border-2 border-white object-cover md:h-[92px] md:w-[92px]"
                          style={{ marginLeft: i === 0 ? 0 : -18, zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
