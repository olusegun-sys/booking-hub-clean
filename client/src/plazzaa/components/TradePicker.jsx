import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Search, X } from 'lucide-react';
import { tradeGroups, popularTradeIds, allTrades, findTrade } from '../lib/data';

/**
 * "What do you do?" — a short row of the common answers, and a way to the rest.
 *
 * Showing fifty trades at sign-up is a wall; showing six is a guess that leaves
 * most merchants out. So the popular handful sit inline, and everything else is
 * one tap away in a searchable sheet. A trade chosen from the sheet joins the
 * inline row, so the answer is always visible next to the question.
 */

const Chip = ({ active, children, ...rest }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    aria-pressed={active}
    className={
      'rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors duration-micro ease-plz ' +
      (active
        ? 'border-plz-blue bg-plz-blue text-white'
        : 'border-plz-line bg-white text-plz-body hover:border-plz-line-strong hover:text-plz-ink')
    }
    {...rest}
  >
    {children}
  </motion.button>
);

export default function TradePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  // The inline row: the popular set, plus whatever was picked from the sheet.
  const inline = useMemo(() => {
    const ids = [...popularTradeIds];
    if (value && !ids.includes(value)) ids.push(value);
    return ids.map(findTrade).filter(Boolean);
  }, [value]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tradeGroups;
    return tradeGroups
      .map((g) => ({ ...g, trades: g.trades.filter((t) => t.label.toLowerCase().includes(term)) }))
      .filter((g) => g.trades.length);
  }, [query]);

  // A sheet over the page owns Escape and the body scroll while it is up.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focus = setTimeout(() => searchRef.current && searchRef.current.focus(), 80);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      clearTimeout(focus);
    };
  }, [open]);

  const pick = (id) => { onChange(id); setOpen(false); setQuery(''); };

  return (
    <>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {inline.map((trade) => (
          <Chip
            key={trade.id}
            active={value === trade.id}
            onClick={() => onChange(trade.id)}
          >
            {trade.label}
          </Chip>
        ))}

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.97 }}
          aria-haspopup="dialog"
          className="flex items-center gap-1.5 rounded-full border border-dashed border-plz-line-strong px-3.5 py-2 text-[13px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:border-plz-blue hover:text-plz-blue"
        >
          <Plus size={14} />
          More
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-plz-ink/35"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Choose what you do"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col rounded-t-[20px] bg-white shadow-panel sm:inset-0 sm:m-auto sm:h-[640px] sm:max-h-[86vh] sm:w-[min(560px,92vw)] sm:rounded-[20px]"
            >
              <header className="shrink-0 border-b border-plz-line p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-plz-ink">
                      What do you do?
                    </h2>
                    <p className="mt-1 text-[13px] text-plz-body">
                      Pick the closest match. You can change it later.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="shrink-0 rounded-[8px] p-1.5 text-plz-body transition-colors duration-micro ease-plz hover:bg-plz-surface hover:text-plz-ink"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mt-4">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plz-grey" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search trades"
                    aria-label="Search trades"
                    className="h-11 w-full rounded-[10px] border border-plz-line bg-white pl-10 pr-4 text-[14px] text-plz-ink placeholder:text-plz-grey focus:border-plz-blue focus:outline-none focus:ring-2 focus:ring-plz-blue/15"
                  />
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {results.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[14px] font-semibold text-plz-ink">No match for “{query}”</p>
                    <p className="mx-auto mt-2 max-w-[38ch] text-[13px] leading-relaxed text-plz-body">
                      Choose the nearest thing — what you offer is set up in your own words later.
                    </p>
                  </div>
                ) : (
                  results.map((group) => (
                    <section key={group.group} className="mb-6 last:mb-0">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-plz-grey">
                        {group.group}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.trades.map((trade) => {
                          const active = value === trade.id;
                          return (
                            <Chip key={trade.id} active={active} onClick={() => pick(trade.id)}>
                              {active && <Check size={13} className="mr-1 inline align-[-2px]" />}
                              {trade.label}
                            </Chip>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>

              <footer className="shrink-0 border-t border-plz-line px-5 py-3">
                <p className="text-[12px] text-plz-grey">
                  {allTrades.length} trades · nothing here fits? Pick the nearest one.
                </p>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
