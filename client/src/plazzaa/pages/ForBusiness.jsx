import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, Scissors, Sparkles, Hand, Brush, Utensils, Hotel } from 'lucide-react';
import SmoothScroll from '../lib/SmoothScroll';
import TopNav from '../components/TopNav';
import GatewayBar from '../components/GatewayBar';
import DashboardMock from '../components/DashboardMock';
import {
  ServicesMock, AvailabilityMock, LinkMock, BookingMock, ValidateMock
} from '../components/MerchantMocks';
import { images, merchantTrades } from '../lib/data';
import { EASE } from '../lib/motion';

import PlazzaaLogo from '../components/PlazzaaLogo';
const STEPS = [
  {
    title: 'Add your services.',
    body: 'Name, price, how long it takes, and how many people can take the same slot. That is the whole form.',
    mock: ServicesMock
  },
  {
    title: 'Set your availability.',
    body: 'Your opening days become real bookable times. Block an afternoon and it disappears from the page.',
    mock: AvailabilityMock
  },
  {
    title: 'Share your link.',
    body: 'One address that works in an Instagram bio, a WhatsApp status, a TikTok caption, or a reply.',
    mock: LinkMock
  },
  {
    title: 'Customers book.',
    body: 'They pick a time that is genuinely free and leave their details. No account, no back and forth.',
    mock: BookingMock
  },
  {
    title: 'Validate the payment.',
    body: 'They transfer to your account. You check it landed and tap validate — Plazzaa sends the confirmation.',
    mock: ValidateMock
  }
];

const TRADE_ICONS = {
  salon: Scissors, spa: Sparkles, nails: Hand, makeup: Brush, barber: Scissors, restaurant: Utensils
};

const CARDS = [
  { title: 'Slot capacity', body: 'One chair or ten. Set how many people can take the same time and Plazzaa counts them down.', tone: 'bg-plz-lavender' },
  { title: 'Holds that expire', body: 'An unpaid booking releases its slot automatically, so your Saturday is never blocked by someone who vanished.', tone: 'bg-plz-cream' },
  { title: 'Per-service links', body: 'Send bridal makeup to one client and a quick manicure to another. Same page, different front door.', tone: 'bg-plz-blue-wash' },
  { title: 'Blocked afternoons', body: 'Going to a wedding? Block it once and nobody can book into it.', tone: 'bg-white border border-plz-line' }
];

// Carried over from the retired Booking Hub page so the commercial terms stay
// in one place. Two line items are marked as not yet live, because the V1
// product does not ship staff accounts or advanced analytics.
const PLANS = [
  {
    name: 'Free',
    price: '₦0',
    cadence: '/month',
    note: 'Everything you need to take your first bookings.',
    features: ['50 bookings per month', 'Your booking link', 'Dashboard and bookings list', 'Email support'],
    cta: 'Start free',
    featured: false
  },
  {
    name: 'Starter',
    price: '₦30,000',
    cadence: '/month',
    note: 'For a shop that is booking most days.',
    features: ['100 bookings per month', 'Everything in Free', 'Email notifications', 'Priority email support', 'Staff accounts'],
    soon: ['Staff accounts'],
    cta: 'Choose Starter',
    featured: true
  },
  {
    name: 'Pro',
    price: '₦50,000',
    cadence: '/month',
    note: 'For a diary that is full and needs to stay that way.',
    features: ['Unlimited bookings', 'Everything in Starter', 'Custom branding on your booking page', 'Support on email and WhatsApp', 'Advanced analytics'],
    soon: ['Advanced analytics'],
    cta: 'Choose Pro',
    featured: false
  }
];

function Reveal({ children, delay = 0, y = 26, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Plazzaa for Business — the merchant marketing site.
 *
 * Styled to sit flush with the product mockups: the pale blue working surface,
 * white panels, blue as the only interaction colour, yellow as punctuation, and
 * the handwritten brand line running through it. Every claim is paired with the
 * screen that does it, and nothing is shown that the V1 product cannot do.
 */
export default function ForBusiness() {
  return (
    <SmoothScroll>
      <div className="plz-root min-h-screen overflow-x-clip bg-white">
        <TopNav tone="solid" />

        <main className="pt-[64px] md:pt-[76px]">
          {/* ---------------------------------------------------------- hero */}
          <section className="bg-white pt-16 md:pt-24">
            <div className="plz-edge">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE }}
                className="mx-auto max-w-[760px] text-center"
              >
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-plz-body">
                  Plazzaa for merchants
                </p>
                <h1 className="mt-6 text-hero text-plz-ink" style={{ textWrap: 'balance' }}>
                  Bookings shouldn&apos;t live in your{' '}
                  <span className="plz-serif italic text-plz-blue">DMs.</span>
                </h1>
                <p className="mx-auto mt-6 max-w-[54ch] text-lead text-plz-body">
                  Create one simple booking link where customers choose your services, pick an
                  available time, and book.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/signup" className="plz-btn plz-btn-primary w-full sm:w-auto">
                      Create your booking link
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <a href="#how" className="plz-btn plz-btn-quiet w-full sm:w-auto">
                      See how it works
                    </a>
                  </motion.div>
                </div>

                <p className="mt-7 text-[14px] text-plz-body">
                  Free while you set up · Customers pay you directly by transfer
                </p>
              </motion.div>
            </div>
          </section>

          {/* --------------------------------------- the product, as the hero */}
          <section className="relative bg-white pb-20 pt-14 md:pb-28 md:pt-18">
            {/* a soft field behind the screen so it sits in the page rather than on it */}
            <div className="absolute inset-x-0 bottom-0 top-[22%] bg-[#F6F8FE]" aria-hidden="true" />
            <div className="plz-edge relative">
              <motion.div
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8%' }}
                transition={{ duration: 0.8, ease: EASE }}
                className="mx-auto max-w-[1180px]"
              >
                <DashboardMock />
              </motion.div>
              <p className="mt-5 text-center text-[13px] text-plz-body">
                Your dashboard: every booking, its payment state, and the link that brought it in.
              </p>
            </div>
          </section>

          {/* -------------------------------------------------- how it works */}
          <section id="how" className="py-20 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="mx-auto max-w-[22ch] text-center text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                  From enquiry to <span className="plz-serif italic text-plz-blue">confirmed</span>.
                </h2>
              </Reveal>

              <div className="mt-16 flex flex-col gap-20 md:mt-20 md:gap-28">
                {STEPS.map((step, index) => {
                  const Mock = step.mock;
                  const flipped = index % 2 === 1;
                  return (
                    <div key={step.title} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                      <Reveal
                        y={30}
                        className={'md:col-span-5 ' + (flipped ? 'md:order-2 md:col-start-8' : 'md:order-1')}
                      >
                        <span className="text-[14px] font-semibold text-plz-blue">
                          Step {index + 1}
                        </span>
                        <h3 className="mt-3 text-h3 text-plz-ink" style={{ textWrap: 'balance' }}>
                          {step.title}
                        </h3>
                        <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-plz-body">
                          {step.body}
                        </p>
                      </Reveal>

                      <Reveal
                        y={38}
                        delay={0.08}
                        className={'md:col-span-6 ' + (flipped ? 'md:order-1 md:col-start-1' : 'md:order-2 md:col-start-7')}
                      >
                        <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
                          <Mock />
                        </motion.div>
                      </Reveal>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ------------------------------------------------ capability cards */}
          <section className="bg-plz-surface py-20 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="max-w-[24ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                  The details that stop double bookings.
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CARDS.map((card, index) => (
                  <Reveal key={card.title} delay={index * 0.06}>
                    <motion.article
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      className={'flex h-full flex-col rounded-visual p-6 ' + card.tone}
                    >
                      <h3 className="text-h4 text-plz-ink">{card.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-plz-body">{card.body}</p>
                    </motion.article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------------------- one link everywhere */}
          <section className="relative overflow-hidden bg-plz-ink py-20 text-white md:py-30">
            <div className="plz-edge grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-6">
                <h2 className="text-h2 text-white" style={{ textWrap: 'balance' }}>
                  Your customers already know where to find you.
                </h2>
                <p className="mt-5 max-w-[46ch] text-lead text-white/70">
                  Plazzaa sits behind the channels you already use. Nothing to move, nobody
                  to re-teach.
                </p>
                <ul className="mt-9 flex flex-wrap gap-2">
                  {['Instagram', 'WhatsApp', 'TikTok', 'Your website'].map((channel) => (
                    <motion.li
                      key={channel}
                      whileHover={{ y: -2 }}
                      className="rounded-ctl border border-white/20 px-4 py-2 text-[15px] text-white/85"
                    >
                      {channel}
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-7 font-mono text-[16px] text-plz-yellow">
                  → plazzaa.com/yourbusiness
                </p>
              </Reveal>

              <Reveal delay={0.1} className="lg:col-span-6">
                <div className="grid grid-cols-2 gap-4">
                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    src={images.salonOwner}
                    alt="A salon owner sectioning a client's hair for braids in Lagos"
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-visual object-cover"
                  />
                  <div className="flex flex-col gap-4 pt-8">
                    <motion.img
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      src={images.nailStudio}
                      alt="A nail technician finishing a gel manicure"
                      loading="lazy"
                      className="aspect-square w-full rounded-visual object-cover"
                    />
                    <motion.img
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      src={images.restaurantKitchen}
                      alt="A cook plating during service in a Lagos restaurant kitchen"
                      loading="lazy"
                      className="aspect-square w-full rounded-visual object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ------------------------------------------------------- trades */}
          <section className="py-20 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="text-center text-h3 text-plz-ink">Built for appointment trades</h2>
              </Reveal>
              <div className="mx-auto mt-9 grid max-w-[900px] grid-cols-2 gap-3 sm:grid-cols-3">
                {merchantTrades.map((trade, index) => {
                  const Icon = TRADE_ICONS[trade.id] || Hotel;
                  return (
                    <Reveal key={trade.id} delay={index * 0.04}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                        className="flex items-center gap-3 rounded-card border border-plz-line px-4 py-4"
                      >
                        <Icon size={20} className="shrink-0 text-plz-blue" />
                        <span className="text-[15px] font-medium text-plz-ink">{trade.label}</span>
                      </motion.div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>


          {/* ------------------------------------------------------- pricing */}
          <section id="pricing" className="bg-plz-surface py-20 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <div className="mx-auto max-w-[620px] text-center">
                  <h2 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                    Start free. Pay when it&apos;s working.
                  </h2>
                  <p className="mt-4 text-lead text-plz-body">
                    Every plan includes your booking link, your services and availability, and
                    manual payment validation.
                  </p>
                </div>
              </Reveal>

              <div className="mx-auto mt-12 grid max-w-[1080px] gap-4 md:grid-cols-3 md:mt-16">
                {PLANS.map((plan, index) => (
                  <Reveal key={plan.name} delay={index * 0.07}>
                    <motion.article
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      className={
                        'flex h-full flex-col rounded-visual p-7 ' +
                        (plan.featured
                          ? 'bg-plz-ink text-white ring-1 ring-plz-ink'
                          : 'border border-plz-line bg-white')
                      }
                    >
                      {plan.featured && (
                        <span className="mb-4 inline-flex w-fit rounded-full bg-plz-yellow px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-plz-ink">
                          Most chosen
                        </span>
                      )}

                      <h3 className={'text-h4 ' + (plan.featured ? 'text-white' : 'text-plz-ink')}>
                        {plan.name}
                      </h3>
                      <p className="mt-3 flex items-baseline gap-1">
                        <span className={'text-[38px] font-semibold leading-none tracking-[-0.03em] ' + (plan.featured ? 'text-white' : 'text-plz-ink')}>
                          {plan.price}
                        </span>
                        <span className={'text-[14px] ' + (plan.featured ? 'text-white/60' : 'text-plz-body')}>
                          {plan.cadence}
                        </span>
                      </p>
                      <p className={'mt-3 text-[14px] ' + (plan.featured ? 'text-white/70' : 'text-plz-body')}>
                        {plan.note}
                      </p>

                      <ul className="mt-6 flex flex-1 flex-col gap-3">
                        {plan.features.map((feature) => {
                          const notYet = (plan.soon || []).includes(feature);
                          return (
                            <li key={feature} className="flex items-start gap-2.5">
                              <Check
                                size={16}
                                strokeWidth={2.5}
                                className={'mt-0.5 shrink-0 ' + (plan.featured ? 'text-plz-yellow' : 'text-plz-blue')}
                              />
                              <span className={'text-[15px] ' + (plan.featured ? 'text-white/85' : 'text-plz-body')}>
                                {feature}
                                {notYet && (
                                  <span className={'ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ' + (plan.featured ? 'bg-white/15 text-white/70' : 'bg-plz-surface text-plz-body')}>
                                    Coming soon
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-8">
                        <Link
                          to="/signup"
                          className={
                            'plz-btn w-full ' +
                            (plan.featured
                              ? 'plz-btn-primary'
                              : 'border border-plz-line-strong text-plz-ink hover:border-plz-ink')
                          }
                        >
                          {plan.cta}
                        </Link>
                      </motion.div>
                    </motion.article>
                  </Reveal>
                ))}
              </div>

              <p className="mt-8 text-center text-[14px] text-plz-body">
                Customers always pay you directly by transfer. Plazzaa never touches their money.
              </p>
            </div>
          </section>

          {/* --------------------------------------------- coming soon: market */}
          <section className="pb-20 md:pb-30">
            <div className="plz-edge">
              <div className="relative overflow-hidden rounded-visual bg-plz-lavender">
                <p className="plz-script absolute right-6 top-6 hidden text-right text-[22px] leading-tight text-plz-ink/50 lg:block">
                  More People
                  <br />
                  More Possibilities
                </p>
                <div className="grid gap-10 p-8 md:grid-cols-12 md:p-14">
                  <Reveal className="md:col-span-6">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-plz-ink">
                      Coming soon
                    </span>
                    <h2 className="mt-5 max-w-[22ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                      Today, manage your bookings. Tomorrow, get discovered too.
                    </h2>
                    <p className="mt-5 max-w-[48ch] text-lead text-plz-body">
                      We are building the Plazzaa marketplace, where customers search by what
                      they want and what they can spend. Your services and hours are already
                      the listing.
                    </p>
                    <ul className="mt-7 flex flex-col gap-2.5">
                      {[
                        'Nothing to migrate when it opens',
                        'Early businesses go in first',
                        'Same link, more people arriving at it'
                      ].map((line) => (
                        <li key={line} className="flex items-start gap-3 text-[16px] text-plz-ink">
                          <Check size={18} className="mt-1 shrink-0 text-plz-blue" strokeWidth={2.5} />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal delay={0.1} className="md:col-span-6">
                    <div className="grid grid-cols-3 gap-2.5">
                      {Object.values(images).slice(0, 9).map((src, i) => (
                        <motion.img
                          key={i}
                          src={src}
                          alt=""
                          loading="lazy"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          className="aspect-square w-full rounded-[10px] object-cover"
                        />
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------------- close */}
          <section className="plz-edge pb-24 md:pb-28">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-8 rounded-visual bg-plz-ink p-8 text-white md:flex-row md:items-end md:p-14">
                <h2 className="max-w-[18ch] text-h2 text-white" style={{ textWrap: 'balance' }}>
                  Create it. Share it. Get booked.
                </h2>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/signup" className="plz-btn plz-btn-primary w-full sm:w-auto">
                      Create an account
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/login" className="plz-btn w-full border border-white/25 text-white hover:border-white sm:w-auto">
                      Log in
                    </Link>
                  </motion.div>
                </div>
              </div>
            </Reveal>

            <div className="mt-8 flex flex-col gap-2 border-t border-plz-line pt-6 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="flex flex-wrap items-center gap-3">
                <PlazzaaLogo size={26} />
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-plz-body">
                  A brighter way for businesses
                </span>
              </p>
              <p className="text-[13px] tracking-[0.02em] text-plz-grey">
                People &nbsp;·&nbsp; Places &nbsp;·&nbsp; Possibilities
              </p>
            </div>
          </section>
        </main>

        <GatewayBar />
      </div>
    </SmoothScroll>
  );
}
