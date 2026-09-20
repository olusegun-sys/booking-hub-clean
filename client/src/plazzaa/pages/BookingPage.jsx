import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft,
  ChevronRight, Clock, Copy, Loader2, MapPin, Users
} from 'lucide-react';
import API_BASE from '../../config';
import PlazzaaLogo from '../components/PlazzaaLogo';
import { EASE } from '../lib/motion';

/**
 * The merchant's public booking page — what a customer sees behind the link.
 *
 * Four steps, in the order the MVP scope sets out: choose a service, choose a
 * time, leave your details, then pay by transfer and say you've paid. Nothing
 * is held until the details step is submitted, and the hold is what gives the
 * customer a reference to put in the transfer narration.
 *
 * Payment happens in the customer's own bank app: Plazzaa never touches the
 * money, and the merchant validates the transfer from their dashboard.
 */

const naira = (v) => '₦' + Math.round(Number(v) || 0).toLocaleString('en-NG');

const isoDate = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const prettyDate = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

async function call(path, options) {
  const response = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok || (data && data.success === false)) {
    throw new Error((data && data.error) || 'Something went wrong. Please try again.');
  }
  return data || {};
}

/* ------------------------------------------------------------------- chrome */

function Shell({ business, children, onBack }) {
  return (
    <div className="plz-root min-h-screen bg-[#F7F8FB]">
      <header className="border-b border-plz-line bg-white">
        <div className="mx-auto flex max-w-[820px] items-center gap-3 px-5 py-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-[14px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          ) : (
            <Link to="/" aria-label="Plazzaa home">
              <PlazzaaLogo size={22} />
            </Link>
          )}
          <p className="ml-auto truncate text-[14px] font-semibold text-plz-ink">
            {business ? business.name : ''}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-5 py-7">{children}</main>

      <footer className="mx-auto max-w-[820px] px-5 pb-10">
        <div className="flex items-center gap-2 text-[12px] text-plz-grey">
          Powered by
          <Link to="/" className="font-semibold text-plz-body hover:text-plz-ink">Plazzaa</Link>
        </div>
      </footer>
    </div>
  );
}

function Stepper({ step }) {
  const labels = ['Service', 'Time', 'Details', 'Payment'];
  return (
    <ol className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => (
        <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex min-w-0 flex-col gap-1.5">
            <motion.span
              animate={{ backgroundColor: i <= step ? '#2D60EA' : '#E4E4E7' }}
              transition={{ duration: 0.3 }}
              className="h-1 rounded-full"
            />
            <span
              className={
                'truncate text-[11px] font-semibold uppercase tracking-[0.06em] ' +
                (i <= step ? 'text-plz-blue' : 'text-plz-grey')
              }
            >
              {label}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const CARD = 'rounded-[14px] border border-plz-line bg-white';
const FIELD =
  'mt-2 h-12 w-full rounded-[10px] border border-plz-line bg-white px-3.5 text-[15px] text-plz-ink ' +
  'placeholder:text-plz-grey focus:border-plz-blue focus:outline-none focus:ring-2 focus:ring-plz-blue/15';

/* ------------------------------------------------------------------- screen */

export default function BookingPage() {
  const { businessSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);

  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(() => isoDate(new Date()));
  const [slots, setSlots] = useState(null);
  const [slotsClosed, setSlotsClosed] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [booking, setBooking] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [marking, setMarking] = useState(false);
  const [copied, setCopied] = useState('');

  /* ------------------------------------------------------------ the business */

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    call(`/api/v1/public/businesses/${encodeURIComponent(businessSlug)}`)
      .then((data) => {
        if (cancelled) return;
        setBusiness(data.business || null);
        setServices(data.services || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [businessSlug]);

  /* ------------------------------------------------------------ availability */

  const loadSlots = useCallback((forService, forDate) => {
    if (!forService) return;
    setSlotsLoading(true);
    setSlots(null);
    setSlotsClosed(null);
    call(
      `/api/v1/public/businesses/${encodeURIComponent(businessSlug)}` +
      `/services/${encodeURIComponent(forService.slug)}/availability?date=${forDate}`
    )
      .then((data) => {
        const a = data.availability || {};
        setSlots(a.slots || []);
        setSlotsClosed(a.closed ? (a.reason || 'Closed on this day') : null);
        setSlotsLoading(false);
      })
      .catch((err) => {
        setSlots([]);
        setSlotsClosed(err.message);
        setSlotsLoading(false);
      });
  }, [businessSlug]);

  useEffect(() => {
    if (step === 1 && service) loadSlots(service, date);
  }, [step, service, date, loadSlots]);

  /* ---------------------------------------------------------------- actions */

  const chooseService = (s) => { setService(s); setSlot(null); setStep(1); };

  const submitDetails = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!form.email.includes('@')) next.email = 'We need a valid email for your confirmation.';
    if (form.whatsapp.replace(/\D/g, '').length < 10) next.whatsapp = 'A WhatsApp number we can reach you on.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setSubmitError('');

    call('/api/v1/public/bookings', {
      method: 'POST',
      body: JSON.stringify({
        business_slug: businessSlug,
        service_slug: service.slug,
        start_datetime: slot.start,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_whatsapp: form.whatsapp.trim(),
        special_requests: form.notes.trim() || null
      })
    })
      .then((data) => {
        setBooking(data.booking);
        setBankAccount(data.bankAccount);
        setStep(3);
        setSubmitting(false);
        window.scrollTo({ top: 0 });
      })
      .catch((err) => {
        setSubmitError(err.message);
        setSubmitting(false);
      });
  };

  const markPaid = () => {
    setMarking(true);
    call(`/api/v1/public/bookings/${booking.booking_reference}/mark-paid`, { method: 'POST' })
      .then((data) => {
        setBooking(data.booking || { ...booking, status: 'awaiting_validation' });
        setMarking(false);
      })
      .catch((err) => {
        setSubmitError(err.message);
        setMarking(false);
      });
  };

  const copy = (value, key) => {
    navigator.clipboard.writeText(value)
      .then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); })
      .catch(() => {});
  };

  /* ----------------------------------------------------------------- states */

  if (loading) {
    return (
      <Shell business={null}>
        <div className="flex flex-col items-center py-24 text-plz-body">
          <Loader2 size={22} className="animate-spin" />
          <p className="mt-3 text-[14px]">Loading this booking page…</p>
        </div>
      </Shell>
    );
  }

  if (loadError || !business) {
    return (
      <Shell business={null}>
        <div className={CARD + ' p-8 text-center'}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-plz-surface">
            <AlertCircle size={20} className="text-plz-grey" />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-plz-ink">
            This booking page isn&apos;t available
          </p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-plz-body">
            {loadError && /not found/i.test(loadError)
              ? 'The link may be mistyped, or the business may have taken their page down.'
              : 'We could not load this page right now. Please try again in a moment.'}
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-[10px] bg-plz-blue px-5 text-[15px] font-semibold text-white hover:bg-plz-blue-deep"
          >
            Explore Plazzaa
            <ArrowRight size={15} />
          </Link>
        </div>
      </Shell>
    );
  }

  /* ---------------------------------------------------------- 4. payment */

  if (step === 3 && booking) {
    const confirmed = booking.status === 'confirmed';
    const awaiting = booking.status === 'awaiting_validation';

    return (
      <Shell business={business}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <div className={CARD + ' overflow-hidden'}>
            <div
              className={
                'flex items-start gap-3 px-6 py-5 ' +
                (confirmed ? 'bg-[#EAF7EF]' : awaiting ? 'bg-[#FEF8E7]' : 'bg-[#EEF3FE]')
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                {confirmed ? <Check size={17} className="text-[#1B7F43]" />
                  : awaiting ? <Clock size={17} className="text-[#B0840F]" />
                    : <CalendarDays size={17} className="text-plz-blue" />}
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-semibold text-plz-ink">
                  {confirmed ? 'Your booking is confirmed'
                    : awaiting ? 'Thanks — payment reported'
                      : 'Your slot is held'}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-plz-body">
                  {confirmed ? 'See you then. A confirmation is on its way to your email.'
                    : awaiting ? `${business.name} will check the transfer and confirm your booking. You'll get an email the moment they do.`
                      : 'Make the transfer below to confirm it. Your slot is held until you do.'}
                </p>
              </div>
            </div>

            <div className="border-t border-plz-line px-6 py-5">
              <dl className="flex flex-col gap-3">
                {[
                  ['Service', service ? service.name : (booking.services && booking.services.name)],
                  ['When', slot ? `${prettyDate(date)} · ${slot.label}` : null],
                  ['Amount', naira(booking.total_amount)],
                  ['Name', booking.customer_name]
                ].filter(([, v]) => v).map(([term, value]) => (
                  <div key={term} className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-[13px] text-plz-body">{term}</dt>
                    <dd className="text-[14px] font-semibold text-plz-ink">{value}</dd>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-plz-line pt-3">
                  <dt className="text-[13px] text-plz-body">Booking reference</dt>
                  <dd className="flex items-center gap-2">
                    <span className="font-mono text-[14px] font-semibold text-plz-ink">
                      {booking.booking_reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(booking.booking_reference, 'ref')}
                      aria-label="Copy booking reference"
                      className="text-plz-body hover:text-plz-ink"
                    >
                      {copied === 'ref' ? <Check size={14} className="text-[#1B7F43]" /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* bank transfer */}
          {!confirmed && (
            <div className={CARD + ' mt-5 p-6'}>
              <p className="text-[15px] font-semibold text-plz-ink">
                {awaiting ? 'Account you paid into' : 'Pay by bank transfer'}
              </p>

              {bankAccount ? (
                <>
                  {!awaiting && (
                    <p className="mt-1.5 text-[14px] leading-relaxed text-plz-body">
                      Transfer {naira(booking.total_amount)} and put your booking reference in the
                      narration so {business.name} can match it.
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-[12px] bg-plz-line">
                    {[
                      ['Bank', bankAccount.bank_name, 'bank'],
                      ['Account number', bankAccount.account_number, 'acct'],
                      ['Account name', bankAccount.account_name, 'name'],
                      ['Narration', booking.booking_reference, 'narr']
                    ].map(([label, value, key]) => (
                      <div key={key} className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                        <span className="text-[13px] text-plz-body">{label}</span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-plz-ink">{value}</span>
                          <button
                            type="button"
                            onClick={() => copy(String(value), key)}
                            aria-label={'Copy ' + label.toLowerCase()}
                            className="shrink-0 text-plz-body hover:text-plz-ink"
                          >
                            {copied === key ? <Check size={14} className="text-[#1B7F43]" /> : <Copy size={14} />}
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-[14px] leading-relaxed text-plz-body">
                  {business.name} hasn&apos;t added bank details yet. Please contact them on{' '}
                  {business.phone || 'their listed number'} to arrange payment.
                </p>
              )}

              {submitError && (
                <p className="mt-4 rounded-[10px] bg-[#FDEEF0] px-4 py-3 text-[13px] text-[#A32E4C]">
                  {submitError}
                </p>
              )}

              {!awaiting && bankAccount && (
                <motion.button
                  type="button"
                  onClick={markPaid}
                  disabled={marking}
                  whileHover={marking ? undefined : { y: -2 }}
                  whileTap={marking ? undefined : { scale: 0.985 }}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-plz-blue text-[15px] font-semibold text-white hover:bg-plz-blue-deep disabled:opacity-70"
                >
                  {marking ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  I have made payment
                </motion.button>
              )}

              {awaiting && (
                <p className="mt-4 flex items-start gap-2 rounded-[10px] bg-plz-surface px-4 py-3 text-[13px] leading-relaxed text-plz-body">
                  <Clock size={14} className="mt-0.5 shrink-0" />
                  Keep your transfer receipt handy in case {business.name} asks for it.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </Shell>
    );
  }

  /* ------------------------------------------------------- 1-3. the flow */

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <Shell business={business} onBack={step > 0 ? () => setStep(step - 1) : undefined}>
      {/* business header */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mb-6">
          <h1 className="text-h3 text-plz-ink">{business.name}</h1>
          {(business.city || business.address) && (
            <p className="mt-2 flex items-center gap-1.5 text-[14px] text-plz-body">
              <MapPin size={14} className="shrink-0" />
              {[business.address, business.city].filter(Boolean).join(', ')}
            </p>
          )}
          {business.description && (
            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-plz-body">
              {business.description}
            </p>
          )}
        </motion.div>
      )}

      <Stepper step={step} />

      <AnimatePresence mode="wait">
        {/* ------------------------------------------------------ 1. service */}
        {step === 0 && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <h2 className="text-[17px] font-semibold text-plz-ink">What would you like to book?</h2>

            {services.length === 0 ? (
              <div className={CARD + ' mt-4 px-6 py-12 text-center'}>
                <p className="text-[15px] font-semibold text-plz-ink">Nothing to book just yet</p>
                <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-plz-body">
                  {business.name} hasn&apos;t published their services yet. Check back shortly.
                </p>
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {services.map((s) => (
                  <li key={s.id}>
                    <motion.button
                      type="button"
                      onClick={() => chooseService(s)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.995 }}
                      className={CARD + ' flex w-full items-center gap-4 p-5 text-left hover:border-plz-line-strong hover:shadow-lift'}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-plz-ink">{s.name}</span>
                        {s.description && (
                          <span className="mt-1 block text-[13px] leading-relaxed text-plz-body">
                            {s.description}
                          </span>
                        )}
                        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-plz-body">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {s.duration_minutes} mins
                          </span>
                          {s.capacity > 1 && (
                            <span className="flex items-center gap-1.5">
                              <Users size={13} />
                              {s.capacity} per slot
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[17px] font-semibold text-plz-ink">
                          {naira(s.price)}
                        </span>
                        <ChevronRight size={16} className="ml-auto mt-1 text-plz-grey" />
                      </span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* --------------------------------------------------------- 2. time */}
        {step === 1 && service && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <h2 className="text-[17px] font-semibold text-plz-ink">When suits you?</h2>
            <p className="mt-1.5 text-[14px] text-plz-body">
              {service.name} · {service.duration_minutes} mins · {naira(service.price)}
            </p>

            {/* day rail */}
            <div className="plz-rail mt-5 -mx-1 px-1 pb-1">
              {days.map((d) => {
                const value = isoDate(d);
                const active = value === date;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setDate(value); setSlot(null); }}
                    aria-pressed={active}
                    className={
                      'flex w-[74px] flex-col items-center gap-0.5 rounded-[12px] border px-2 py-3 transition-colors duration-micro ease-plz ' +
                      (active
                        ? 'border-plz-blue bg-plz-blue text-white'
                        : 'border-plz-line bg-white text-plz-body hover:border-plz-line-strong')
                    }
                  >
                    <span className="text-[11px] font-medium uppercase tracking-[0.04em]">
                      {d.toLocaleDateString('en-NG', { weekday: 'short' })}
                    </span>
                    <span className={'text-[19px] font-semibold ' + (active ? 'text-white' : 'text-plz-ink')}>
                      {d.getDate()}
                    </span>
                    <span className="text-[11px]">
                      {d.toLocaleDateString('en-NG', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* slots */}
            <div className="mt-6">
              {slotsLoading ? (
                <div className="flex items-center gap-2 py-10 text-[14px] text-plz-body">
                  <Loader2 size={16} className="animate-spin" />
                  Checking availability…
                </div>
              ) : slotsClosed ? (
                <div className={CARD + ' px-6 py-10 text-center'}>
                  <p className="text-[15px] font-semibold text-plz-ink">
                    Nothing available on {prettyDate(date)}
                  </p>
                  <p className="mt-2 text-[14px] text-plz-body">{slotsClosed}. Try another day.</p>
                </div>
              ) : slots && slots.length === 0 ? (
                <div className={CARD + ' px-6 py-10 text-center'}>
                  <p className="text-[15px] font-semibold text-plz-ink">Fully booked</p>
                  <p className="mt-2 text-[14px] text-plz-body">
                    Every slot on {prettyDate(date)} is taken. Try another day.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-plz-grey">
                    {prettyDate(date)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                    {(slots || []).map((s) => {
                      const active = slot && slot.start === s.start;
                      return (
                        <motion.button
                          key={s.start}
                          type="button"
                          onClick={() => setSlot(s)}
                          whileTap={{ scale: 0.97 }}
                          aria-pressed={active}
                          className={
                            'rounded-[10px] border px-3 py-3 text-center transition-colors duration-micro ease-plz ' +
                            (active
                              ? 'border-plz-blue bg-plz-blue text-white'
                              : 'border-plz-line bg-white text-plz-ink hover:border-plz-line-strong')
                          }
                        >
                          <span className="block text-[15px] font-semibold">{s.label}</span>
                          {s.capacity > 1 && (
                            <span className={'mt-0.5 block text-[11px] ' + (active ? 'text-white/80' : 'text-plz-body')}>
                              {s.remaining} left
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {slot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="sticky bottom-4 mt-6"
                      >
                        <motion.button
                          type="button"
                          onClick={() => { setStep(2); window.scrollTo({ top: 0 }); }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-plz-blue text-[15px] font-semibold text-white shadow-lift hover:bg-plz-blue-deep"
                        >
                          Continue with {slot.label}
                          <ArrowRight size={16} />
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------ 3. details */}
        {step === 2 && service && slot && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <h2 className="text-[17px] font-semibold text-plz-ink">Who is this booking for?</h2>

            <div className={CARD + ' mt-4 flex flex-wrap items-center justify-between gap-3 p-4'}>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-plz-ink">{service.name}</p>
                <p className="mt-0.5 text-[13px] text-plz-body">
                  {prettyDate(date)} · {slot.label} – {slot.end_label}
                </p>
              </div>
              <p className="text-[17px] font-semibold text-plz-ink">{naira(service.price)}</p>
            </div>

            <form onSubmit={submitDetails} noValidate className={CARD + ' mt-4 flex flex-col gap-5 p-5'}>
              <label className="block">
                <span className="text-[13px] font-semibold text-plz-ink">Full name</span>
                <input
                  className={FIELD}
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  placeholder="Amara Eze"
                />
                {errors.name && <span className="mt-1.5 block text-[12px] text-[#C0395A]">{errors.name}</span>}
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-plz-ink">Email address</span>
                <input
                  type="email"
                  className={FIELD}
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                  placeholder="you@email.com"
                />
                {errors.email && <span className="mt-1.5 block text-[12px] text-[#C0395A]">{errors.email}</span>}
                {!errors.email && (
                  <span className="mt-1.5 block text-[12px] text-plz-body">
                    Your confirmation goes here.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-plz-ink">WhatsApp number</span>
                <input
                  type="tel"
                  className={FIELD}
                  value={form.whatsapp}
                  onChange={(e) => { setForm({ ...form, whatsapp: e.target.value }); setErrors({ ...errors, whatsapp: '' }); }}
                  placeholder="0803 000 0000"
                />
                {errors.whatsapp && <span className="mt-1.5 block text-[12px] text-[#C0395A]">{errors.whatsapp}</span>}
                {!errors.whatsapp && (
                  <span className="mt-1.5 block text-[12px] text-plz-body">
                    How {business.name} reaches you about this booking.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-plz-ink">
                  Anything they should know?
                </span>
                <textarea
                  className={FIELD + ' h-[84px] resize-none py-3'}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional"
                />
              </label>

              {submitError && (
                <p role="alert" className="rounded-[10px] bg-[#FDEEF0] px-4 py-3 text-[13px] text-[#A32E4C]">
                  {submitError}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={submitting ? undefined : { y: -2 }}
                whileTap={submitting ? undefined : { scale: 0.99 }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-plz-blue text-[15px] font-semibold text-white hover:bg-plz-blue-deep disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Holding your slot…' : 'Hold my slot'}
                {!submitting && <ArrowRight size={16} />}
              </motion.button>

              <p className="text-center text-[12px] leading-relaxed text-plz-grey">
                You&apos;ll pay {business.name} by bank transfer on the next step.
                No card details are taken.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
