import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, Clock } from 'lucide-react';
import TopNav from '../components/TopNav';
import DMCollapse from '../components/DMCollapse';
import SiteFooter from '../components/SiteFooter';
import GatewayBar from '../components/GatewayBar';
import { images, merchantServices, merchantHours, naira } from '../lib/data';
import { revealUp, viewportOnce, EASE } from '../lib/motion';

const STEPS = [
  {
    title: 'Add your services',
    body: 'Name, price and how long it takes. That is the whole form.',
    render: () => (
      <ul className="divide-y divide-plz-line">
        {merchantServices.slice(0, 2).map((service) => (
          <li key={service.name} className="flex items-center justify-between py-3">
            <span className="text-[15px] font-medium text-plz-ink">{service.name}</span>
            <span className="text-[14px] text-plz-body">
              {naira(service.price)} · {service.minutes} mins
            </span>
          </li>
        ))}
      </ul>
    )
  },
  {
    title: 'Set when you are available',
    body: 'Your opening days and hours. Plazzaa turns them into bookable times.',
    render: () => (
      <div className="flex flex-wrap gap-2">
        {merchantHours.map((slot) => (
          <span key={slot.day} className="rounded-ctl bg-plz-surface px-3 py-2 text-[14px] font-medium text-plz-ink">
            {slot.day} {slot.hours}
          </span>
        ))}
      </div>
    )
  },
  {
    title: 'Share your link',
    body: 'One address that works in a bio, a status, or a reply.',
    render: () => (
      <p className="font-mono text-[15px] text-plz-blue">plazzaa.com/glowspa</p>
    )
  },
  {
    title: 'Customers book',
    body: 'They pick a time that is actually free. No account, no back and forth.',
    render: () => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-ctl bg-plz-blue px-3 py-2 text-[14px] font-medium text-white">
          Saturday · 2:00 PM
        </span>
        <span className="text-[14px] text-plz-body">Amaka O. · {naira(25000)}</span>
      </div>
    )
  },
  {
    title: 'Confirm the booking',
    body: 'They transfer to your account. You check it landed, then validate.',
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 rounded-ctl bg-plz-cream px-3 py-2 text-[14px] font-medium text-plz-ink">
          <Clock size={15} />
          Payment received?
        </span>
        <span className="plz-btn plz-btn-primary h-10 px-4 text-[14px]">Validate booking</span>
      </div>
    )
  }
];

const CHANNELS = ['Instagram', 'WhatsApp', 'TikTok', 'Your website'];

/**
 * Plazzaa for Business. Not a marketplace and not consumer lifestyle — this
 * page opens on the operational problem (bookings living in DMs) and resolves
 * it into one link, then walks the real V1 flow: services, availability, link,
 * booking, validation.
 */
export default function ForBusiness() {
  return (
    <div className="plz-root min-h-screen bg-white">
      <TopNav tone="solid" />

      <main className="pt-[64px] md:pt-[76px]">
        {/* Hero */}
        <section className="bg-plz-cream py-14 md:py-22">
          <div className="plz-edge grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="lg:col-span-6"
            >
              <h1 className="text-h1 text-plz-ink" style={{ textWrap: 'balance' }}>
                Bookings shouldn&apos;t live in your <span className="plz-serif italic">DMs</span>.
              </h1>
              <p className="mt-6 max-w-[52ch] text-lead text-plz-body">
                Create one Plazzaa booking link where customers can see your services,
                choose an available time, and book it.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className="plz-btn plz-btn-primary">
                  Create your booking link
                  <ArrowRight size={16} />
                </Link>
                <a href="#how" className="plz-btn plz-btn-quiet">See how it works</a>
              </div>

              <p className="mt-6 text-[14px] text-plz-body">
                Free while you set up. Customers pay you directly by transfer.
              </p>
            </motion.div>

            <div className="lg:col-span-6">
              <DMCollapse />
            </div>
          </div>
        </section>

        {/* How it works — the page builds the booking page */}
        <section id="how" className="py-18 md:py-30">
          <div className="plz-edge">
            <motion.h2
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="max-w-[18ch] text-h2 text-plz-ink"
              style={{ textWrap: 'balance' }}
            >
              Five steps, then you are taking bookings.
            </motion.h2>

            <ol className="mt-12 flex flex-col">
              {STEPS.map((step, index) => (
                <motion.li
                  key={step.title}
                  variants={revealUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, ease: EASE, delay: index * 0.04 }}
                  className="grid gap-5 border-t border-plz-line py-8 md:grid-cols-12 md:gap-10 md:py-10"
                >
                  <div className="flex items-baseline gap-4 md:col-span-5">
                    <span className="text-[15px] font-semibold text-plz-grey">{index + 1}</span>
                    <div>
                      <h3 className="text-h4 text-plz-ink">{step.title}</h3>
                      <p className="mt-2 max-w-[44ch] text-[15px] text-plz-body">{step.body}</p>
                    </div>
                  </div>
                  <div className="md:col-span-7 md:pl-10">{step.render()}</div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* One link everywhere */}
        <section className="bg-plz-ink py-18 text-white md:py-30">
          <div className="plz-edge grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6"
            >
              <h2 className="text-h2 text-white" style={{ textWrap: 'balance' }}>
                Your customers already know where to find you.
              </h2>
              <p className="mt-5 max-w-[48ch] text-lead text-white/70">
                Give them somewhere better to book you. Plazzaa sits behind the channels
                you already use — it does not ask you to leave them.
              </p>

              <ul className="mt-10 flex flex-wrap gap-2">
                {CHANNELS.map((channel) => (
                  <li
                    key={channel}
                    className="rounded-ctl border border-white/20 px-4 py-2 text-[15px] text-white/85"
                  >
                    {channel}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[16px] text-plz-yellow">
                → plazzaa.com/yourbusiness
              </p>
            </motion.div>

            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={images.salonOwner}
                  alt="A salon owner braiding a client's hair in Lagos"
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-visual object-cover"
                />
                <div className="flex flex-col gap-4 pt-10">
                  <img
                    src={images.spaReception}
                    alt="A spa owner at her reception desk"
                    loading="lazy"
                    className="aspect-square w-full rounded-visual object-cover"
                  />
                  <img
                    src={images.restaurantOwner}
                    alt="A restaurant owner before service"
                    loading="lazy"
                    className="aspect-square w-full rounded-visual object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Coming soon: marketplace */}
        <section className="py-18 md:py-30">
          <div className="plz-edge">
            <div className="grid gap-10 rounded-visual bg-plz-lavender p-8 md:grid-cols-12 md:p-14">
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="md:col-span-7"
              >
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-plz-ink">
                  Coming soon
                </span>
                <h2 className="mt-5 max-w-[20ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
                  Today: manage your bookings. Tomorrow: get discovered too.
                </h2>
                <p className="mt-5 max-w-[52ch] text-lead text-plz-body">
                  We are building the Plazzaa marketplace, where customers find businesses
                  by what they are looking for and what they want to spend. Join early and
                  build your presence from day one.
                </p>
              </motion.div>

              <div className="md:col-span-5 md:pl-6">
                <ul className="flex flex-col gap-4">
                  {[
                    'Your services and hours are already the listing',
                    'Nothing to migrate when it opens',
                    'Early businesses go in first'
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-[16px] text-plz-ink">
                      <Check size={18} className="mt-1 shrink-0 text-plz-blue" strokeWidth={2.5} />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="plz-edge pb-22 md:pb-30">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-plz-line pt-12 md:flex-row md:items-end">
            <h2 className="max-w-[16ch] text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Start taking bookings this week.
            </h2>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="plz-btn plz-btn-primary">
                Create an account
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="plz-btn plz-btn-quiet">Log in</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <GatewayBar emphasis="merchant" />
    </div>
  );
}
