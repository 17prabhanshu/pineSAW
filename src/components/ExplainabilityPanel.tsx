"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motionTokens";
import { X, AlertTriangle, Shield, Activity } from "lucide-react";

interface ExplainabilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entityName?: string;
  riskScore?: number;
  features?: { name: string; impact: number; description: string }[];
}

export function ExplainabilityPanel({
  isOpen,
  onClose,
  entityName = "Unknown Entity",
  riskScore = 85,
  features = [
    { name: "Unusual Transaction Volume", impact: 40, description: "Spike in transactions in the last 24h." },
    { name: "Dark Web Mentions", impact: 30, description: "Mentions in known illicit marketplaces." },
    { name: "Geographic Anomaly", impact: 15, description: "Multiple logins from high-risk countries." }
  ]
}: ExplainabilityPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : motionTokens.transition.easeOut}
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        className="relative w-full max-w-md h-full glass dark:bg-zinc-900 shadow-2xl border-l border-white/5 dark:border-zinc-800 pointer-events-auto flex flex-col"
        initial={shouldReduceMotion ? { opacity: 0 } : motionTokens.variants.slideInRight.hidden}
        animate={shouldReduceMotion ? { opacity: 1 } : motionTokens.variants.slideInRight.visible}
        exit={shouldReduceMotion ? { opacity: 0 } : motionTokens.variants.slideInRight.hidden}
        transition={shouldReduceMotion ? { duration: 0 } : motionTokens.transition.spring}
      >
        <div className="p-4 border-b border-white/5 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            AI Reasoning Trace
          </h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-900/50 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Flagged: {entityName}</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Overall Risk Score: <span className="font-bold text-lg">{riskScore}/100</span>
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Feature Importance
          </h3>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="glass/5 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800"
                initial={shouldReduceMotion ? { opacity: 0 } : motionTokens.variants.fadeInUp.hidden}
                animate={shouldReduceMotion ? { opacity: 1 } : motionTokens.variants.fadeInUp.visible}
                transition={{
                  ...(shouldReduceMotion ? { duration: 0 } : motionTokens.transition.spring),
                  delay: shouldReduceMotion ? 0 : index * 0.1
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white dark:text-zinc-100">{feature.name}</span>
                  <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                    +{feature.impact}% impact
                  </span>
                </div>
                <p className="text-sm text-zinc-400 dark:text-zinc-400">
                  {feature.description}
                </p>
                <div className="mt-3 h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.impact}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
