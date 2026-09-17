import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { images, merchantServices, naira } from '../lib/data';
import { revealUp, viewportOnce } from '../lib/motion';

const SCATTER = [
  { src: images.spaReception, left: '4%', top: '6%', w: 148, dx: 120, dy: 150 },
  { src: images.salonOwner, left: '58%', top: '2%', w: 132, dx: -90, dy: 190 },
  { src: images.barberShop, left: '70%', top: '54%', w: 156, dx: -140, dy: -90 },
  { src: images.restaurantOwner, left: '2%', top: '58%', w: 164, dx: 150, dy: -120 }
];

/** One piece of the consumer scene, travelling toward the centre as you scroll. */
function ScatterImage({ item, progress, collapse }) {
  const x = useTransform(progress, [0.15, 0.8], [0, item.dx * collapse]);
  const y = useTransform(progress, [0.15, 0.8], [0, item.dy * collapse]);

  return (
    <motion.img
      src={item.src}
      alt=""
      loading="lazy"
      className="absolute rounded-[14px] object-cover"
      style={{ left: item.left, top: item.top, width: item.w, height: item.w, x, y }}
    />
  );
}

/**
 * The deliberate break in the customer story. The page goes dark, the scattered
 * consumer imagery collapses inward, and one clean booking page is left
 * standing — which is exactly what the merchant product does to a DM thread.
 */
export default function MerchantBreak() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'center 50%']
  });

  const collapse = reduce ? 0 : 1;
  const pageScale = useTransform(scrollYProgress, [0.25, 1], [reduce ? 1 : 0.9, 1]);
  const pageOpacity = useTransform(scrollYProgress, [0.2, 0.75], [reduce ? 1 : 0, 1]);
  const scatterOpacity = useTransform(scrollYProgress, [0.15, 0.7], [1, reduce ? 1 : 0.12]);

  return (
    <section ref={ref} className="bg-plz-ink py-18 text-white md:py-30">
      <div className="plz-edge grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="lg:col-span-5"
        >
          <p className="text-[15px] font-medium text-plz-yellow">Own a business?</p>
          <h2 className="mt-4 text-h2 text-white" style={{ textWrap: 'balance' }}>
            Plazzaa works for <span className="plz-serif italic">you</span> too.
          </h2>
          <p className="mt-5 max-w-[48ch] text-lead text-white/70">
            Turn enquiries into bookings with one simple link. Create your services, set
            your availability, and share one Plazzaa link wherever your customers already
            find you.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Customers pick a real available time',
              'You confirm payment before it is booked',
              'No account needed on their side'
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-[16px] text-white/80">
                <Check size={18} className="mt-1 shrink-0 text-plz-yellow" strokeWidth={2.5} />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/business" className="plz-btn plz-btn-primary">
              Explore Plazzaa for Business
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/signup"
              className="plz-btn border border-white/25 text-white hover:border-white"
            >
              Create your booking link
            </Link>
          </div>
        </motion.div>

        <div className="relative min-h-[420px] overflow-hidden lg:col-span-7 lg:min-h-[520px]">
          {/* the consumer scene, collapsing */}
          <motion.div style={{ opacity: scatterOpacity }} className="absolute inset-0" aria-hidden="true">
            {SCATTER.map((item, index) => (
              <ScatterImage key={index} item={item} progress={scrollYProgress} collapse={collapse} />
            ))}
          </motion.div>

          {/* what's left standing */}
          <motion.div
            style={{ scale: pageScale, opacity: pageOpacity }}
            className="relative mx-auto w-full max-w-[420px] rounded-visual bg-white p-6 text-plz-ink"
          >
            <div className="flex items-center gap-2 border-b border-plz-line pb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-plz-line-strong" />
              <span className="font-mono text-[13px] text-plz-body">plazzaa.com/glowspa</span>
            </div>

            <h3 className="mt-5 text-h4">Glow Spa, Lekki</h3>
            <p className="mt-1 text-[14px] text-plz-body">Open Fri–Sun · Bank transfer</p>

            <ul className="mt-5 flex flex-col divide-y divide-plz-line">
              {merchantServices.slice(0, 2).map((service) => (
                <li key={service.name} className="flex items-center justify-between py-3">
                  <span className="text-[15px] font-medium">{service.name}</span>
                  <span className="text-[14px] text-plz-body">
                    {naira(service.price)} · {service.minutes} mins
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {['11:00', '13:30', '16:00'].map((time, i) => (
                <span
                  key={time}
                  className={
                    'rounded-ctl px-3 py-2 text-[14px] font-medium ' +
                    (i === 1 ? 'bg-plz-blue text-white' : 'bg-plz-surface text-plz-ink')
                  }
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-ctl bg-plz-cream p-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-body">
                Awaiting your validation
              </p>
              <p className="mt-1 text-[15px]">Amaka O. · Saturday 13:30 · {naira(25000)}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
