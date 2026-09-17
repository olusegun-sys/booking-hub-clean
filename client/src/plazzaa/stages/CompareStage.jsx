import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { ArrowUpRight, Star } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';
import { venueById, nairaShort } from '../lib/data';

const SHORTLIST = ['ayaba', 'kofa', 'ile'];

const ROWS = [
  { label: 'Dinner for two', get: (v) => nairaShort(v.forTwo) },
  { label: 'Area', get: (v) => v.area },
  { label: 'Good for', get: (v) => v.tags.slice(0, 2).join(', ') },
  { label: 'Rating', get: (v) => v.rating + ' (' + v.reviews + ')' }
];

/**
 * Three places you are deciding between arrive from three different directions,
 * line up, and the comparison writes itself underneath them row by row.
 */
function Scene({ progress }) {
  const places = SHORTLIST.map(venueById).filter(Boolean);
  const tableOpacity = useTransform(progress, [0.36, 0.5, 0.84, 0.94], [0, 1, 1, 0]);

  return (
    <div className="plz-edge flex h-full flex-col justify-center py-24">
      <StageLayer progress={progress} vec={[0, -80]} depth={0.7} hold={[0.1, 0.9]}>
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h2 text-plz-ink lg:col-span-7" style={{ textWrap: 'balance' }}>
            Too many good options? Put them next to each other.
          </h2>
          <p className="max-w-[44ch] text-lead text-plz-body lg:col-span-5">
            Compare by price, area, rating and what a place is actually good for — without
            ten tabs open.
          </p>
        </div>
      </StageLayer>

      <div className="-mx-6 mt-8 grid grid-cols-3 gap-3 overflow-x-clip px-6 md:mt-10 md:gap-5">
        {places.map((place, index) => (
          <StageLayer
            key={place.id}
            progress={progress}
            vec={[index === 0 ? -380 : index === 1 ? 0 : 380, index === 1 ? 260 : 60]}
            depth={1.1 + index * 0.12}
            hold={[0.16 + index * 0.05, 0.9]}
          >
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 340, damping: 26 }}>
              <div className="relative overflow-hidden rounded-visual bg-white">
                <img
                  src={place.image}
                  alt={`${place.name}, ${place.kind} in ${place.area}`}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover md:aspect-[3/2]"
                />
              </div>
              <div className="flex items-start justify-between gap-2 pt-3">
                <h3 className="text-[15px] font-semibold leading-tight text-plz-ink md:text-[18px]">
                  {place.name}
                </h3>
                <span className="hidden shrink-0 items-center gap-1 text-[14px] font-semibold text-plz-ink md:flex">
                  <Star size={13} className="fill-plz-yellow text-plz-yellow" />
                  {place.rating}
                </span>
              </div>
            </motion.div>
          </StageLayer>
        ))}
      </div>

      <motion.div style={{ opacity: tableOpacity }} className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">{places.map((p) => p.name).join(', ')} compared</caption>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-plz-line-strong">
                <th
                  scope="row"
                  className="w-[120px] py-3 pr-4 align-top text-[13px] font-medium text-plz-body md:w-[180px]"
                >
                  {row.label}
                </th>
                {places.map((place) => (
                  <td
                    key={place.id}
                    className="py-3 pr-4 align-top text-[15px] font-medium text-plz-ink md:text-[16px]"
                  >
                    {row.get(place)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <StageLayer
        progress={progress}
        vec={[0, 120]}
        depth={0.6}
        hold={[0.32, 0.9]}
        className="mt-8"
      >
        <Link to="/explore" className="plz-link-cta">
          Find places to compare
          <ArrowUpRight size={16} />
        </Link>
      </StageLayer>
    </div>
  );
}

export default function CompareStage() {
  return (
    <ScrollStage id="compare" length={3.2} mobileLength={2.7} backdrop="#F4F4F5">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
