import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Utensils, Flower2, Bike, Music, BedDouble } from 'lucide-react';
import TopNav from '../components/TopNav';
import ExploreSearch from '../components/ExploreSearch';
import VenueRail from '../components/VenueRail';
import SiteFooter from '../components/SiteFooter';
import GatewayBar from '../components/GatewayBar';
import { venues, occasions, venueById, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

const TABS = [
  { id: null, label: 'All', icon: Compass },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'spa', label: 'Spa', icon: Flower2 },
  { id: 'activities', label: 'Activities', icon: Bike },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'stays', label: 'Stays', icon: BedDouble }
];

/**
 * The marketplace. Search first, rows of real places under it, and no account
 * asked for until someone wants to keep something. Rows are the unit here —
 * dense and functional, where the landing page was expressive.
 */
export default function Explore() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Lagos');
  const [budget, setBudget] = useState(40000);
  const [when, setWhen] = useState('Tonight');
  const [tab, setTab] = useState(null);

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter((v) => {
      if (v.city !== city) return false;
      if (tab && v.category !== tab) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.kind.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.tags.join(' ').toLowerCase().includes(q)
      );
    });
  }, [query, city, tab]);

  const withinBudget = pool.filter((v) => v.from <= budget);
  const dateNight = occasions.find((o) => o.id === 'date-night').venues
    .map(venueById)
    .filter((v) => v && v.city === city);
  const offers = pool.filter((v) => v.rating >= 4.6).slice(0, 6);

  return (
    <div className="plz-root min-h-screen bg-white">
      <TopNav tone="solid" />

      <main className="pt-[64px] md:pt-[76px]">
        <section className="border-b border-plz-line bg-plz-surface pb-6 pt-8 md:pb-8 md:pt-10">
          <div className="plz-edge">
            <h1 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              What are you looking for?
            </h1>
            <p className="mt-2 text-lead text-plz-body">
              {pool.length} places in {city} · {when.toLowerCase()}
            </p>

            <div className="mt-6">
              <ExploreSearch
                query={query}
                setQuery={setQuery}
                city={city}
                setCity={setCity}
                budget={budget}
                setBudget={setBudget}
                when={when}
                setWhen={setWhen}
              />
            </div>

            <div className="plz-rail mt-5 -mx-1 px-1 pb-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = t.id === tab;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTab(t.id)}
                    aria-pressed={active}
                    className={
                      'flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
                      (active
                        ? 'bg-plz-ink text-white'
                        : 'border border-plz-line bg-white text-plz-ink hover:border-plz-ink')
                    }
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {pool.length === 0 ? (
          <div className="plz-edge py-24 text-center">
            <p className="text-h3 text-plz-ink">Nothing matches that yet.</p>
            <p className="mt-3 text-lead text-plz-body">
              Try a different category, or switch city.
            </p>
            <button
              type="button"
              onClick={() => { setQuery(''); setTab(null); }}
              className="plz-btn plz-btn-quiet mt-7"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <VenueRail
              id="for-you"
              title={`For you in ${city}`}
              note={`Based on ${when.toLowerCase()} and ${nairaShort(budget)} a head`}
              venues={pool}
              ratio="landscape"
            />

            <VenueRail
              id="budget"
              title="Plan with your budget"
              note={`${withinBudget.length} places start under ${nairaShort(budget)}`}
              venues={withinBudget.length ? withinBudget : pool}
              ratio="portrait"
              priceFor={(v) => 'from ' + nairaShort(v.from)}
            />

            <section id="experiences" className="bg-plz-cream py-14 md:py-18">
              <div className="plz-edge">
                <h2 className="text-h3 text-plz-ink">Experiences</h2>
                <p className="mt-1 max-w-[52ch] text-[15px] text-plz-body">
                  Nights out that need more than a table booking.
                </p>

                <div className="mt-7 grid gap-5 md:grid-cols-3">
                  {occasions.slice(0, 3).map((occasion, index) => {
                    const first = occasion.venues.map(venueById).find(Boolean);
                    return (
                      <motion.article
                        key={occasion.id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-10%' }}
                        transition={{ duration: 0.45, ease: EASE, delay: index * 0.06 }}
                      >
                        <Link to="#" className="group block">
                          <div className="relative overflow-hidden rounded-visual bg-white">
                            <img
                              src={first.image}
                              alt={occasion.label + ' in ' + first.area}
                              loading="lazy"
                              className="block aspect-[3/2] w-full object-cover transition-transform duration-editorial ease-plz group-hover:scale-[1.025]"
                            />
                          </div>
                          <h3 className="pt-4 text-h4 text-plz-ink">{occasion.label}</h3>
                          <p className="mt-1 text-[15px] text-plz-body">
                            {occasion.venues.length} places · from {nairaShort(first.from)}
                          </p>
                        </Link>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </section>

            <VenueRail
              id="offers"
              title="Popular this weekend"
              note="Booked most often in the last seven days"
              venues={offers.length ? offers : pool}
              ratio="landscape"
            />

            <VenueRail
              id="date-night"
              title="Date night"
              venues={dateNight.length ? dateNight : pool}
              ratio="portrait"
            />

            <section className="plz-edge py-16 md:py-22">
              <div className="flex flex-col items-start justify-between gap-6 border-t border-plz-line pt-10 md:flex-row md:items-end">
                <div>
                  <h2 className="max-w-[20ch] text-h3 text-plz-ink">
                    Save what you like and compare it later.
                  </h2>
                  <p className="mt-2 max-w-[52ch] text-[15px] text-plz-body">
                    Browsing needs no account. You only need one when you want to keep a
                    shortlist or build a plan.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Link to="/signup" className="plz-btn plz-btn-ink">Sign up</Link>
                  <Link to="/login" className="plz-btn plz-btn-quiet">Log in</Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
      <GatewayBar emphasis="customer" />
    </div>
  );
}
