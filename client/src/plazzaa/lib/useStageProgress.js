import { useScroll, useTransform, useSpring } from 'motion/react';

/**
 * Progress across the range a pinned stage is actually held on screen:
 * 0 the moment the stage reaches the top of the viewport, 1 when it has been
 * scrolled all the way through.
 *
 * Measured live from layout on every scroll frame. Motion's own
 * `useScroll({ target, offset })` reads the sticky child's moving box, which
 * makes progress rise and then fall again — hence doing it by hand.
 *
 * The value is then damped with a spring so a flick of the wheel arrives as
 * travel rather than a jump; this is what gives the scene its weight.
 */
export default function useStageProgress(ref, { damp = true } = {}) {
  const { scrollY } = useScroll();

  const raw = useTransform(scrollY, (y) => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return 0;
    const top = el.getBoundingClientRect().top + y;
    const span = Math.max(1, el.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, (y - top) / span));
  });

  const smooth = useSpring(raw, { stiffness: 260, damping: 42, mass: 0.6 });

  return damp ? smooth : raw;
}
