import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays, Check, Clock, Mail, MessageCircle, Search, X
} from 'lucide-react';
import { naira, statusOf, whenParts } from '../lib/merchantApi';
import { Badge, Button, Card, EmptyState, Skeleton } from './ui';

/**
 * Bookings — the full list, and one booking at a time in detail.
 *
 * The PRD's job here is narrow and worth respecting: find a booking, read who
 * it's for, and validate the payment. Filtering is by the states a merchant
 * actually sorts by, and the detail panel carries the contact routes — a
 * WhatsApp number is how these conversations really happen.
 */

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'awaiting_validation', label: 'Awaiting validation' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'payment_pending', label: 'Payment pending' },
  { key: 'expired,cancelled', label: 'Closed' }
];

function DetailRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-plz-grey" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-plz-body">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="break-words text-[14px] font-medium text-plz-blue hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="break-words text-[14px] font-medium text-plz-ink">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ detail panel */

function BookingDetail({ booking, onClose, onValidate, validating }) {
  // A panel over a scrim has to answer Escape, or the scrim becomes a trap.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const when = whenParts(booking.start_datetime);
  const status = statusOf(booking);
  const end = whenParts(booking.end_datetime);
  const whatsapp = booking.customer_whatsapp || booking.customer_phone;
  const digits = whatsapp ? String(whatsapp).replace(/[^\d]/g, '') : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-plz-ink/25"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        role="dialog"
        aria-modal="true"
        aria-label={'Booking ' + booking.booking_reference}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-panel"
      >
        <header className="flex items-start justify-between gap-3 border-b border-plz-line p-5">
          <div className="min-w-0">
            <Badge tone={status.tone}>{status.label}</Badge>
            <p className="mt-2.5 truncate text-[18px] font-semibold tracking-[-0.01em] text-plz-ink">
              {booking.customer_name || 'Customer'}
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-plz-body">
              {booking.booking_reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-[8px] p-1.5 text-plz-body transition-colors duration-micro ease-plz hover:bg-plz-surface hover:text-plz-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="rounded-[12px] bg-plz-surface/60 p-4">
            <p className="text-[13px] font-semibold text-plz-ink">
              {(booking.services && booking.services.name) || 'Service'}
            </p>
            <p className="mt-1.5 text-[13px] text-plz-body">
              {when.date} · {when.time}
              {end.time ? ` – ${end.time}` : ''}
            </p>
            <p className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-plz-ink">
              {naira(booking.total_amount)}
            </p>
          </div>

          <div className="mt-4 divide-y divide-plz-line">
            <DetailRow
              icon={Mail}
              label="Email"
              value={booking.customer_email}
              href={booking.customer_email ? 'mailto:' + booking.customer_email : null}
            />
            <DetailRow
              icon={MessageCircle}
              label="WhatsApp"
              value={whatsapp}
              href={digits ? 'https://wa.me/' + digits : null}
            />
            <DetailRow
              icon={Clock}
              label="Booked"
              value={
                booking.created_at
                  ? new Date(booking.created_at).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })
                  : null
              }
            />
            {booking.payment_marked_at && (
              <DetailRow
                icon={Check}
                label="Customer marked as paid"
                value={new Date(booking.payment_marked_at).toLocaleString('en-NG', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              />
            )}
            {booking.validated_at && (
              <DetailRow
                icon={Check}
                label="You validated"
                value={new Date(booking.validated_at).toLocaleString('en-NG', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              />
            )}
          </div>

          {booking.special_requests && (
            <div className="mt-4 rounded-[12px] border border-plz-line p-4">
              <p className="text-[12px] font-semibold text-plz-ink">Customer note</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-plz-body">
                {booking.special_requests}
              </p>
            </div>
          )}
        </div>

        {booking.status === 'awaiting_validation' && (
          <footer className="border-t border-plz-line p-5">
            <p className="text-[12px] leading-snug text-plz-body">
              Check the transfer landed in your account before validating. This confirms the
              booking and emails the customer.
            </p>
            <Button
              busy={validating}
              onClick={() => onValidate(booking)}
              className="mt-3 w-full"
            >
              {!validating && <Check size={15} />}
              Validate payment
            </Button>
          </footer>
        )}
      </motion.aside>
    </>
  );
}

/* ------------------------------------------------------------------ screen */

export default function Bookings({
  bookings, counts, loading, filter, onFilter, onValidate, validatingRef,
  selected, onSelect
}) {
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const rows = (bookings || []).filter((b) => {
    if (!term) return true;
    return [b.customer_name, b.customer_email, b.booking_reference, b.services && b.services.name]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(term));
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-plz-ink">Bookings</h1>
          <p className="mt-1 text-[14px] text-plz-body">
            Every booking, and where each one stands.
          </p>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plz-grey" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or reference"
            aria-label="Search bookings"
            className="h-10 w-full min-w-0 rounded-full border border-plz-line bg-white pl-10 pr-4 text-[13px] text-plz-ink placeholder:text-plz-grey focus:border-plz-blue focus:outline-none sm:w-[300px]"
          />
        </div>
      </header>

      {/* filters */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const count = key === 'all'
            ? counts.total
            : key.split(',').reduce((sum, k) => sum + (counts[k] || 0), 0);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilter(key)}
              className={
                'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-micro ease-plz ' +
                (active
                  ? 'bg-plz-ink text-white'
                  : 'border border-plz-line bg-white text-plz-body hover:text-plz-ink')
              }
            >
              {label}
              {count > 0 && (
                <span
                  className={
                    'rounded-full px-1.5 text-[11px] font-semibold ' +
                    (active ? 'bg-white/20' : 'bg-plz-surface text-plz-body')
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Card pad={false} className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={term ? Search : CalendarDays}
            title={term ? 'Nothing matches that' : 'No bookings here'}
            note={
              term
                ? 'Try a different name, email address or booking reference.'
                : 'When customers book through your link, they appear in this list.'
            }
          />
        ) : (
          <>
            {/* desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-plz-line bg-plz-surface/50">
                  {['Customer', 'Service', 'Date & time', 'Amount', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-plz-body"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-plz-line">
                {rows.map((b) => {
                  const when = whenParts(b.start_datetime);
                  const status = statusOf(b);
                  return (
                    <tr
                      key={b.id || b.booking_reference}
                      onClick={() => onSelect(b)}
                      className="cursor-pointer transition-colors duration-micro ease-plz hover:bg-plz-surface/50"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] font-semibold text-plz-ink">
                          {b.customer_name || 'Customer'}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-plz-body">
                          {b.customer_email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-plz-ink">
                          {(b.services && b.services.name) || '—'}
                        </p>
                        {b.services && b.services.duration_minutes && (
                          <p className="mt-0.5 text-[12px] text-plz-body">
                            {b.services.duration_minutes} mins
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-plz-ink">{when.date}</p>
                        <p className="mt-0.5 text-[12px] text-plz-body">{when.time}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-plz-ink">
                        {naira(b.total_amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {b.status === 'awaiting_validation' && (
                          <Button
                            size="sm"
                            busy={validatingRef === b.booking_reference}
                            onClick={(e) => { e.stopPropagation(); onValidate(b); }}
                          >
                            {validatingRef !== b.booking_reference && <Check size={14} />}
                            Validate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* mobile list */}
            <ul className="divide-y divide-plz-line md:hidden">
              {rows.map((b) => {
                const when = whenParts(b.start_datetime);
                const status = statusOf(b);
                return (
                  <li key={b.id || b.booking_reference}>
                    <button
                      type="button"
                      onClick={() => onSelect(b)}
                      className="block w-full px-4 py-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-plz-ink">
                            {b.customer_name || 'Customer'}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] text-plz-body">
                            {(b.services && b.services.name) || '—'}
                          </p>
                        </div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <p className="text-[12px] text-plz-body">
                          {when.date} · {when.time}
                        </p>
                        <p className="text-[13px] font-semibold text-plz-ink">
                          {naira(b.total_amount)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <AnimatePresence>
        {selected && (
          <BookingDetail
            booking={selected}
            onClose={() => onSelect(null)}
            onValidate={onValidate}
            validating={validatingRef === selected.booking_reference}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
