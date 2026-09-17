import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { nairaShort } from '../lib/data';
import { EASE } from '../lib/motion';

/**
 * Photography-led, per design system section 6: the information is attached to
 * the image rather than trapped in a heavy container. No border, no shadow —
 * the picture is the card.
 */
export default function VenueCard({ venue, ratio = 'portrait', priceLabel, className = '', ...rest }) {
  const ratios = {
    portrait: 'aspect-[4/5]',
    landscape: 'aspect-[3/2]',
    wide: 'aspect-[16/9]',
    square: 'aspect-square'
  };

  return (
    <motion.article
      className={'group cursor-pointer ' + className}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...rest}
    >
      <div className="relative overflow-hidden rounded-visual bg-plz-surface">
        <motion.img
          src={venue.image}
          alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
          loading="lazy"
          className={'block w-full object-cover ' + (ratios[ratio] || ratios.portrait)}
          initial={false}
          whileHover={{ scale: 1.025 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        {priceLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-plz-ink">
            {priceLabel}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-semibold text-plz-ink">{venue.name}</h3>
          <p className="truncate text-[14px] text-plz-body">
            {venue.kind} · {venue.area}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="flex items-center justify-end gap-1 text-[14px] font-semibold text-plz-ink">
            <Star size={13} className="fill-plz-yellow text-plz-yellow" />
            {venue.rating}
          </span>
          <span className="text-[13px] text-plz-grey">from {nairaShort(venue.from)}</span>
        </div>
      </div>
    </motion.article>
  );
}
