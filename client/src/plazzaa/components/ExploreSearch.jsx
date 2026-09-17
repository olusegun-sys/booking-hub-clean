import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, CalendarDays, Wallet } from 'lucide-react';
import { cities, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

/**
 * The marketplace opens on the tool, not on a story. Four fields in one panel:
 * what, where, when, and how much — the last one is the Plazzaa-specific field
 * the travel sites don't have.
 */
export default function ExploreSearch({ query, setQuery, city, setCity, budget, setBudget, when, setWhen }) {
  const [focused, setFocused] = useState(null);

  const field = (id, icon, label, control) => (
    <div
      className={
        'flex flex-1 items-center gap-3 px-4 py-3 transition-colors duration-micro ease-plz md:px-5 ' +
        (focused === id ? 'bg-plz-blue-wash' : 'bg-white')
      }
    >
      <span className="shrink-0 text-plz-grey">{icon}</span>
      <span className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-[12px] font-semibold uppercase tracking-[0.07em] text-plz-body">
          {label}
        </label>
        {control}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="overflow-hidden rounded-card border border-plz-line bg-white shadow-lift"
    >
      <div className="flex flex-col divide-y divide-plz-line md:flex-row md:divide-x md:divide-y-0">
        {field(
          'plz-q',
          <Search size={18} />,
          'What are you looking for?',
          <input
            id="plz-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused('plz-q')}
            onBlur={() => setFocused(null)}
            placeholder="Restaurants, spas, activities, stays…"
            className="w-full bg-transparent text-[16px] text-plz-ink placeholder:text-plz-grey focus:outline-none"
          />
        )}

        {field(
          'plz-city',
          <MapPin size={18} />,
          'Where',
          <select
            id="plz-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => setFocused('plz-city')}
            onBlur={() => setFocused(null)}
            className="w-full bg-transparent text-[16px] font-medium text-plz-ink focus:outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {field(
          'plz-when',
          <CalendarDays size={18} />,
          'When',
          <select
            id="plz-when"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            onFocus={() => setFocused('plz-when')}
            onBlur={() => setFocused(null)}
            className="w-full bg-transparent text-[16px] font-medium text-plz-ink focus:outline-none"
          >
            {['Tonight', 'Tomorrow', 'This weekend', 'Next week'].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        )}

        {field(
          'plz-budget',
          <Wallet size={18} />,
          'Budget per person',
          <div className="flex items-center gap-3">
            <input
              id="plz-budget"
              type="range"
              min={5000}
              max={150000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              onFocus={() => setFocused('plz-budget')}
              onBlur={() => setFocused(null)}
              className="plz-range h-1.5 flex-1"
              aria-valuetext={nairaShort(budget) + ' per person'}
              style={{
                background: `linear-gradient(to right, #2D60EA 0%, #2D60EA ${((budget - 5000) / 145000) * 100}%, #E4E4E7 ${((budget - 5000) / 145000) * 100}%, #E4E4E7 100%)`
              }}
            />
            <span className="w-[54px] shrink-0 text-[16px] font-semibold text-plz-ink">
              {nairaShort(budget)}
            </span>
          </div>
        )}

        <div className="flex items-center bg-white p-3 md:p-2">
          <button type="button" className="plz-btn plz-btn-primary w-full md:h-[68px] md:w-[68px] md:px-0">
            <Search size={20} />
            <span className="md:sr-only">Search</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
