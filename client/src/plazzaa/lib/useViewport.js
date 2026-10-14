import { useEffect, useState } from 'react';

/**
 * Live viewport size.
 *
 * Scroll-linked geometry (the hero's focal image grows from a card rect to
 * nearly the full screen) has to be computed in real pixels, and it has to be
 * recomputed when the window changes or the animation ends up stuck at
 * whatever size the page happened to load at.
 */
export default function useViewport() {
  const [size, setSize] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setSize({ width: window.innerWidth, height: window.innerHeight })
      );
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return size;
}
