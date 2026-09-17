import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

/**
 * A photograph you can push against.
 *
 * Hover lifts the frame, pushes the image in slightly, and tilts it a couple of
 * degrees toward the cursor — the Telescope move, where the collage feels like
 * loose prints on a table rather than a grid of divs. The caption rides up from
 * under the bottom edge at the same time.
 *
 * Touch devices get the press state instead of hover, so the same feedback is
 * there on a phone.
 */
export default function HoverImage({
  src,
  alt,
  caption,
  meta,
  ratio = 'aspect-[4/5]',
  className = '',
  sizes,
  eager = false
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });

  const onPointerMove = (event) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 7);
    rotateX.set(py * -7);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    setActive(false);
  };

  return (
    <motion.figure
      ref={ref}
      className={'group relative ' + className}
      style={{ perspective: 900 }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={reset}
      onTouchStart={() => setActive(true)}
      onTouchEnd={reset}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <motion.div
        className="relative overflow-hidden rounded-visual bg-plz-surface"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          sizes={sizes}
          className={'block w-full object-cover ' + ratio}
          animate={reduce ? {} : { scale: active ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        {(caption || meta) && (
          <>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-plz-ink/75 to-transparent"
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.figcaption
              className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white"
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              {caption && <span className="block text-[16px] font-semibold leading-tight">{caption}</span>}
              {meta && <span className="mt-0.5 block text-[13px] text-white/75">{meta}</span>}
            </motion.figcaption>
          </>
        )}
      </motion.div>
    </motion.figure>
  );
}
