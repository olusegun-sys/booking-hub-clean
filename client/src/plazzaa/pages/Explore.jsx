import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, BedDouble, Bike, Check, ChevronRight, Heart, MapPin, Music, Scale,
  Search, Sparkles, Star, Utensils, Wallet
} from 'lucide-react';
import SmoothScroll from '../lib/SmoothScroll';
import ExploreNav from '../components/ExploreNav';
import GatewayBar from '../components/GatewayBar';
import { images, venues, venueById, naira, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

import PlazzaaLogo from '../components/PlazzaaLogo';
const CATEGORIES = [
  { id: 'food', label: 'Restaurants', icon: Utensils },
  { id: 'spa', label: 'Spa', icon: Sparkles },
  { id: 'activities', label: 'Activities', icon: Bike },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'stays', label: 'Stays', icon: BedDouble }
];

const EXPERIENCES = [
  { id: 'date-night', name: 'Date Night', blurb: 'Romantic spots for special moments.', image: images.ikoyiGarden },
  { id: 'birthday', name: 'Birthday', blurb: 'Make it a celebration to remember.', image: images.abujaLounge },
  { id: 'group', name: 'Group Hangout', blurb: 'Good food. Great company.', image: images.suyaGrill },
  { id: 'kids', name: 'Kids Package', blurb: 'Fun for the little ones. Easy for you.', image: images.beachClub }
];

const MIN = 5000;
const MAX = 200000;

/**
 * plazzaa.com/explore — the customer marketplace.
 *
 * Deliberately the opposite of the brand landing page: the tool comes first,
 * the page is dense and functional, and nothing is hidden behind an animation.
 * Motion here is restricted to arrival and feedback, because this is where
 * people are working rather than watching.
 */
export default function Explore() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Lagos');
  const [category, setCategory] = useState('food');
  const [budget, setBudget] = useState(40000);
  const [saved, setSaved] = useState([]);
  const [compare, setCompare] = useState([]);

  const fill = ((budget - MIN) / (MAX - MIN)) * 100;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter((v) => {
      if (v.city !== city) return false;
      if (category && v.category !== category) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.kind.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.tags.join(' ').toLowerCase().includes(q)
      );
    });
  }, [query, city, category]);

  const withinBudget = venues
    .filter((v) => v.city === city && v.from <= budget)
    .slice(0, 4);
  const shown = (matches.length ? matches : withinBudget).slice(0, 4);

  const toggleSaved = (id) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleCompare = (id) =>
    setCompare((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s));

  return (
    <SmoothScroll>
      <div className="plz-root min-h-screen bg-white">
        <ExploreNav city={city} setCity={setCity} />

        <main className="pb-28">
          {/* ------------------------------------------------------------ hero */}
          <section className="plz-edge grid grid-cols-1 items-start gap-10 pt-9 lg:grid-cols-12 lg:gap-8 lg:pt-12">
            <div className="min-w-0 lg:col-span-6 xl:col-span-6">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="text-h1 text-plz-ink"
                style={{ textWrap: 'balance' }}
              >
                Where could <span className="plz-serif italic text-plz-blue">today</span> take you?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.06 }}
                className="mt-4 max-w-[52ch] text-body text-plz-body"
              >
                Great food. Better company. Unforgettable experiences. Find the best places,
                plan your budget, and make it happen — with Plazzaa.
              </motion.p>

              {/* search */}
              <motion.form
                id="search"
                onSubmit={(e) => e.preventDefault()}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
                className="mt-7 flex flex-col gap-2 rounded-[18px] border border-plz-line bg-white p-2 shadow-lift sm:flex-row sm:items-center sm:rounded-full"
              >
                <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                  <Search size={17} className="shrink-0 text-plz-grey" />
                  <span className="sr-only">Search places</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for restaurants, spas, activities…"
                    className="h-11 w-full bg-transparent text-[15px] text-plz-ink placeholder:text-plz-grey focus:outline-none"
                  />
                </label>

                <label className="flex items-center gap-2 border-plz-line px-3 sm:border-l">
                  <MapPin size={15} className="shrink-0 text-plz-grey" />
                  <span className="sr-only">City</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 bg-transparent text-[15px] font-medium text-plz-ink focus:outline-none"
                  >
                    <option>Lagos</option>
                    <option>Abuja</option>
                  </select>
                </label>

                <motion.button
                  type="submit"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-11 shrink-0 rounded-full bg-plz-blue px-7 text-[15px] font-semibold text-white transition-colors duration-micro ease-plz hover:bg-plz-blue-deep"
                >
                  Search
                </motion.button>
              </motion.form>

              {/* categories */}
              <div className="plz-rail mt-5 -mx-1 px-1 pb-1">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const active = id === category;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => setCategory(active ? null : id)}
                      aria-pressed={active}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                      className={
                        'flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors duration-micro ease-plz ' +
                        (active
                          ? 'bg-plz-blue text-white'
                          : 'border border-plz-line bg-white text-plz-ink hover:border-plz-ink')
                      }
                    >
                      <Icon size={15} />
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* the picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="relative min-w-0 lg:col-span-6 xl:col-span-6"
            >
              <div className="relative overflow-hidden rounded-[26px] lg:rounded-[32px]">
                <img
                  src={images.viRooftop}
                  alt="A rooftop restaurant in Victoria Island, Lagos, at dusk"
                  className="block aspect-[4/3] w-full object-cover lg:aspect-[16/11]"
                />
                <p
                  className="plz-script absolute right-7 top-6 text-right text-[24px] leading-[1.15] text-white md:text-[29px]"
                  style={{ textShadow: '0 1px 12px rgba(24,24,27,0.45)' }}
                >
                  Good Places
                  <br />
                  Brighter
                  <br />
                  People
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
                className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-panel"
              >
                <span className="flex -space-x-2">
                  {[images.brunchTable, images.nailStudio, images.barberShop].map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-plz-blue text-[10px] font-bold text-white">
                    7k+
                  </span>
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-plz-ink">{city}</span>
                  <span className="block text-[12px] text-plz-body">More life here</span>
                </span>
              </motion.div>
            </motion.div>
          </section>

          <p className="plz-edge mt-10 flex items-center justify-end gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-plz-grey">
            Discover places for a brighter you
            <ArrowRight size={14} />
          </p>

          {/* --------------------------------------------------- plan your outing */}
          <section id="budget" className="plz-edge mt-5">
            <div className="grid items-stretch gap-0 overflow-hidden rounded-[20px] border border-plz-line bg-white md:grid-cols-12">
              <div className="border-plz-line p-6 md:col-span-4 md:border-r">
                <h2 className="text-h4 text-plz-ink">Plan your outing</h2>
                <p className="mt-2 max-w-[34ch] text-[14px] text-plz-body">
                  Set a budget and we&apos;ll show you the best places within your range.
                </p>
              </div>

              <div className="border-plz-line p-6 md:col-span-4 md:border-r">
                <label htmlFor="plz-explore-budget" className="block text-[13px] text-plz-body">
                  Your budget
                </label>
                <output
                  htmlFor="plz-explore-budget"
                  className="mt-1 block text-[32px] font-semibold leading-none tracking-[-0.02em] text-plz-ink"
                >
                  {naira(budget)}
                </output>
                <input
                  id="plz-explore-budget"
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={5000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  aria-valuetext={naira(budget)}
                  className="plz-range mt-4"
                  style={{
                    background: `linear-gradient(to right, #2D60EA 0%, #2D60EA ${fill}%, #E4E4E7 ${fill}%, #E4E4E7 100%)`
                  }}
                />
                <div className="mt-2 flex justify-between text-[12px] text-plz-body">
                  <span>{naira(MIN)}</span>
                  <span>{naira(MAX)}</span>
                </div>
              </div>

              <div className="p-6 md:col-span-4">
                <div className="flex h-full items-start gap-3 rounded-[14px] bg-plz-cream p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plz-yellow">
                    <Wallet size={16} className="text-plz-ink" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-plz-ink">
                      Great experiences fit every budget.
                    </span>
                    <span className="mt-1 block text-[13px] text-plz-body">
                      Amazing places. Real prices. No guesswork.
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------ explore experiences */}
          <section id="experiences" className="plz-edge mt-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-h3 text-plz-ink">Explore experiences</h2>
                <p className="mt-1 text-[14px] text-plz-body">Curated ideas for every moment.</p>
              </div>
              <Link
                to="#experiences"
                className="hidden shrink-0 items-center gap-1.5 text-[14px] font-semibold text-plz-blue sm:flex"
              >
                View all experiences
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EXPERIENCES.map((experience, index) => (
                <motion.article
                  key={experience.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.45, ease: EASE, delay: index * 0.05 }}
                >
                  <Link
                    to="#experiences"
                    className="group block overflow-hidden rounded-[16px] border border-plz-line bg-white"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={experience.image}
                        alt={experience.name}
                        loading="lazy"
                        className="block aspect-[16/10] w-full object-cover transition-transform duration-editorial ease-plz group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-plz-ink">
                          {experience.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-plz-body">
                          {experience.blurb}
                        </span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-plz-line text-plz-ink transition-all duration-micro ease-plz group-hover:border-plz-blue group-hover:bg-plz-blue group-hover:text-white">
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>

          {/* ------------------------------------------- places within your budget */}
          <section id="offers" className="plz-edge mt-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-h3 text-plz-ink">Places within your budget</h2>
                <p className="mt-1 text-[14px] text-plz-body">
                  Handpicked spots that match your {naira(budget)} budget.
                </p>
              </div>
              <Link
                to="#offers"
                className="hidden shrink-0 items-center gap-1.5 text-[14px] font-semibold text-plz-blue sm:flex"
              >
                View all places
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <AnimatePresence mode="popLayout">
                {shown.map((venue, index) => {
                  const fits = venue.from <= budget;
                  const isSaved = saved.includes(venue.id);
                  return (
                    <motion.article
                      key={venue.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: EASE, delay: index * 0.04 }}
                      className="overflow-hidden rounded-[16px] border border-plz-line bg-white"
                    >
                      <div className="relative">
                        <img
                          src={venue.image}
                          alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
                          loading="lazy"
                          className="block aspect-[16/10] w-full object-cover"
                        />
                        {fits && (
                          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-[11px] font-semibold text-[#1B7F43]">
                            <Check size={11} strokeWidth={3} />
                            Within budget
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleSaved(venue.id)}
                          aria-pressed={isSaved}
                          aria-label={`${isSaved ? 'Remove' : 'Save'} ${venue.name}`}
                          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-plz-ink transition-transform duration-micro ease-plz hover:scale-105"
                        >
                          <Heart
                            size={15}
                            className={isSaved ? 'fill-plz-blue text-plz-blue' : undefined}
                          />
                        </button>
                      </div>

                      <div className="p-3.5">
                        <p className="truncate text-[15px] font-semibold text-plz-ink">{venue.name}</p>
                        <p className="mt-0.5 truncate text-[12px] text-plz-body">
                          {venue.kind} · {venue.area}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-plz-ink">
                            {nairaShort(venue.from)} – {nairaShort(venue.forTwo)}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-plz-ink">
                            <Star size={12} className="fill-plz-yellow text-plz-yellow" />
                            {venue.rating}
                            <span className="font-normal text-plz-grey">({venue.reviews})</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCompare(venue.id)}
                          className={
                            'mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-ctl text-[13px] font-semibold transition-colors duration-micro ease-plz ' +
                            (compare.includes(venue.id)
                              ? 'bg-plz-blue text-white'
                              : 'border border-plz-line text-plz-ink hover:border-plz-ink')
                          }
                        >
                          <Scale size={13} />
                          {compare.includes(venue.id) ? 'Added' : 'Compare'}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>

              {/* compare panel */}
              <motion.aside
                id="compare"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex flex-col justify-center rounded-[16px] bg-plz-lavender p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white">
                  <Scale size={17} className="text-plz-blue" />
                </span>
                <h3 className="mt-4 text-[18px] font-semibold leading-tight text-plz-ink">
                  Compare places side by side
                </h3>
                <p className="mt-2 text-[13px] text-plz-body">
                  Shortlist. Compare. Choose with confidence.
                </p>
                <p className="mt-3 text-[12px] font-medium text-plz-blue">
                  {compare.length === 0
                    ? 'Pick at least two places'
                    : `${compare.length} selected${compare.length >= 4 ? ' · max reached' : ''}`}
                </p>
                <motion.button
                  type="button"
                  disabled={compare.length < 2}
                  whileHover={compare.length < 2 ? undefined : { y: -2 }}
                  whileTap={compare.length < 2 ? undefined : { scale: 0.97 }}
                  className={
                    'mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-micro ease-plz ' +
                    (compare.length < 2
                      ? 'cursor-not-allowed bg-white/70 text-plz-grey'
                      : 'bg-plz-blue text-white hover:bg-plz-blue-deep')
                  }
                >
                  Start comparing
                  <ArrowRight size={14} />
                </motion.button>
              </motion.aside>
            </div>

            {shown.length === 0 && (
              <p className="mt-8 text-center text-[15px] text-plz-body">
                Nothing matches that yet. Try another category or raise your budget.
              </p>
            )}
          </section>

          {/* ------------------------------------------------------------ footer */}
          <section className="plz-edge mt-16 border-t border-plz-line pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="flex flex-wrap items-center gap-3">
                <PlazzaaLogo size={26} />
                <span className="text-[14px] text-plz-body">More places. Brighter days.</span>
              </p>
              <p className="text-[13px] tracking-[0.02em] text-plz-grey">
                People &nbsp;·&nbsp; Places &nbsp;·&nbsp; Possibilities
              </p>
            </div>
          </section>
        </main>

        <GatewayBar />
      </div>
    </SmoothScroll>
  );
}
