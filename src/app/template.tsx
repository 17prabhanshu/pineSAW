"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motionTokens";

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTokens.pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
