"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motionTokens";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  {
    title: "Welcome to DARKINT",
    content: "This is the Investigative Intelligence System. Press Cmd+K (or Ctrl+K) to open the Command Palette at any time.",
  },
  {
    title: "Global Search",
    content: "Use the Command Palette to quickly search for cases, entities, or navigate across the system without leaving your keyboard.",
  },
  {
    title: "Sidebar Navigation",
    content: "Access your Cases, Entities, Reports, and System Settings from the main sidebar.",
  }
];

export function SpotlightTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("DARKINT_tour_completed");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("DARKINT_tour_completed", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
            onClick={handleClose}
          />
          
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={motionTokens.defaultTransition}
            className="relative glass border border-white/5 rounded-xl shadow-2xl p-6 w-full max-w-md pointer-events-auto flex flex-col"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-1 mb-4">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 rounded-full ${i === currentStep ? 'bg-blue-600' : 'bg-zinc-200'}`} 
                />
              ))}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {steps[currentStep].title}
            </h3>
            
            <p className="text-zinc-400 mb-8 min-h-[60px]">
              {steps[currentStep].content}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:text-zinc-400 flex items-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-zinc-950 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center cursor-pointer"
              >
                {currentStep === steps.length - 1 ? "Finish Tour" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
