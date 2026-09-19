import { motion } from 'motion/react';
import PlazzaaLogo from './PlazzaaLogo';
import {
  BarChart3, Bell, CalendarDays, Check, ChevronRight, Copy, Filter, HelpCircle,
  LayoutDashboard, Link2, Search, Settings, Share2, SlidersHorizontal, Users, Wrench
} from 'lucide-react';

/**
 * The Plazzaa merchant dashboard, built in code.
 *
 * Drawn to the product reference: white rail, pale working surface, tinted
 * metric cards, a real booking table with the four V1 states, and a right rail
 * carrying the booking link and setup progress. Built rather than generated so
 * the numbers and labels stay sharp at any zoom, the statuses use the same
 * tokens as the live product, and a screen reader can read it.
 *
 * Shown as a preview. Everything here maps to V1: services, availability, a
 * shareable link, bookings, and manual payment validation.
 */

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CalendarDays, label: 'Booking Setup' },
  { icon: Wrench, label: 'Services' },
  { icon: Users, label: 'Customers' },
  { icon: BarChart3, label: 'Bookings' },
  { icon: Settings, label: 'Settings' }
];

const STATS = [
  { label: 'Total bookings', value: '248', delta: '12%', tone: 'bg-[#EEF3FE]', icon: CalendarDays, iconTone: 'text-plz-blue' },
  { label: 'Awaiting validation', value: '16', delta: '8%', tone: 'bg-[#FEF8E7]', icon: SlidersHorizontal, iconTone: 'text-[#B0840F]' },
  { label: 'Confirmed bookings', value: '198', delta: '24%', tone: 'bg-[#EAF7EF]', icon: Check, iconTone: 'text-[#1B7F43]' },
  { label: 'Received by transfer', value: '₦1.9m', delta: '18%', tone: 'bg-[#F0EEFE]', icon: BarChart3, iconTone: 'text-[#5B4BD6]' }
];

const STATUS = {
  Confirmed: 'bg-[#EAF7EF] text-[#1B7F43]',
  'Awaiting validation': 'bg-[#FEF8E7] text-[#B0840F]',
  'Payment pending': 'bg-[#FDEEF0] text-[#C0395A]',
  Expired: 'bg-plz-surface text-plz-grey'
};

const ROWS = [
  { name: 'Amara Eze', email: 'amara.eze@gmail.com', service: 'Deep tissue massage', mins: 60, when: 'Mon, 28 Apr', time: '10:00 AM', amount: '₦25,000', status: 'Confirmed' },
  { name: 'Tunde Alabi', email: 'tunde.a@mail.com', service: 'Swedish massage', mins: 45, when: 'Mon, 28 Apr', time: '11:30 AM', amount: '₦18,000', status: 'Awaiting validation' },
  { name: 'Priya Sharma', email: 'priya.s@gmail.com', service: 'Wellness consultation', mins: 30, when: 'Mon, 28 Apr', time: '2:00 PM', amount: '₦12,000', status: 'Payment pending' },
  { name: 'Daniel Kim', email: 'daniel.kim@mail.com', service: 'Sports massage', mins: 60, when: 'Mon, 28 Apr', time: '4:00 PM', amount: '₦25,000', status: 'Confirmed' },
  { name: 'Sophie Laurent', email: 'sophie.l@mail.com', service: 'Aromatherapy', mins: 60, when: 'Mon, 28 Apr', time: '5:30 PM', amount: '₦28,000', status: 'Expired' }
];

const SETUP = [
  { label: 'Add services', note: 'Create and price what you offer', done: true },
  { label: 'Set availability', note: 'Define your working hours', done: true },
  { label: 'Add bank details', note: 'Where customers send payment', done: true },
  { label: 'Publish booking page', note: 'Make your link live', done: false }
];

const BARS = [38, 52, 44, 61, 47, 72, 58, 66, 49, 78, 63, 84, 57, 71, 88, 69];

function Avatar({ name, tone }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <span
      className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ' + tone}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

const AVATAR_TONES = [
  'bg-[#EEF3FE] text-plz-blue',
  'bg-[#FEF8E7] text-[#B0840F]',
  'bg-[#EAF7EF] text-[#1B7F43]',
  'bg-[#F0EEFE] text-[#5B4BD6]',
  'bg-plz-surface text-plz-body'
];

export default function DashboardMock({ className = '' }) {
  return (
    <div
      className={
        'overflow-hidden rounded-[18px] border border-plz-line bg-[#F7F8FB] shadow-panel ' + className
      }
      role="img"
      aria-label="Plazzaa merchant dashboard preview: 248 total bookings, 16 awaiting validation, 198 confirmed, the business booking link, a setup checklist that is three of four complete, and today's bookings with their payment states."
    >
      <div className="flex">
        {/* ------------------------------------------------------------ rail */}
        <aside className="hidden w-[188px] shrink-0 flex-col justify-between border-r border-plz-line bg-white py-5 lg:flex">
          <div>
            <div className="flex items-center px-5">
              <PlazzaaLogo size={22} />
            </div>

            <nav className="mt-6 flex flex-col gap-1 px-3">
              {NAV.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={
                    'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium ' +
                    (active ? 'bg-plz-blue text-white' : 'text-plz-body')
                  }
                >
                  <Icon size={15} className="shrink-0" />
                  {label}
                </span>
              ))}
            </nav>
          </div>

          <div className="px-3">
            <div className="rounded-[12px] bg-plz-cream p-4">
              <p className="text-[14px] font-semibold leading-tight text-plz-ink">
                More bookings.
                <br />A brighter tomorrow.
              </p>
              <p className="mt-2 text-[11px] leading-snug text-plz-body">
                Turn your time into opportunity with Plazzaa.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12px] font-medium text-plz-body">
              <HelpCircle size={14} />
              Help &amp; support
            </span>
          </div>
        </aside>

        {/* ------------------------------------------------------------ body */}
        <div className="min-w-0 flex-1">
          {/* top bar */}
          <header className="flex items-center gap-3 border-b border-plz-line bg-white px-4 py-3">
            <span className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-plz-surface px-3.5 text-[12px] text-plz-grey">
              <Search size={14} className="shrink-0" />
              <span className="truncate">Search bookings, customers or services…</span>
            </span>

            <span className="relative hidden shrink-0 sm:block">
              <Bell size={16} className="text-plz-body" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#C0395A]" />
            </span>

            <span className="hidden shrink-0 items-center gap-2 md:flex">
              <Avatar name="Amara Okoye" tone={AVATAR_TONES[0]} />
              <span className="leading-tight">
                <span className="block text-[12px] font-semibold text-plz-ink">Amara Okoye</span>
                <span className="block text-[11px] text-plz-body">Glow Spa, Lekki</span>
              </span>
            </span>

            <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-plz-blue px-3 text-[12px] font-semibold text-white">
              <Share2 size={13} />
              <span className="hidden sm:inline">Share booking link</span>
            </span>
          </header>

          <div className="grid gap-4 p-4 xl:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              {/* greeting */}
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[18px] font-semibold text-plz-ink">Good morning, Amara</p>
                  <p className="mt-0.5 text-[12px] text-plz-body">
                    Here&apos;s what&apos;s happening with your bookings today.
                  </p>
                </div>
                <p className="text-right text-[11px] text-plz-body">
                  Mon, 28 April
                  <span className="mt-0.5 block text-plz-grey">A busier you, a brighter tomorrow.</span>
                </p>
              </div>

              {/* metric cards */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {STATS.map(({ label, value, delta, tone, icon: Icon, iconTone }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={'rounded-[13px] p-3.5 ' + tone}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-white">
                      <Icon size={13} className={iconTone} />
                    </span>
                    <p className="mt-2.5 text-[11px] leading-tight text-plz-body">{label}</p>
                    <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] text-plz-ink">
                      {value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-[#1B7F43]">
                      ↑ {delta} <span className="font-normal text-plz-grey">vs. last month</span>
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* bookings table */}
              <div className="mt-3 overflow-hidden rounded-[13px] border border-plz-line bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-plz-line px-4 py-3">
                  <span className="border-b-2 border-plz-blue pb-2.5 text-[12px] font-semibold text-plz-ink">
                    Recent bookings
                  </span>
                  <span className="pb-2.5 text-[12px] font-medium text-plz-grey">Upcoming</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="hidden items-center gap-1.5 rounded-[8px] border border-plz-line px-2.5 py-1.5 text-[11px] text-plz-body sm:flex">
                      <CalendarDays size={12} />
                      21 – 28 Apr
                    </span>
                    <span className="flex items-center gap-1.5 rounded-[8px] border border-plz-line px-2.5 py-1.5 text-[11px] text-plz-body">
                      <Filter size={12} />
                      Filters
                    </span>
                  </span>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-plz-surface/60">
                      {['Customer', 'Service', 'Date & time', 'Amount', 'Status'].map((h, i) => (
                        <th
                          key={h}
                          className={
                            'px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-plz-body ' +
                            (i > 1 ? 'hidden md:table-cell' : '')
                          }
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-plz-line">
                    {ROWS.map((row, i) => (
                      <motion.tr
                        key={row.name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                      >
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-2.5">
                            <Avatar name={row.name} tone={AVATAR_TONES[i % AVATAR_TONES.length]} />
                            <span className="min-w-0 leading-tight">
                              <span className="block truncate text-[12px] font-semibold text-plz-ink">
                                {row.name}
                              </span>
                              <span className="block truncate text-[11px] text-plz-body">{row.email}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-2.5 leading-tight">
                          <span className="block truncate text-[12px] text-plz-ink">{row.service}</span>
                          <span className="block text-[11px] text-plz-body">{row.mins} mins</span>
                        </td>
                        <td className="hidden px-4 py-2.5 leading-tight md:table-cell">
                          <span className="block text-[12px] text-plz-ink">{row.when}</span>
                          <span className="block text-[11px] text-plz-body">{row.time}</span>
                        </td>
                        <td className="hidden px-4 py-2.5 text-[12px] font-semibold text-plz-ink md:table-cell">
                          {row.amount}
                        </td>
                        <td className="hidden px-4 py-2.5 md:table-cell">
                          <span
                            className={
                              'whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ' +
                              STATUS[row.status]
                            }
                          >
                            {row.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* bookings over time */}
              <div className="mt-3 rounded-[13px] border border-plz-line bg-white p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] font-semibold text-plz-ink">Bookings, last 30 days</p>
                  <p className="text-[11px] text-plz-body">
                    <span className="text-[16px] font-semibold text-plz-ink">248</span>
                    <span className="ml-2 font-medium text-[#1B7F43]">↑ 12%</span>
                  </p>
                </div>
                <div className="mt-3 flex h-[60px] items-end gap-[3px]" aria-hidden="true">
                  {BARS.map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 rounded-t-[2px] bg-plz-blue/80"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------ right rail */}
            <div className="flex min-w-0 flex-col gap-3">
              <div className="rounded-[13px] border border-plz-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#EEF3FE]">
                      <Link2 size={13} className="text-plz-blue" />
                    </span>
                    <span className="text-[12px] font-semibold text-plz-ink">Your booking link</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#EAF7EF] px-2 py-0.5 text-[10px] font-semibold text-[#1B7F43]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1B7F43]" />
                    Published
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-plz-body">
                  Share this link with your customers to take bookings around the clock.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 rounded-[9px] border border-plz-line px-2.5 py-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-plz-ink">
                    plazzaa.com/glowspa
                  </span>
                  <Copy size={12} className="shrink-0 text-plz-body" />
                </div>
                <span className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-[9px] bg-plz-blue text-[12px] font-semibold text-white">
                  <Share2 size={12} />
                  Share booking link
                </span>
              </div>

              <div className="rounded-[13px] border border-plz-line bg-white p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] font-semibold text-plz-ink">Quick setup</p>
                  <p className="text-[10px] text-plz-body">3 of 4 done</p>
                </div>
                <div className="mt-2 flex gap-1" aria-hidden="true">
                  {SETUP.map((s, i) => (
                    <span
                      key={i}
                      className={'h-1 flex-1 rounded-full ' + (s.done ? 'bg-plz-blue' : 'bg-plz-line')}
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {SETUP.map((item) => (
                    <li key={item.label} className="flex items-start gap-2">
                      <span
                        className={
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ' +
                          (item.done ? 'bg-[#1B7F43] text-white' : 'border border-plz-line-strong')
                        }
                      >
                        {item.done && <Check size={9} strokeWidth={3.5} />}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-[11px] font-semibold text-plz-ink">{item.label}</span>
                        <span className="block text-[10px] text-plz-body">{item.note}</span>
                      </span>
                      <ChevronRight size={12} className="mt-0.5 shrink-0 text-plz-grey" />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[13px] bg-plz-lavender p-4">
                <p className="plz-script absolute right-3 top-3 text-right text-[15px] leading-tight text-plz-ink/45">
                  Happy Customers
                  <br />
                  Brighter Days
                </p>
                <p className="max-w-[60%] text-[13px] font-semibold leading-tight text-plz-ink">
                  Delight more customers with Plazzaa
                </p>
                <p className="mt-2 max-w-[80%] text-[10px] leading-snug text-plz-body">
                  A booking experience that builds trust and grows your business.
                </p>
                <span className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-plz-yellow px-3 text-[11px] font-semibold text-plz-ink">
                  Explore tips
                  <ChevronRight size={11} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
