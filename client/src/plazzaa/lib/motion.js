// Shared motion language for Plazzaa.
// Design system section 9: motion reveals relationships, responds to input or
// turns one state into another. Nothing moves just to prove it can.

export const EASE = [0.22, 1, 0.36, 1];

export const DURATION = {
  micro: 0.18,      // hover, tap, chip selection
  ui: 0.32,         // interface transition
  editorial: 0.64   // scroll storytelling
};

// Content arriving as you reach it
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.editorial, ease: EASE } }
};

export const revealFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.editorial, ease: EASE } }
};

// Parent that walks its children in one at a time
export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } }
});

// Cards swapping when a filter changes: the old set steps back, the new set arrives
export const swapItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.ui, ease: EASE } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.22, ease: EASE } }
};

// Interactive feedback only — springs stay on things you touch
export const pressable = {
  whileHover: { y: -3 },
  whileTap: { scale: 0.985 },
  transition: { type: 'spring', stiffness: 420, damping: 28 }
};

export const viewportOnce = { once: true, margin: '-12% 0px -12% 0px' };

// Reduced motion: keep the state change, drop the travel
export const motionSafe = (reduce, variants) => {
  if (!reduce) return variants;
  return {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };
};
