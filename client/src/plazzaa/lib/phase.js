/**
 * Timeline helpers for scroll-linked scenes.
 *
 * A stage runs 0 → 1 as it is scrolled through. Every phase of a scene is a
 * window inside that range, so the whole sequence is one reversible timeline
 * rather than a pile of separate triggers: scrub backwards and every value
 * retraces the way it came.
 */

/** Position inside a window, clamped: before it 0, after it 1. */
export const phase = (p, from, to) => {
  if (to <= from) return p >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
};

/** Smooth both ends of a phase so nothing starts or stops abruptly. */
export const ease = (t) => t * t * (3 - 2 * t);

/** Eased position inside a window. */
export const step = (p, from, to) => ease(phase(p, from, to));

/** Linear blend. */
export const mix = (a, b, t) => a + (b - a) * t;

/**
 * Fade in over `rise`, hold, fade out over `fall`.
 * Used for anything that should be readable for part of a stage and gone the
 * rest of it, without a long opacity slope bleeding across the whole scene.
 */
export const band = (p, inAt, outAt, rise = 0.06, fall = 0.06) => {
  const up = step(p, Math.max(0, inAt - rise), inAt);
  const down = 1 - step(p, outAt, Math.min(1, outAt + fall));
  return Math.min(up, down);
};
