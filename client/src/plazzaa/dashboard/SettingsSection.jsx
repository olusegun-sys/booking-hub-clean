import { Copy, ExternalLink, LogOut, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Button, Card, CardHead } from './ui';

/**
 * Settings — the account, the public page, and where the plan stands.
 *
 * Deliberately thin: V1 keeps business editing in Booking Setup, so this screen
 * is for the things that sit outside a booking — who the account belongs to,
 * the live page, the subscription, and the way out.
 */

const STATUS_COPY = {
  approved: { label: 'Active', tone: 'bg-[#EAF7EF] text-[#1B7F43]' },
  pending: { label: 'Pending review', tone: 'bg-[#FEF8E7] text-[#B0840F]' },
  suspended: { label: 'Suspended', tone: 'bg-[#FDEEF0] text-[#C0395A]' }
};

export default function SettingsSection({ business, bookingUrl, onCopyLink, onLogout }) {
  const status = STATUS_COPY[business?.status] || {
    label: business?.status || 'Unknown',
    tone: 'bg-plz-surface text-plz-body'
  };

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-plz-ink">Settings</h1>
        <p className="mt-1 text-[14px] text-plz-body">
          Your account, your public page, and your plan.
        </p>
      </header>

      {/* ------------------------------------------------------------- account */}
      <Card>
        <CardHead title="Account" />
        <dl className="mt-4 divide-y divide-plz-line">
          {[
            { term: 'Business name', value: business?.name },
            { term: 'Owner', value: business?.owner_name },
            { term: 'Email', value: business?.email, icon: Mail },
            { term: 'Phone', value: business?.phone, icon: Phone },
            { term: 'City', value: business?.city }
          ]
            .filter((row) => row.value)
            .map(({ term, value }) => (
              <div key={term} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <dt className="text-[13px] text-plz-body">{term}</dt>
                <dd className="text-[14px] font-medium text-plz-ink">{value}</dd>
              </div>
            ))}
        </dl>
      </Card>

      {/* ---------------------------------------------------------- public page */}
      <Card>
        <CardHead
          title="Your booking page"
          note="This is what customers see when you share your link."
        />

        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-plz-line bg-plz-surface/50 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-plz-ink">
            {bookingUrl ? bookingUrl.replace(/^https?:\/\//, '') : 'Not published yet'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          <Button onClick={onCopyLink} disabled={!bookingUrl}>
            <Copy size={14} />
            Copy link
          </Button>
          <Button
            variant="secondary"
            disabled={!bookingUrl}
            onClick={() => bookingUrl && window.open(bookingUrl, '_blank', 'noreferrer')}
          >
            <ExternalLink size={14} />
            Preview page
          </Button>
        </div>
      </Card>

      {/* ------------------------------------------------------------ the plan */}
      <Card>
        <CardHead
          title="Plan &amp; access"
          action={<Badge dot tone={status.tone}>{status.label}</Badge>}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] bg-plz-cream p-4">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-[#B0840F]" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-plz-ink">
              {business?.status === 'approved' ? 'You’re on Plazzaa Starter' : 'Awaiting approval'}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-plz-body">
              {business?.status === 'approved'
                ? 'Unlimited bookings, your own booking page, and payment validation by bank transfer.'
                : 'We review new businesses before their page goes live. You’ll get an email as soon as you’re approved.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 text-[13px] text-plz-body">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-plz-grey" />
          <p className="leading-relaxed">
            Customers pay you by bank transfer, directly into the account in your booking setup.
            Plazzaa never holds your money.
          </p>
        </div>
      </Card>

      {/* --------------------------------------------------------------- log out */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-plz-ink">Sign out</p>
            <p className="mt-1 text-[13px] text-plz-body">
              You&apos;ll need your email and password to get back in.
            </p>
          </div>
          <Button variant="danger" onClick={onLogout}>
            <LogOut size={14} />
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
