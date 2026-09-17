import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';
import HoverImage from '../components/HoverImage';
import { occasions, venueById, nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

/** The occasions themselves, with the places that answer them. */
function Scene({ progress }) {
  const [active, setActive] = useState(occasions[0].id);
  const current = occasions.find((o) => o.id === active) || occasions[0];
  const places = current.venues.map(venueById).filter(Boolean);

  return (
    <div className="plz-edge flex h-full flex-col justify-center py-24">
      <StageLayer progress={progress} vec={[0, -70]} depth={0.7} hold={[0.1, 0.9]}>
        <div className="flex flex-wrap justify-center gap-2">
          {occasions.map((occasion) => {
            const isActive = occasion.id === active;
            return (
              <motion.button
                key={occasion.id}
                type="button"
                onClick={() => setActive(occasion.id)}
                aria-pressed={isActive}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className={
                  'h-12 rounded-full px-5 text-[15px] font-medium transition-colors duration-micro ease-plz ' +
                  (isActive
                    ? 'bg-plz-yellow text-plz-ink'
                    : 'border border-plz-line bg-white text-plz-ink hover:border-plz-ink')
                }
              >
                {occasion.label}
              </motion.button>
            );
          })}
        </div>
      </StageLayer>

      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
        {places.map((place, index) => (
          <StageLayer
            key={place.id + '-' + index}
            progress={progress}
            vec={[index === 0 ? -340 : index === 1 ? 0 : 340, index === 1 ? 300 : 120]}
            depth={1.1 + index * 0.16}
            hold={[0.16 + index * 0.04, 0.9]}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link to="/explore#experiences" className="block">
                  <HoverImage
                    src={place.image}
                    alt={`${place.name}, ${place.kind} in ${place.area}`}
                    caption={place.name}
                    meta={`${place.kind} · from ${nairaShort(place.from)}`}
                    ratio="aspect-[4/5] md:aspect-[3/4]"
                  />
                  <p className="mt-3 max-w-[38ch] text-[15px] text-plz-body">{place.blurb}</p>
                </Link>
              </motion.div>
            </AnimatePresence>
          </StageLayer>
        ))}
      </div>

      <StageLayer
        progress={progress}
        vec={[0, 110]}
        depth={0.6}
        hold={[0.26, 0.9]}
        className="mt-8 flex justify-center md:mt-10"
      >
        <Link to="/explore#experiences" className="plz-link-cta">
          Explore experiences
          <ArrowUpRight size={16} />
        </Link>
      </StageLayer>
    </div>
  );
}

export default function OccasionGridStage() {
  return (
    <ScrollStage id="experiences" length={3.2} mobileLength={2.7} backdrop="#FFFBEB">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
