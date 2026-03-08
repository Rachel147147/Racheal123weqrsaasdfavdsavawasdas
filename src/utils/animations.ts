import type { Transition, Variants } from 'framer-motion';

export const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const slowTransition: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1],
};

export const fastTransition: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: fastTransition,
  },
};

export const fadeOutVariants: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 1,
    transition: fastTransition,
  },
};

export const slideInFromLeftVariants: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: fastTransition,
  },
};

export const slideInFromRightVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: fastTransition,
  },
};

export const slideInFromTopVariants: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: fastTransition,
  },
};

export const slideInFromBottomVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: fastTransition,
  },
};

export const slideInVariants: Variants = slideInFromRightVariants;

export const scaleInVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: fastTransition,
  },
};

export const scaleOutVariants: Variants = {
  hidden: {
    scale: 1,
    opacity: 1,
  },
  visible: {
    scale: 0.8,
    opacity: 0,
    transition: defaultTransition,
  },
  exit: {
    scale: 1,
    opacity: 1,
    transition: fastTransition,
  },
};

export const rotateInVariants: Variants = {
  hidden: {
    rotate: -180,
    opacity: 0,
  },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    rotate: 180,
    opacity: 0,
    transition: fastTransition,
  },
};

export const pageTransitionVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

export const expandVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.3,
        delay: 0.1,
      },
    },
  },
};

export interface AnimationConfig {
  variants: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: Transition;
}

export function createAnimationConfig(
  variants: Variants,
  options: {
    initial?: string;
    animate?: string;
    exit?: string;
    transition?: Transition;
  } = {}
): AnimationConfig {
  return {
    variants,
    initial: options.initial ?? 'hidden',
    animate: options.animate ?? 'visible',
    exit: options.exit ?? 'exit',
    transition: options.transition,
  };
}

export function createStaggerConfig(
  itemVariants: Variants = staggerItemVariants,
  staggerDelay: number = 0.1
): {
  container: AnimationConfig;
  item: AnimationConfig;
} {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  return {
    container: createAnimationConfig(containerVariants),
    item: createAnimationConfig(itemVariants),
  };
}

export const wizardStepVariants: Variants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export const listReorderVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
    },
  },
};

export const pulseVariants: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

export const shakeVariants: Variants = {
  initial: {
    x: 0,
  },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

export const bounceVariants: Variants = {
  hidden: {
    y: 50,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  exit: {
    y: 50,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};
