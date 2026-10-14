import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, BedDouble, Building2, Check, ChevronDown, Coffee, Dumbbell,
  Heart, Hotel, Home, Palette, PartyPopper, Sparkle, Sparkles, Store,
  Utensils, X
} from 'lucide-react';

/**
 * "Business type" — the picker Booking Hub shipped, carried over.
 *
 * The values here (hotel, apartment, event_hall, restaurant, diner, cafe,
 * other_food, sports, spa, beauty_salon, activity_place) are the same enum the
 * rest of the app already branches on — the public business page, the explore
 * grid, the admin dashboard. A merchant's type has to stay one of these for
 * those screens to keep showing the right icon and layout; it isn't a free
 * label like the trades used elsewhere in this app.
 *
 * The three groups reuse tones already meaningful elsewhere in the product —
 * blue, green and amber are the same pair used for booking statuses — so nothing
 * new is introduced just for this picker.
 */

const GROUPS = [
  {
    id: 'stays',
    label: 'Stays',
    icon: BedDouble,
    tone: 'text-plz-blue',
    chip: 'bg-[#EEF3FE] text-plz-blue',
    ring: 'border-plz-blue bg-[#EEF3FE]',
    options: [
      { value: 'hotel', label: 'Hotels', note: 'Rooms & suites', icon: Hotel },
      { value: 'apartment', label: 'Apartments', note: 'Short-let stays', icon: Home },
      { value: 'event_hall', label: 'Event halls', note: 'Halls & venues', icon: PartyPopper }
    ]
  },
  {
    id: 'food',
    label: 'Food',
    icon: Utensils,
    tone: 'text-[#1B7F43]',
    chip: 'bg-[#EAF7EF] text-[#1B7F43]',
    ring: 'border-[#1B7F43] bg-[#EAF7EF]',
    options: [
      { value: 'restaurant', label: 'Restaurants', note: 'Full-service dining', icon: Utensils },
      { value: 'diner', label: 'Diners', note: 'Casual eats', icon: Store },
      { value: 'cafe', label: 'Cafés', note: 'Coffee & light bites', icon: Coffee },
      { value: 'other_food', label: 'Other food & drink', note: 'Something else', icon: Sparkle }
    ]
  },
  {
    id: 'others',
    label: 'Others',
    icon: Sparkles,
    tone: 'text-[#B0840F]',
    chip: 'bg-[#FEF8E7] text-[#B0840F]',
    ring: 'border-[#B0840F] bg-[#FEF8E7]',
    options: [
      { value: 'sports', label: 'Sports', note: 'Courts & pitches', icon: Dumbbell },
      { value: 'spa', label: 'Spa', note: 'Spa & massage', icon: Heart },
      { value: 'beauty_salon', label: 'Beauty salons', note: 'Hair, nails & beauty', icon: Palette },
      { value: 'activity_place', label: 'Activity place', note: 'Games & activities', icon: Activity }
    ]
  }
];

const ALL = GROUPS.flatMap((g) => g.options.map((o) => ({ ...o, group: g })));

export const findBusinessType = (value) => ALL.find((o) => o.value === value) || null;

export default function BusinessTypeModal({ value, onChange, open, onOpenChange }) {
  const selected = findBusinessType(value);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onOpenChange]);

  const pick = (opt) => { onChange(opt.value); onOpenChange(false); };

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-haspopup="dialog"
        className="mt-2.5 flex h-12 w-full items-center gap-2.5 rounded-[10px] border border-plz-line bg-white px-3.5 text-left text-[15px] text-plz-ink transition-colors duration-micro ease-plz hover:border-plz-line-strong focus:border-plz-blue focus:outline-none focus:ring-2 focus:ring-plz-blue/15"
      >
        {selected ? (
          <>
            <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ' + selected.group.chip}>
              <selected.icon size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate">{selected.label}</span>
          </>
        ) : (
          <>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-plz-surface">
              <Building2 size={14} className="text-plz-grey" />
            </span>
            <span className="min-w-0 flex-1 truncate text-plz-grey">Select your business type</span>
          </>
        )}
        <ChevronDown size={16} className="ml-auto shrink-0 text-plz-grey" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 z-50 bg-plz-ink/35"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Choose your business type"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col rounded-t-[20px] bg-white shadow-panel sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[86vh] sm:w-[min(560px,92vw)] sm:rounded-[20px]"
            >
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-plz-line p-5">
                <div>
                  <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-plz-ink">
                    What type of business is this?
                  </h2>
                  <p className="mt-1 text-[13px] text-plz-body">
                    This shapes how your booking page looks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="shrink-0 rounded-[8px] p-1.5 text-plz-body transition-colors duration-micro ease-plz hover:bg-plz-surface hover:text-plz-ink"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <section key={group.id} className="mb-6 last:mb-0">
                      <h3
                        className={
                          'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] ' +
                          group.tone
                        }
                      >
                        <GroupIcon size={12} />
                        {group.label}
                      </h3>

                      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {group.options.map((opt) => {
                          const Icon = opt.icon;
                          const active = value === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              whileTap={{ scale: 0.97 }}
                              onClick={() => pick(opt)}
                              aria-pressed={active}
                              className={
                                'relative flex flex-col items-start gap-2 rounded-[12px] border p-3.5 text-left transition-colors duration-micro ease-plz ' +
                                (active
                                  ? group.ring
                                  : 'border-plz-line bg-white hover:border-plz-line-strong')
                              }
                            >
                              {active && (
                                <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-current">
                                  <Check size={10} strokeWidth={3.5} className="text-white" />
                                </span>
                              )}
                              <span
                                className={
                                  'flex h-8 w-8 items-center justify-center rounded-[9px] ' +
                                  (active ? 'bg-white/70' : 'bg-plz-surface')
                                }
                              >
                                <Icon size={15} className={active ? group.tone : 'text-plz-body'} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[13px] font-semibold leading-tight text-plz-ink">
                                  {opt.label}
                                </span>
                                <span className="mt-0.5 block text-[11px] leading-tight text-plz-body">
                                  {opt.note}
                                </span>
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
