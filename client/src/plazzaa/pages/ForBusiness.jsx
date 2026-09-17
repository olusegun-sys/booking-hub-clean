import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Check, Scissors, Sparkles, Hand, Brush, Utensils, Hotel
} from 'lucide-react';
import SmoothScroll from '../lib/SmoothScroll';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import GatewayBar from '../components/GatewayBar';
import DMCollapse from '../components/DMCollapse';
import HoverImage from '../components/HoverImage';
import {
  ServicesMock, AvailabilityMock, LinkMock, BookingMock, ValidateMock
} from '../components/MerchantMocks';
import { images, merchantTrades, venues } from '../lib/data';
import { EASE } from '../lib/motion';

const STEPS = [
  {
    title: 'Add your services.',
    body: 'Name, price, how long it takes. Capacity if more than one person can book the same slot. That is the whole form.',
    mock: ServicesMock
  },
  {
    title: 'Say when you are open.',
    body: 'Your opening days and hours become real bookable times. Block an afternoon and it disappears from the page.',
    mock: AvailabilityMock
  },
  {
    title: 'Share one link.',
    body: 'It works in an Instagram bio, a WhatsApp status, a TikTok caption, or a reply. One address, everywhere you already are.',
    mock: LinkMock
  },
  {
    title: 'Customers book themselves.',
    body: 'They pick a time that is genuinely free, leave their number, and get your account details. No account, no back and forth.',
    mock: BookingMock
  },
  {
    title: 'You confirm the money landed.',
    body: 'Check your transfer, tap validate, and Plazzaa sends the confirmation. Unpaid holds expire and give the slot back.',
    mock: ValidateMock
  }
];

const TRADE_ICONS = {
  salon: Scissors,
  spa: Sparkles,
  nails: Hand,
  makeup: Brush,
  barber: Scissors,
  restaurant: Utensils
};

const CARDS = [
  {
    title: 'Slot capacity',
    body: 'One chair or ten. Set how many people can take the same time and Plazzaa counts them down.',
    tone: 'bg-plz-lavender'
  },
  {
    title: 'Holds that expire',
    body: 'An unpaid booking releases its slot automatically, so your Saturday is never blocked by someone who vanished.',
    tone: 'bg-plz-cream'
  },
  {
    title: 'Per-service links',
    body: 'Send bridal makeup to one client and a quick manicure to another. Same page, different front door.',
    tone: 'bg-plz-blue-wash'
  },
  {
    title: 'Blocked afternoons',
    body: 'Going to a wedding? Block it once and nobody can book into it.',
    tone: 'bg-white border border-plz-line'
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
 * Plazzaa for Business.
 *
 * Structured the way the reference lays a product story out: a bold branded
 * hero, then alternating rows where each claim is paired with the screen that
 * does it, a row of capability cards, a full-bleed band for the channels, a
 * grid of the trades it fits, the coming-soon marketplace, and one closing ask.
 */
export default function ForBusiness() {
  return (
    <SmoothScroll>
      <div className="plz-root min-h-screen bg-white">
        <TopNav tone="solid" />

        <main className="pt-[64px] md:pt-[76px]">
          {/* ---------------------------------------------------------- hero */}
          <section className="relative overflow-hidden bg-plz-yellow">
            <div className="plz-edge grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-22">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE }}
                className="lg:col-span-6"
              >
                <h1 className="text-hero text-plz-ink" style={{ textWrap: 'balance' }}>
                  Get booked, <span className="plz-serif italic">not</span> DM&apos;d.
                </h1>
                <p className="mt-6 max-w-[46ch] text-lead text-plz-ink/75">
                  One Plazzaa link where customers see your services, pick a time that is
                  actually free, and pay you by transfer.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/signup" className="plz-btn plz-btn-ink w-full sm:w-auto">
                      Create your booking link
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <a
                      href="#how"
                      className="plz-btn w-full border border-plz-ink/20 bg-white/70 text-plz-ink hover:border-plz-ink sm:w-auto"
                    >
                      See how it works
                    </a>
                  </motion.div>
                </div>

                <p className="mt-6 text-[14px] text-plz-ink/70">
                  Free while you set up · Customers pay you directly
                </p>
              </motion.div>

              <div className="lg:col-span-6">
                <DMCollapse />
              </div>
            </div>
          </section>

          {/* -------------------------------------------------- how it works */}
          <section id="how" className="py-18 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="mx-auto max-w-[20ch] text-center text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                  How it works
                </h2>
              </Reveal>

              <div className="mt-14 flex flex-col gap-16 md:mt-18 md:gap-24">
                {STEPS.map((step, index) => {
                  const Mock = step.mock;
                  const flipped = index % 2 === 1;
                  return (
                    <div
                      key={step.title}
                      className="grid items-center gap-8 md:grid-cols-12 md:gap-14"
                    >
                      <Reveal
                        y={30}
                        className={
                          'md:col-span-5 ' + (flipped ? 'md:order-2 md:col-start-8' : 'md:order-1')
                        }
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
                        className={
                          'md:col-span-6 ' + (flipped ? 'md:order-1 md:col-start-1' : 'md:order-2 md:col-start-7')
                        }
                      >
                        <motion.div
                          whileHover={{ y: -4 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        >
                          <Mock />
                        </motion.div>
                      </Reveal>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ------------------------------------------------ capability row */}
          <section className="bg-plz-surface py-18 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="max-w-[24ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                  The details that stop double bookings.
                </h2>
              </Reveal>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
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
          <section className="relative overflow-hidden bg-plz-ink py-18 text-white md:py-30">
            <div className="plz-edge grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
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
                  <HoverImage
                    src={images.salonOwner}
                    alt="A salon owner sectioning a client's hair for braids in Lagos"
                    caption="Hair & braiding"
                    meta="Books 40 slots a week"
                    ratio="aspect-[4/5]"
                  />
                  <div className="flex flex-col gap-4 pt-8">
                    <HoverImage
                      src={images.nailStudio}
                      alt="A nail technician finishing a gel manicure"
                      caption="Nails"
                      meta="Gel manicure · 45 mins"
                      ratio="aspect-square"
                    />
                    <HoverImage
                      src={images.restaurantKitchen}
                      alt="A cook plating during service in a Lagos restaurant kitchen"
                      caption="Restaurants"
                      meta="Tables, not phone calls"
                      ratio="aspect-square"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ------------------------------------------------------- trades */}
          <section className="py-18 md:py-30">
            <div className="plz-edge">
              <Reveal>
                <h2 className="text-center text-h3 text-plz-ink">Built for appointment trades</h2>
              </Reveal>
              <div className="mx-auto mt-10 grid max-w-[900px] grid-cols-2 gap-3 sm:grid-cols-3">
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

          {/* ------------------------------------------- coming soon: market */}
          <section className="pb-18 md:pb-30">
            <div className="plz-edge">
              <div className="overflow-hidden rounded-visual bg-plz-lavender">
                <div className="grid gap-10 p-8 md:grid-cols-12 md:p-14">
                  <Reveal className="md:col-span-6">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-plz-ink">
                      Coming soon
                    </span>
                    <h2 className="mt-5 max-w-[22ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                      Today, manage your bookings. Tomorrow, get found.
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
                      {venues.slice(0, 9).map((venue) => (
                        <motion.img
                          key={venue.id}
                          src={venue.image}
                          alt={venue.name}
                          loading="lazy"
                          whileHover={{ scale: 1.04 }}
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
          <section className="plz-edge pb-24 md:pb-30">
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
                    <Link
                      to="/login"
                      className="plz-btn w-full border border-white/25 text-white hover:border-white sm:w-auto"
                    >
                      Log in
                    </Link>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <SiteFooter />
        <GatewayBar />
      </div>
    </SmoothScroll>
  );
}
