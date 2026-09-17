import { motion, useTransform, useReducedMotion } from 'motion/react';

/**
 * One piece of a stage's scene.
 *
 * The choreography is identical everywhere, which is what makes the site read
 * as one object: a layer arrives from outside the frame, settles where you can
 * read it, then grows and travels back out past the camera as you keep going.
 * Depth sets how far and how fast — distant layers drift, near ones sweep.
 *
 *   vec     direction it enters from and leaves toward, px at desktop width
 *   depth   1 = distant drift, 2 = passes close to the camera
 *   hold    [in, out] window where the layer is settled and readable
 *   arrive  false when the layer is already in place at progress 0 (hero)
 */
export default function StageLayer({
  progress,
  vec = [0, 0],
  depth = 1,
  hold = [0.22, 0.72],
  fade = 0.12,
  arrive = true,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const [inAt, outAt] = hold;
  const [vx, vy] = vec;

  const travel = reduce ? 0 : depth;
  const exitX = vx * travel * 1.35;
  const exitY = vy * travel * 1.35;
  const exitScale = reduce ? 1 : 1 + 0.26 * depth;

  const entering = arrive && inAt > 0.001;
  const enterX = entering ? vx * travel : 0;
  const enterY = entering ? vy * travel : 0;
  const enterScale = entering && !reduce ? 1 + 0.16 * depth : 1;

  // Positions: either (enter → settle → leave) or (already here → leave)
  const keyframes = entering ? [0, inAt, outAt, 1] : [0, outAt, 1];
  const xs = entering ? [enterX, 0, 0, exitX] : [0, 0, exitX];
  const ys = entering ? [enterY, 0, 0, exitY] : [0, 0, exitY];
  const scales = entering ? [enterScale, 1, 1, exitScale] : [1, 1, exitScale];

  const x = useTransform(progress, keyframes, xs);
  const y = useTransform(progress, keyframes, ys);
  const scale = useTransform(progress, keyframes, scales);

  // Opacity is a short ramp at each end, not a slope across the whole stage —
  // otherwise a layer that has handed over is still half-visible underneath the
  // one that replaced it.
  const fadeInStart = Math.max(0, inAt - fade);
  const fadeOutEnd = Math.min(1, outAt + fade);
  const opacity = useTransform(
    progress,
    entering
      ? [fadeInStart, inAt, outAt, fadeOutEnd]
      : [0, outAt, fadeOutEnd],
    entering ? [0, 1, 1, 0] : [1, 1, 0]
  );

  return (
    <motion.div
      className={className}
      style={{ x, y, scale, opacity, willChange: 'transform, opacity', ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
