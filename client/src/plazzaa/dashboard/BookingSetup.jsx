import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Check, Clock, Copy, ImagePlus, Landmark, Link2, Loader2, Pencil,
  Plus, Share2, Trash2, Users, Wrench, X
} from 'lucide-react';
import { DAYS, naira } from '../lib/merchantApi';
import {
  Badge, Button, Card, CardHead, EmptyState, Field, inputClass, Skeleton, Toggle
} from './ui';

/**
 * Booking Setup — everything a booking page needs before it can go live.
 *
 * Three things in the order the PRD asks for them: what you sell, when you're
 * open, and where the money goes. Each saves on its own so a merchant can stop
 * halfway and come back.
 */

/* ------------------------------------------------------------ service form */

/** A photograph for one service: picked locally, uploaded, kept as a URL. */
function ImageField({ value, onChange, onUpload }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('That image is over 5MB. Try a smaller one.');
      return;
    }

    setError('');
    setBusy(true);

    const reader = new FileReader();
    reader.onload = () => {
      onUpload(file.name, reader.result)
        .then((url) => { onChange(url); setBusy(false); })
        .catch((err) => { setError(err.message || 'That upload did not work.'); setBusy(false); });
    };
    reader.onerror = () => { setError('Could not read that file.'); setBusy(false); };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="block text-[13px] font-semibold text-plz-ink">Photo</span>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={busy}
          className="relative flex h-[76px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-plz-line-strong bg-white transition-colors duration-micro ease-plz hover:border-plz-blue disabled:opacity-60"
        >
          {value ? (
            <img src={value} alt="" className="plz-fill" />
          ) : busy ? (
            <Loader2 size={18} className="animate-spin text-plz-body" />
          ) : (
            <ImagePlus size={18} className="text-plz-grey" />
          )}
          {value && busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 size={18} className="animate-spin text-plz-body" />
            </span>
          )}
        </button>

        <div className="min-w-0">
          <p className="text-[13px] text-plz-body">
            {value ? 'Customers see this on your booking page.' : 'Optional, but it sells the service.'}
          </p>
          <div className="mt-1.5 flex gap-3">
            <button
              type="button"
              onClick={() => inputRef.current && inputRef.current.click()}
              className="text-[13px] font-semibold text-plz-blue hover:underline"
            >
              {value ? 'Replace' : 'Upload a photo'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-[13px] font-medium text-plz-body hover:text-[#C0395A]"
              >
                Remove
              </button>
            )}
          </div>
          {error && <p className="mt-1.5 text-[12px] text-[#C0395A]">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={choose}
        className="hidden"
      />
    </div>
  );
}

function ServiceForm({ initial, busy, onSave, onCancel, onUpload }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price != null ? String(initial.price) : '',
    duration_minutes: initial?.duration_minutes != null ? String(initial.duration_minutes) : '60',
    capacity: initial?.capacity != null ? String(initial.capacity) : '1',
    image_url: initial?.image_url || null
  }));
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  const submit = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Give this service a name.';
    if (!(Number(form.price) >= 0) || form.price === '') next.price = 'Enter a price.';
    if (!(parseInt(form.duration_minutes, 10) > 0)) next.duration_minutes = 'How long does it take?';
    if (!(parseInt(form.capacity, 10) > 0)) next.capacity = 'At least 1.';
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      duration_minutes: parseInt(form.duration_minutes, 10),
      capacity: parseInt(form.capacity, 10),
      image_url: form.image_url || null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-plz-line bg-plz-surface/40 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold text-plz-ink">
            {initial ? 'Edit service' : 'New service'}
          </p>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="text-plz-grey transition-colors duration-micro ease-plz hover:text-plz-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Service name" error={errors.name} className="sm:col-span-2">
            <input
              className={inputClass}
              value={form.name}
              onChange={set('name')}
              placeholder="Deep tissue massage"
            />
          </Field>

          <Field
            label="Description"
            hint="Optional. Shown to customers on your booking page."
            className="sm:col-span-2"
          >
            <textarea
              className={inputClass + ' h-[76px] resize-none py-2.5'}
              value={form.description}
              onChange={set('description')}
              placeholder="A firm, full-body massage focused on tension relief."
            />
          </Field>

          <Field label="Price (₦)" error={errors.price}>
            <input
              className={inputClass}
              value={form.price}
              onChange={set('price')}
              inputMode="numeric"
              placeholder="25000"
            />
          </Field>

          <Field label="Duration (minutes)" error={errors.duration_minutes}>
            <input
              className={inputClass}
              value={form.duration_minutes}
              onChange={set('duration_minutes')}
              inputMode="numeric"
              placeholder="60"
            />
          </Field>

          <Field
            label="People per slot"
            hint="How many can book the same time."
            error={errors.capacity}
          >
            <input
              className={inputClass}
              value={form.capacity}
              onChange={set('capacity')}
              inputMode="numeric"
              placeholder="1"
            />
          </Field>

          <div className="sm:col-span-2">
            <ImageField
              value={form.image_url}
              onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
              onUpload={onUpload}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <Button busy={busy} onClick={submit}>
            {initial ? 'Save changes' : 'Add service'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ screen */

export default function BookingSetup({
  business, services, hours, bankAccount, loading, busy, setup,
  bookingUrl, onCopyLink, onCopyServiceLink, onUploadImage,
  onCreateService, onUpdateService, onDeleteService,
  onSaveHours, onSaveBank
}) {
  const [editing, setEditing] = useState(null);   // service id, or 'new'
  const [copied, setCopied] = useState(null);     // service id whose link was copied
  const [draftHours, setDraftHours] = useState(null);
  const [bank, setBank] = useState(null);
  const [bankErrors, setBankErrors] = useState({});

  // Hours arrive from the API keyed by day; the editor works on a full week.
  const week = draftHours || DAYS.map((_, day) => {
    const row = (hours || []).find((h) => Number(h.day_of_week) === day);
    return {
      day_of_week: day,
      is_closed: row ? Boolean(row.is_closed) : day > 4,
      open_time: (row && row.open_time) ? row.open_time.slice(0, 5) : '09:00',
      close_time: (row && row.close_time) ? row.close_time.slice(0, 5) : '17:00'
    };
  });

  const patchDay = (day, patch) =>
    setDraftHours(week.map((d) => (d.day_of_week === day ? { ...d, ...patch } : d)));

  const bankForm = bank || {
    bank_name: bankAccount?.bank_name || '',
    account_number: bankAccount?.account_number || '',
    account_name: bankAccount?.account_name || ''
  };

  const submitBank = () => {
    const next = {};
    if (!bankForm.bank_name.trim()) next.bank_name = 'Which bank?';
    if (!/^\d{10}$/.test(bankForm.account_number.trim())) {
      next.account_number = 'Nigerian account numbers are 10 digits.';
    }
    if (!bankForm.account_name.trim()) next.account_name = 'Name on the account.';
    setBankErrors(next);
    if (Object.keys(next).length) return;
    onSaveBank({
      bank_name: bankForm.bank_name.trim(),
      account_number: bankForm.account_number.trim(),
      account_name: bankForm.account_name.trim()
    });
  };

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-plz-ink">Booking setup</h1>
        <p className="mt-1 text-[14px] text-plz-body">
          What you offer, when you&apos;re open, and where customers send payment.
        </p>
      </header>

      {/* ------------------------------------------------------ business card */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF3FE]">
            <Building2 size={16} className="text-plz-blue" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-plz-ink">
              {business?.name || 'Your business'}
            </p>
            <p className="mt-1 text-[13px] text-plz-body">
              {business?.city ? business.city + ' · ' : ''}
              {business?.business_type || 'Service business'}
            </p>
          </div>
          {business?.slug && (
            <Badge tone="bg-plz-surface text-plz-body">/{business.slug}</Badge>
          )}
        </div>

        {/* The link lives here as well as on the dashboard: this is the screen
            a merchant is on when they finish setting up and want to share it. */}
        <div className="mt-5 border-t border-plz-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Link2 size={15} className="text-plz-blue" />
              <span className="text-[14px] font-semibold text-plz-ink">Your booking link</span>
            </span>
            {setup && (
              <Badge
                dot
                tone={setup.ready ? 'bg-[#EAF7EF] text-[#1B7F43]' : 'bg-[#FEF8E7] text-[#B0840F]'}
              >
                {setup.ready ? 'Live' : 'Not live yet'}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-plz-line bg-plz-surface/50 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-plz-ink">
                {bookingUrl ? bookingUrl.replace(/^https?:\/\//, '') : 'Not published yet'}
              </span>
            </span>
            <Button size="sm" onClick={onCopyLink} disabled={!bookingUrl}>
              <Copy size={14} />
              Copy link
            </Button>
          </div>

          <p className="mt-2.5 text-[12px] text-plz-body">
            This link shows everything you offer. Each service below also has a link of its own.
          </p>
        </div>
      </Card>

      {/* ------------------------------------------------------------ services */}
      <Card pad={false}>
        <div className="px-5 py-4">
          <CardHead
            title="Services"
            note="Each one becomes a bookable option on your page."
            action={
              editing !== 'new' && (
                <Button size="sm" onClick={() => setEditing('new')}>
                  <Plus size={14} />
                  Add service
                </Button>
              )
            }
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 px-5 pb-5">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (services || []).length === 0 && editing !== 'new' ? (
          <EmptyState
            icon={Wrench}
            title="No services yet"
            note="Add the first thing customers can book — a haircut, a consultation, a table for two."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus size={15} />
                Add your first service
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-plz-line border-t border-plz-line">
            {(services || []).map((service) => (
              <li key={service.id}>
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  {service.image_url ? (
                    <span className="relative h-[52px] w-[70px] shrink-0 overflow-hidden rounded-[9px] bg-plz-surface">
                      <img src={service.image_url} alt="" className="plz-fill" />
                    </span>
                  ) : (
                    <span className="flex h-[52px] w-[70px] shrink-0 items-center justify-center rounded-[9px] bg-plz-surface">
                      <ImagePlus size={16} className="text-plz-grey" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-semibold text-plz-ink">{service.name}</p>
                      {!service.is_active && (
                        <Badge tone="bg-plz-surface text-plz-grey">Hidden</Badge>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-plz-body">
                      <span className="font-semibold text-plz-ink">{naira(service.price)}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {service.duration_minutes} mins
                      </span>
                      {service.capacity > 1 && (
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {service.capacity} per slot
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!bookingUrl || !service.is_active}
                      onClick={() => {
                        onCopyServiceLink(service);
                        setCopied(service.id);
                        setTimeout(() => setCopied(null), 2000);
                      }}
                      title={
                        service.is_active
                          ? 'Copy a link straight to this service'
                          : 'Show this service to share its link'
                      }
                    >
                      {copied === service.id
                        ? <Check size={14} className="text-[#1B7F43]" />
                        : <Share2 size={14} />}
                      <span className="hidden sm:inline">
                        {copied === service.id ? 'Copied' : 'Link'}
                      </span>
                    </Button>

                    <Toggle
                      on={Boolean(service.is_active)}
                      onChange={(on) => onUpdateService(service.id, { is_active: on })}
                      label={`Show ${service.name} on your booking page`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(editing === service.id ? null : service.id)}
                      aria-label={'Edit ' + service.name}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteService(service)}
                      aria-label={'Remove ' + service.name}
                      className="hover:text-[#C0395A]"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {editing === service.id && (
                    <ServiceForm
                      initial={service}
                      onUpload={onUploadImage}
                      busy={busy === 'service'}
                      onCancel={() => setEditing(null)}
                      onSave={(patch) =>
                        onUpdateService(service.id, patch).then(() => setEditing(null))
                      }
                    />
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}

        <AnimatePresence initial={false}>
          {editing === 'new' && (
            <ServiceForm
              busy={busy === 'service'}
              onUpload={onUploadImage}
              onCancel={() => setEditing(null)}
              onSave={(service) => onCreateService(service).then(() => setEditing(null))}
            />
          )}
        </AnimatePresence>
      </Card>

      {/* --------------------------------------------------------------- hours */}
      <Card>
        <CardHead
          title="Opening hours"
          note="Customers can only book inside these hours."
        />

        <div className="mt-4 flex flex-col divide-y divide-plz-line">
          {week.map((day) => (
            <div key={day.day_of_week} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-[92px] shrink-0 text-[14px] font-medium text-plz-ink">
                {DAYS[day.day_of_week]}
              </span>

              <Toggle
                on={!day.is_closed}
                onChange={(open) => patchDay(day.day_of_week, { is_closed: !open })}
                label={`Open on ${DAYS[day.day_of_week]}`}
              />

              {day.is_closed ? (
                <span className="text-[13px] text-plz-grey">Closed</span>
              ) : (
                <span className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.open_time}
                    onChange={(e) => patchDay(day.day_of_week, { open_time: e.target.value })}
                    aria-label={`Opening time on ${DAYS[day.day_of_week]}`}
                    className="h-9 rounded-[8px] border border-plz-line bg-white px-2.5 text-[13px] text-plz-ink focus:border-plz-blue focus:outline-none"
                  />
                  <span className="text-[13px] text-plz-grey">to</span>
                  <input
                    type="time"
                    value={day.close_time}
                    onChange={(e) => patchDay(day.day_of_week, { close_time: e.target.value })}
                    aria-label={`Closing time on ${DAYS[day.day_of_week]}`}
                    className="h-9 rounded-[8px] border border-plz-line bg-white px-2.5 text-[13px] text-plz-ink focus:border-plz-blue focus:outline-none"
                  />
                </span>
              )}
            </div>
          ))}
        </div>

        <Button
          busy={busy === 'hours'}
          onClick={() => onSaveHours(week).then(() => setDraftHours(null))}
          className="mt-5"
        >
          Save opening hours
        </Button>
      </Card>

      {/* ---------------------------------------------------------------- bank */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF7EF]">
            <Landmark size={16} className="text-[#1B7F43]" />
          </span>
          <div className="min-w-0 flex-1">
            <CardHead
              title="Bank details"
              note="Customers transfer to this account, then you validate the payment yourself."
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Bank name" error={bankErrors.bank_name}>
            <input
              className={inputClass}
              value={bankForm.bank_name}
              onChange={(e) => setBank({ ...bankForm, bank_name: e.target.value })}
              placeholder="Guaranty Trust Bank"
            />
          </Field>

          <Field label="Account number" error={bankErrors.account_number}>
            <input
              className={inputClass}
              value={bankForm.account_number}
              onChange={(e) => setBank({ ...bankForm, account_number: e.target.value })}
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
            />
          </Field>

          <Field
            label="Account name"
            hint="Exactly as it appears on your bank statement."
            error={bankErrors.account_name}
            className="sm:col-span-2"
          >
            <input
              className={inputClass}
              value={bankForm.account_name}
              onChange={(e) => setBank({ ...bankForm, account_name: e.target.value })}
              placeholder="Glow Spa Limited"
            />
          </Field>
        </div>

        <Button busy={busy === 'bank'} onClick={submitBank} className="mt-5">
          Save bank details
        </Button>
      </Card>
    </div>
  );
}
