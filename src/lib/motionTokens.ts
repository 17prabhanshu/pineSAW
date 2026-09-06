export const motionTokens = {
  // Original
  defaultTransition: { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.9 },
  playfulTransition: { type: "spring" as const, stiffness: 260, damping: 20, mass: 0.8 },
  pageTransition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as any },
  staggerChildren: 0.06,

  // Agent A
  springSnappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  springSmooth: { type: "spring" as const, stiffness: 100, damping: 20 },
  fade: { duration: 0.2, ease: "easeOut" as const },
  listContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  listItem: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  },

  // Agent C
  transition: {
    spring: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    },
    easeOut: {
      type: "tween" as const,
      ease: "easeOut" as const,
      duration: 0.3
    }
  },
  variants: {
    slideInRight: {
      hidden: { x: "100%", opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    fadeInUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  }
};
