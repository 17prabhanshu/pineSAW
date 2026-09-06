"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motionTokens";
import { Search, Database, Cpu, Flag, CheckCircle2 } from "lucide-react";

export interface TimelineEvent {
  id: string;
  type: "source" | "extraction" | "analysis" | "flag";
  title: string;
  description: string;
  timestamp: string;
}

interface EvidenceTimelineProps {
  events?: TimelineEvent[];
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "source",
    title: "Data Ingestion",
    description: "Raw post scraped from Tor hidden service forum.",
    timestamp: "10:23 AM"
  },
  {
    id: "2",
    type: "extraction",
    title: "Entity Extraction",
    description: "NLP identified threat actor handle and BTC address.",
    timestamp: "10:24 AM"
  },
  {
    id: "3",
    type: "analysis",
    title: "Cross-Reference Analysis",
    description: "Matched BTC address with historical ransomware payouts.",
    timestamp: "10:25 AM"
  },
  {
    id: "4",
    type: "flag",
    title: "High Risk Flag Generated",
    description: "Threshold exceeded. Alert pushed to analyst queue.",
    timestamp: "10:25 AM"
  }
];

const iconMap = {
  source: <Database className="w-5 h-5" />,
  extraction: <Search className="w-5 h-5" />,
  analysis: <Cpu className="w-5 h-5" />,
  flag: <Flag className="w-5 h-5" />
};

const colorMap = {
  source: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  extraction: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  analysis: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  flag: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
};

export function EvidenceTimeline({ events = defaultEvents }: EvidenceTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative py-4 pl-4 md:pl-8">
      {/* Vertical Line */}
      <motion.div 
        className="absolute left-8 top-8 bottom-8 w-px bg-zinc-200 dark:bg-zinc-800"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.5, ease: "easeInOut" }}
      />
      
      <div className="space-y-8 relative">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            className="flex gap-4 items-start relative z-10"
            initial={shouldReduceMotion ? { opacity: 0 } : motionTokens.variants.fadeInUp.hidden}
            whileInView={shouldReduceMotion ? { opacity: 1 } : motionTokens.variants.fadeInUp.visible}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              ...(shouldReduceMotion ? { duration: 0 } : motionTokens.transition.spring),
              delay: shouldReduceMotion ? 0 : index * 0.2
            }}
          >
            {/* Icon Node */}
            <motion.div 
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm ${colorMap[event.type]}`}
              initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
              animate={shouldReduceMotion ? { scale: 1 } : { scale: 1 }}
              transition={{
                ...(shouldReduceMotion ? { duration: 0 } : motionTokens.transition.spring),
                delay: shouldReduceMotion ? 0 : index * 0.2 + 0.1
              }}
            >
              {iconMap[event.type]}
            </motion.div>
            
            {/* Content Card */}
            <div className="flex-1 bg-zinc-900/60 dark:bg-zinc-900 border border-white/5 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-white dark:text-zinc-100">
                  {event.title}
                </h4>
                <span className="text-xs text-zinc-400 whitespace-nowrap ml-4">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-400">
                {event.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* End Terminal Node */}
      <motion.div 
        className="flex gap-4 items-center mt-8 relative z-10 text-green-600 dark:text-green-500"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: shouldReduceMotion ? 0 : events.length * 0.2 + 0.2 }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="font-medium text-sm">Evidence Chain Complete</span>
      </motion.div>
    </div>
  );
}
