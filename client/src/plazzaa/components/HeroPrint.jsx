import { useRef } from 'react';
import { motion, useTransform, useMotionValue, useSpring } from 'motion/react';
import { nairaShort } from '../lib/data';
import { step, mix } from '../lib/phase';

/**
 * One photograph in the hero scene.
 *
 * Scroll drives where it is: at rest, gathered around the focal image, then
 * thrown back out past the camera. Pointer drives how it feels: the print under
 * the cursor lifts, scales and tilts toward you while its neighbours step back
 * and dim — the Telescope move, where the scene reacts as a whole instead of
 * each card animating on its own.
 *
 * Scroll transforms live on the outer element and pointer transforms on the
 * inner one, so the two never overwrite each other.
 */
export default function HeroPrint({
  venue,
  spot,
  ring,
  progress,
  viewport,
  index,
  hovered,
  onHover,
  interactive,
  reduce,
  isFocal = false
}) {
  const ref = useRef(null);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });

  const restX = spot.x * viewport.width;
  const restY = spot.y * viewport.height;
  const centreX = viewport.width / 2;
  const centreY = viewport.height / 2;
  const toCentreX = centreX - restX;
  const toCentreY = centreY - restY;

  // Where this print sits once the scene has gathered: the focal lands dead
  // centre, everything else on a ring behind it.
  const ringX = isFocal ? 0 : (ring ? ring.x : 0);
  const ringY = isFocal ? 0 : (ring ? ring.y : 0);

  const travel = (axis) => (p) => {
    if (reduce) return 0;
    const converge = step(p, 0.14, 0.4);
    const disperse = step(p, 0.68, 0.94);
    const toCentre = axis === 'x' ? toCentreX + ringX : toCentreY + ringY;
    const outward = axis === 'x' ? -toCentreX * 1.9 : -toCentreY * 1.9;
    return toCentre * converge * (1 - disperse) + outward * disperse;
  };

  const x = useTransform(progress, travel('x'));
  const y = useTransform(progress, travel('y'));

  const scale = useTransform(progress, (p) => {
    if (reduce) return 1;
    const converge = step(p, 0.14, 0.4);
    const disperse = step(p, 0.68, 0.94);
    const gathered = isFocal ? 1 : 0.46;
    return mix(mix(1, gathered, converge), 1.55, disperse);
  });

  const opacity = useTransform(progress, (p) => {
    if (reduce) return isFocal ? 0 : 1;
    if (isFocal) {
      // hands over to the full-bleed layer, which starts at this exact rect
      return 1 - step(p, 0.36, 0.41);
    }
    const hidden = step(p, 0.44, 0.56); // swallowed by the opening image
    const returned = step(p, 0.68, 0.76); // bursts back out of it
    const gone = step(p, 0.88, 0.98);
    return Math.max(0, Math.min(1, 1 - hidden + returned)) * (1 - gone);
  });

  const isHovered = hovered === index;
  const isDimmed = hovered !== null && hovered !== index;

  const onPointerMove = (event) => {
    if (reduce || !interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    tiltX.set(((event.clientY - rect.top) / rect.height - 0.5) * -9);
  };

  const release = () => {
    tiltX.set(0);
    tiltY.set(0);
    onHover(null);
  };

  return (
    // The outer element owns the -50% centring in plain CSS. Motion's `x`/`y`
    // are the same properties as translateX/translateY, so mixing them on one
    // element would silently drop the centring.
    <figure
      className="absolute"
      style={{
        left: restX,
        top: restY,
        width: spot.w,
        transform: 'translate(-50%, -50%)',
        zIndex: isHovered ? 9 : isFocal ? 3 : 2
      }}
    >
      <motion.div style={{ x, y, scale, opacity, willChange: 'transform, opacity' }}>
      <motion.div
        ref={ref}
        className="relative"
        style={{ perspective: 1000 }}
        onPointerMove={onPointerMove}
        onPointerEnter={() => interactive && onHover(index)}
        onPointerLeave={release}
        onTouchStart={() => interactive && onHover(index)}
        onTouchEnd={release}
        animate={{
          scale: isHovered ? 1.07 : isDimmed ? 0.95 : 1,
          opacity: isDimmed ? 0.45 : 1,
          y: isHovered ? -8 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-visual bg-plz-surface"
          style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
        >
          <motion.img
            src={venue.image}
            alt={`${venue.name}, ${venue.kind} in ${venue.area}`}
            loading={index < 4 ? 'eager' : 'lazy'}
            className={'block w-full object-cover ' + spot.ratio}
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-plz-ink/80 to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.figcaption
            className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 text-left text-white"
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block text-[15px] font-semibold leading-tight">{venue.name}</span>
            <span className="mt-0.5 block text-[12px] text-white/75">
              {venue.kind} · from {nairaShort(venue.from)}
            </span>
          </motion.figcaption>
        </motion.div>
      </motion.div>
      </motion.div>
    </figure>
  );
}
