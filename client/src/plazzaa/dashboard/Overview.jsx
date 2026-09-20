import { motion } from 'motion/react';
import {
  AlertCircle, ArrowRight, CalendarDays, Check, ChevronRight, Copy, Link2,
  Share2, Wallet
} from 'lucide-react';
import { naira, statusOf, whenParts } from '../lib/merchantApi';
import { Badge, Button, Card, CardHead, EmptyState, Skeleton, SPRING } from './ui';

/**
 * Dashboard — the landing screen.
 *
 * Ordered by what a merchant needs to act on: the four counts, then the
 * bookings waiting on them, then what's coming up, with the booking link and
 * setup progress held in the right rail where they stay reachable.
 */

const CHECK_COPY = {
  has_active_service: { label: 'Add your services', note: 'What you offer, priced', to: 'setup' },
  has_opening_hours: { label: 'Set your opening hours', note: 'When you take bookings', to: 'setup' },
  has_bank_account: { label: 'Add bank details', note: 'Where customers pay', to: 'setup' },
  has_slug: { label: 'Publish your booking link', note: 'Make your page live', to: 'settings' }
};

function StatCard({ label, value, tone, iconTone, icon: Icon, index, onClick, active }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={
        'block rounded-[14px] p-4 text-left transition-shadow duration-micro ease-plz hover:shadow-lift ' +
        tone +
        (active ? ' ring-2 ring-plz-blue ring-offset-2' : '')
      }
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white">
        <Icon size={15} className={iconTone} />
      </span>
      <span className="mt-3 block text-[12px] leading-tight text-plz-body">{label}</span>
      <span className="mt-1 block text-[26px] font-semibold leading-none tracking-[-0.02em] text-plz-ink">
        {value}
      </span>
    </motion.button>
  );
}

function BookingRow({ booking, onOpen, onValidate, validating }) {
  const when = whenParts(booking.start_datetime);
  const status = statusOf(booking);
  const canValidate = booking.status === 'awaiting_validation';

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors duration-micro ease-plz hover:bg-plz-surface/50"
    >
      <button
        type="button"
        onClick={() => onOpen(booking)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-[14px] font-semibold text-plz-ink">
          {booking.customer_name || 'Customer'}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-plz-body">
          {(booking.services && booking.services.name) || 'Service'} · {when.date} at {when.time}
        </span>
      </button>

      <span className="text-[13px] font-semibold text-plz-ink">{naira(booking.total_amount)}</span>
      <Badge tone={status.tone}>{status.label}</Badge>

      {canValidate ? (
        <Button
          variant="primary"
          busy={validating}
          size="sm"
          onClick={() => onValidate(booking)}
        >
          {!validating && <Check size={14} />}
          Validate
        </Button>
      ) : (
        <ChevronRight size={16} className="text-plz-grey" />
      )}
    </motion.li>
  );
}

export default function Overview({
  business, loading, error, counts, awaiting, upcoming, setup,
  bookingUrl, onCopyLink, onGo, onOpenBooking, onValidate, validatingRef
}) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = (business?.owner_name || business?.name || '').split(' ')[0];
  const doneCount = setup ? Object.values(setup.checks || {}).filter(Boolean).length : 0;
  const checkKeys = Object.keys(CHECK_COPY);

  const received = (upcoming || [])
    .concat(awaiting || [])
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  const stats = [
    {
      label: 'Total bookings', value: loading ? '—' : String(counts.total ?? 0),
      tone: 'bg-[#EEF3FE]', iconTone: 'text-plz-blue', icon: CalendarDays, to: 'bookings'
    },
    {
      label: 'Awaiting validation', value: loading ? '—' : String(counts.awaiting_validation ?? 0),
      tone: 'bg-[#FEF8E7]', iconTone: 'text-[#B0840F]', icon: AlertCircle, to: 'bookings:awaiting_validation'
    },
    {
      label: 'Confirmed', value: loading ? '—' : String(counts.confirmed ?? 0),
      tone: 'bg-[#EAF7EF]', iconTone: 'text-[#1B7F43]', icon: Check, to: 'bookings:confirmed'
    },
    {
      label: 'Confirmed value', value: loading ? '—' : naira(received),
      tone: 'bg-[#F0EEFE]', iconTone: 'text-[#5B4BD6]', icon: Wallet, to: 'bookings:confirmed'
    }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* ---------------------------------------------------------- greeting */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-plz-ink">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-1 text-[14px] text-plz-body">
              Here&apos;s what&apos;s happening with your bookings.
            </p>
          </div>
          <p className="text-[13px] text-plz-body">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </p>
        </div>

        {/* ------------------------------------------------------------- stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} onClick={() => onGo(s.to)} />
          ))}
        </div>

        {/* -------------------------------------------- awaiting validation */}
        <Card className="mt-5" pad={false}>
          <div className="border-b border-plz-line px-5 py-4">
            <CardHead
              title="Waiting on you"
              note="Customers who say they've paid. Confirm the transfer landed, then validate."
              action={
                (awaiting || []).length > 0 && (
                  <Badge tone="bg-[#FEF8E7] text-[#B0840F]">{awaiting.length} to check</Badge>
                )
              }
            />
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (awaiting || []).length === 0 ? (
            <EmptyState
              icon={Check}
              title="Nothing waiting"
              note="When a customer marks a transfer as sent, their booking will appear here for you to validate."
            />
          ) : (
            <ul className="divide-y divide-plz-line">
              {awaiting.map((b) => (
                <BookingRow
                  key={b.id || b.booking_reference}
                  booking={b}
                  onOpen={onOpenBooking}
                  onValidate={onValidate}
                  validating={validatingRef === b.booking_reference}
                />
              ))}
            </ul>
          )}
        </Card>

        {/* ------------------------------------------------------- upcoming */}
        <Card className="mt-5" pad={false}>
          <div className="border-b border-plz-line px-5 py-4">
            <CardHead
              title="Coming up"
              note="Your confirmed bookings, soonest first."
              action={
                <Button variant="ghost" size="sm" onClick={() => onGo('bookings')}>
                  See all
                  <ArrowRight size={14} />
                </Button>
              }
            />
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (upcoming || []).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No bookings yet"
              note={
                setup && setup.ready
                  ? 'Your page is live. Share your booking link and bookings will land here.'
                  : 'Finish your setup and share your booking link — confirmed bookings show up here.'
              }
              action={
                <Button onClick={() => onGo(setup && setup.ready ? 'settings' : 'setup')}>
                  {setup && setup.ready ? 'Share your link' : 'Finish setup'}
                  <ArrowRight size={15} />
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-plz-line">
              {upcoming.map((b) => (
                <BookingRow
                  key={b.id || b.booking_reference}
                  booking={b}
                  onOpen={onOpenBooking}
                  onValidate={onValidate}
                  validating={validatingRef === b.booking_reference}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ------------------------------------------------------------- rail */}
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <div className="flex items-start justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EEF3FE]">
                <Link2 size={15} className="text-plz-blue" />
              </span>
              <span className="text-[14px] font-semibold text-plz-ink">Your booking link</span>
            </span>
            {setup && (
              <Badge
                dot
                tone={setup.ready ? 'bg-[#EAF7EF] text-[#1B7F43]' : 'bg-[#FEF8E7] text-[#B0840F]'}
              >
                {setup.ready ? 'Live' : 'Not live'}
              </Badge>
            )}
          </div>

          <p className="mt-2.5 text-[13px] leading-snug text-plz-body">
            {!setup
              ? 'Share this with your customers to take bookings around the clock.'
              : setup.ready
                ? 'Share this with your customers to take bookings around the clock.'
                : 'Finish the steps below to make your booking page live.'}
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-plz-line bg-plz-surface/50 px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-plz-ink">
              {bookingUrl ? bookingUrl.replace(/^https?:\/\//, '') : 'Not published yet'}
            </span>
            <button
              type="button"
              onClick={onCopyLink}
              disabled={!bookingUrl}
              aria-label="Copy booking link"
              className="shrink-0 text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink disabled:opacity-40"
            >
              <Copy size={14} />
            </button>
          </div>

          <Button
            onClick={onCopyLink}
            disabled={!bookingUrl}
            className="mt-3 w-full"
          >
            <Share2 size={14} />
            Copy booking link
          </Button>
        </Card>

        {/* setup progress */}
        {setup && !setup.ready && (
          <Card>
            <div className="flex items-baseline justify-between">
              <p className="text-[14px] font-semibold text-plz-ink">Quick setup</p>
              <p className="text-[12px] text-plz-body">{doneCount} of {checkKeys.length} done</p>
            </div>

            <div className="mt-2.5 flex gap-1" aria-hidden="true">
              {checkKeys.map((key) => (
                <motion.span
                  key={key}
                  layout
                  transition={SPRING}
                  className={
                    'h-1.5 flex-1 rounded-full ' +
                    (setup.checks[key] ? 'bg-plz-blue' : 'bg-plz-line')
                  }
                />
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-1">
              {checkKeys.map((key) => {
                const copy = CHECK_COPY[key];
                const done = Boolean(setup.checks[key]);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => onGo(copy.to)}
                      className="flex w-full items-start gap-2.5 rounded-[10px] p-2 text-left transition-colors duration-micro ease-plz hover:bg-plz-surface"
                    >
                      <span
                        className={
                          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ' +
                          (done ? 'bg-[#1B7F43] text-white' : 'border border-plz-line-strong')
                        }
                      >
                        {done && <Check size={10} strokeWidth={3.5} />}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span
                          className={
                            'block text-[13px] font-semibold ' +
                            (done ? 'text-plz-grey line-through' : 'text-plz-ink')
                          }
                        >
                          {copy.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-plz-body">{copy.note}</span>
                      </span>
                      {!done && <ChevronRight size={14} className="mt-0.5 shrink-0 text-plz-grey" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {/* encouragement — the brand's voice, kept to one quiet panel */}
        <div className="relative overflow-hidden rounded-[14px] bg-plz-lavender p-5">
          <p className="plz-script absolute right-4 top-4 text-right text-[17px] leading-tight text-plz-ink/40">
            Happy Customers
            <br />
            Brighter Days
          </p>
          <p className="max-w-[60%] text-[14px] font-semibold leading-tight text-plz-ink">
            Every booking in one place
          </p>
          <p className="mt-2 max-w-[90%] text-[12px] leading-snug text-plz-body">
            No more chasing confirmations across WhatsApp and your inbox.
          </p>
        </div>

        {error && (
          <p className="rounded-[10px] bg-[#FDEEF0] px-4 py-3 text-[13px] text-[#A32E4C]">{error}</p>
        )}
      </div>
    </div>
  );
}
