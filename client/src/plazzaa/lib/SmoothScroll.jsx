import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Weighted, damped scrolling — the thing that makes a scroll-driven site feel
 * built rather than jumpy. Telescope uses the same approach: the wheel sets a
 * velocity and the page eases toward it instead of snapping.
 *
 * Off entirely when the viewer asks for reduced motion, and unhooked on
 * unmount so the legacy Booking Hub pages keep native scrolling.
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return undefined;

    const lenis = new Lenis({
      duration: 1.15,               // how long the page keeps travelling
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      wheelMultiplier: 0.9,         // slightly heavier than native
      touchMultiplier: 1.4,         // phones still need to feel direct
      smoothWheel: true
    });

    // Exposed so scripted checks (and the console) can drive the same easing
    window.__plzLenis = lenis;

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Anchor links should ride the same easing
    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.__plzLenis;
    };
  }, []);

  return children;
}
