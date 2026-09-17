import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';
import { merchantTrades, naira } from '../lib/data';

/**
 * The deliberate break in the customer story. The screen goes dark, the trades
 * that live on DM bookings sweep past, and one booking page is left standing.
 */
function Scene({ progress }) {
  const trades = merchantTrades.slice(0, 4);

  return (
    <div className="relative h-full">
      {/* trades passing through the frame */}
      {trades.map((trade, index) => {
        const spots = [
          { left: '4%', top: '8%', w: 156, vec: [-260, -150], depth: 1.5 },
          { left: '78%', top: '6%', w: 140, vec: [280, -170], depth: 1.3 },
          { left: '84%', top: '62%', w: 168, vec: [300, 180], depth: 1.6 },
          { left: '2%', top: '64%', w: 176, vec: [-280, 170], depth: 1.4 }
        ][index];

        return (
          <StageLayer
            key={trade.id}
            progress={progress}
            vec={spots.vec}
            depth={spots.depth}
            hold={[0.12, 0.66]}
            className="absolute hidden lg:block"
            style={{ left: spots.left, top: spots.top, width: spots.w }}
          >
            <img
              src={trade.image}
              alt={trade.label}
              loading="lazy"
              className="block aspect-[4/5] w-full rounded-[14px] object-cover"
            />
            <p className="mt-2 text-[13px] text-white/60">{trade.label}</p>
          </StageLayer>
        );
      })}

      <div className="plz-edge flex h-full items-center py-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <StageLayer
            progress={progress}
            vec={[-220, 40]}
            depth={0.9}
            hold={[0.14, 0.9]}
            className="lg:col-span-5"
          >
            <p className="text-[15px] font-medium text-plz-yellow">Own a business?</p>
            <h2 className="mt-3 text-h2 text-white" style={{ textWrap: 'balance' }}>
              Plazzaa works for <span className="plz-serif italic">you</span> too.
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-white/70">
              Turn enquiries into bookings with one link. Create your services, set your
              availability, and share it wherever your customers already find you.
            </p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {[
                'Customers pick a time that is really free',
                'You confirm the transfer before it is booked',
                'No account needed on their side'
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-[16px] text-white/80">
                  <Check size={18} className="mt-1 shrink-0 text-plz-yellow" strokeWidth={2.5} />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/business" className="plz-btn plz-btn-primary w-full sm:w-auto">
                  Explore Plazzaa for Business
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="plz-btn w-full border border-white/25 text-white hover:border-white sm:w-auto"
                >
                  Create your booking link
                </Link>
              </motion.div>
            </div>
          </StageLayer>

          <StageLayer
            progress={progress}
            vec={[260, -60]}
            depth={1.15}
            hold={[0.18, 0.9]}
            className="lg:col-span-7 lg:pl-10"
          >
            <div className="mx-auto w-full max-w-[420px] rounded-visual bg-white p-5 shadow-panel md:p-6">
              <div className="flex items-center gap-2 border-b border-plz-line pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-plz-line-strong" />
                <span className="font-mono text-[13px] text-plz-body">plazzaa.com/glowspa</span>
              </div>

              <h3 className="mt-4 text-h4 text-plz-ink">Glow Spa, Lekki</h3>
              <p className="mt-1 text-[14px] text-plz-body">Open Fri–Sun · Bank transfer</p>

              <ul className="mt-4 flex flex-col divide-y divide-plz-line">
                {merchantTrades.slice(0, 3).map((trade) => (
                  <li key={trade.id} className="flex items-center justify-between py-2.5">
                    <span className="text-[15px] font-medium text-plz-ink">{trade.service}</span>
                    <span className="text-[14px] text-plz-body">
                      {trade.price ? naira(trade.price) : 'Free'} · {trade.minutes} mins
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

              <div className="mt-4 rounded-ctl bg-plz-cream p-3.5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-plz-body">
                  Awaiting your validation
                </p>
                <p className="mt-1 text-[15px] text-plz-ink">
                  Amaka O. · Saturday 13:30 · {naira(25000)}
                </p>
              </div>
            </div>
          </StageLayer>
        </div>
      </div>
    </div>
  );
}

export default function MerchantStage() {
  return (
    <ScrollStage id="for-business" length={3.2} mobileLength={2.7} backdrop="#18181B">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
