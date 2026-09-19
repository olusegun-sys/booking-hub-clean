import { motion } from 'motion/react';
import {
  Bell, CalendarDays, Clock, LayoutDashboard, Link2, Settings, Users, Wrench, Copy, Share2, Check
} from 'lucide-react';
import { naira } from '../lib/data';

/**
 * The merchant dashboard, drawn in code rather than pasted in as a picture.
 *
 * It matches the product mockups: light blue page, white panels, blue as the
 * only interaction colour, yellow as punctuation, and the four real V1 booking
 * states — pending, awaiting validation, confirmed, expired. Text stays sharp
 * at any zoom and a screen reader can read it, which a screenshot can't do.
 *
 * Shown as a preview of the merchant product; nothing here claims a feature
 * the MVP doesn't have.
 */

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CalendarDays, label: 'Booking Setup' },
  { icon: Clock, label: 'Bookings' },
  { icon: Wrench, label: 'Services' },
  { icon: Users, label: 'Customers' },
  { icon: Settings, label: 'Settings' }
];

const STATS = [
  { label: 'Bookings today', value: '8', tone: 'bg-plz-blue-wash text-plz-blue', icon: CalendarDays },
  { label: 'Awaiting validation', value: '3', tone: 'bg-plz-cream text-[#8A6A12]', icon: Clock, note: 'Needs you' },
  { label: 'Confirmed this week', value: '24', tone: 'bg-[#E7F6EC] text-[#1B7F43]', icon: Check }
];

const BOOKINGS = [
  { name: 'Ada N.', service: 'Swedish massage', when: 'Mon 14 Oct · 10:00', amount: 25000, status: 'Pending' },
  { name: 'Tunde A.', service: 'Deep tissue', when: 'Mon 14 Oct · 14:00', amount: 30000, status: 'Awaiting validation' },
  { name: 'Kemi O.', service: 'Facial treatment', when: 'Tue 15 Oct · 11:00', amount: 20000, status: 'Confirmed' }
];

const STATUS_TONE = {
  Pending: 'bg-plz-cream text-[#8A6A12]',
  'Awaiting validation': 'bg-plz-blue-wash text-plz-blue',
  Confirmed: 'bg-[#E7F6EC] text-[#1B7F43]',
  Expired: 'bg-plz-surface text-plz-grey'
};

export default function DashboardMock({ compact = false, className = '' }) {
  return (
    <div
      className={
        'overflow-hidden rounded-visual border border-plz-line bg-[#F6F8FE] shadow-panel ' + className
      }
      role="img"
      aria-label="Preview of the Plazzaa merchant dashboard: eight bookings today, three awaiting validation, twenty-four confirmed this week, with the business booking link and the day's bookings."
    >
      <div className="flex">
        {/* ------------------------------------------------------- sidebar */}
        <aside className={'shrink-0 border-r border-plz-line bg-white ' + (compact ? 'hidden sm:block sm:w-[132px]' : 'hidden w-[168px] md:block')}>
          <div className="px-4 py-4">
            <p className="text-[15px] font-bold tracking-[-0.02em] text-plz-ink">Plazzaa</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-plz-grey">Merchant</p>
          </div>
          <nav className="flex flex-col gap-0.5 px-2 pb-4">
            {NAV.map(({ icon: Icon, label, active }) => (
              <span
                key={label}
                className={
                  'flex items-center gap-2 rounded-ctl px-2.5 py-2 text-[12px] font-medium ' +
                  (active ? 'bg-plz-blue-wash text-plz-blue' : 'text-plz-body')
                }
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{label}</span>
              </span>
            ))}
          </nav>
        </aside>

        {/* ---------------------------------------------------------- main */}
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-plz-line bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F6EC] text-[12px]">🌿</span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-plz-ink">Glow Spa</p>
                <p className="truncate text-[11px] text-plz-body">Wellness for a brighter you.</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="relative">
                <Bell size={15} className="text-plz-body" />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-plz-blue" />
              </span>
              <span className="h-7 w-7 rounded-full bg-plz-surface" />
            </div>
          </header>

          <div className="p-4">
            <p className="text-[15px] font-semibold text-plz-ink">Welcome back, Amara</p>
            <p className="mt-0.5 text-[12px] text-plz-body">Here&apos;s what&apos;s happening today.</p>

            {/* stats */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {STATS.map(({ label, value, tone, icon: Icon, note }) => (
                <div key={label} className="rounded-card border border-plz-line bg-white p-2.5">
                  <span className={'flex h-6 w-6 items-center justify-center rounded-full ' + tone}>
                    <Icon size={12} />
                  </span>
                  <p className="mt-2 text-[11px] leading-tight text-plz-body">{label}</p>
                  <p className="mt-0.5 text-[20px] font-semibold leading-none text-plz-ink">{value}</p>
                  {note && <p className="mt-1 text-[10px] text-plz-grey">{note}</p>}
                </div>
              ))}
            </div>

            {/* booking link */}
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <div className="rounded-card border border-plz-line bg-white p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-plz-ink">
                  <Link2 size={13} className="text-plz-blue" />
                  Your booking link
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate rounded-ctl bg-plz-surface px-2.5 py-1.5 font-mono text-[11px] text-plz-ink">
                    plazzaa.com/glowspa
                  </span>
                  <span className="flex items-center gap-1 rounded-ctl bg-plz-blue px-2.5 py-1.5 text-[11px] font-semibold text-white">
                    <Copy size={11} /> Copy
                  </span>
                  <span className="flex items-center gap-1 rounded-ctl bg-plz-blue-wash px-2.5 py-1.5 text-[11px] font-semibold text-plz-blue">
                    <Share2 size={11} /> Share
                  </span>
                </div>
              </div>

              <div className="hidden rounded-card bg-plz-yellow p-3 md:block md:w-[150px]">
                <p className="text-[12px] font-semibold leading-tight text-plz-ink">
                  More bookings. Happier customers.
                </p>
                <p className="mt-1 text-[10px] leading-snug text-plz-ink/70">
                  A simpler way to grow.
                </p>
              </div>
            </div>

            {/* bookings */}
            <div className="mt-3 rounded-card border border-plz-line bg-white">
              <div className="flex items-center justify-between border-b border-plz-line px-3 py-2">
                <p className="text-[12px] font-semibold text-plz-ink">Upcoming bookings</p>
                <span className="text-[11px] font-medium text-plz-blue">View all</span>
              </div>
              <ul className="divide-y divide-plz-line">
                {BOOKINGS.map((booking, index) => (
                  <motion.li
                    key={booking.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                    className="flex items-center gap-2.5 px-3 py-2.5"
                  >
                    <span className="h-7 w-7 shrink-0 rounded-full bg-plz-surface" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-plz-ink">
                        {booking.name}
                      </span>
                      <span className="block truncate text-[11px] text-plz-body">
                        {booking.service} · {booking.when}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-plz-ink">
                      {naira(booking.amount)}
                    </span>
                    <span
                      className={
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
                        STATUS_TONE[booking.status]
                      }
                    >
                      {booking.status}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
