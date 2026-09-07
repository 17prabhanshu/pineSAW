"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CaretLeft, 
  CaretRight, 
  Play, 
  Pause, 
  ShieldWarning, 
  ArrowRight, 
  Lightning, 
  FileText, 
  HandCoins, 
  GlobeHemisphereWest,
  Fingerprint,
  LockKey
} from "@phosphor-icons/react";
import clsx from "clsx";
import { toast } from "sonner";
import Link from "next/link";

export interface CarouselSlide {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  badge: string;
  telemetry: { label: string; value: string }[];
  actionLabel: string;
  actionToast: string;
  linkHref?: string;
  iconType: "THREAT" | "FINANCIAL" | "CRYPTO" | "LEGAL" | "DARKNET";
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: "BRIEF-01",
    category: "TACTICAL INTERCEPT · TOR EXIT NODE",
    title: "Operation ShadowBroker: Darknet Liquidity Burst",
    subtitle: "Agora Cluster #8841 · BTC Escrow Drain Detected",
    description: "Multi-hop automated transaction velocity exceeded standard baseline by 4.2× within 45 minutes. Direct association identified with known fentanyl distributor 'SilkMerchant_99'.",
    priority: "CRITICAL",
    badge: "98% CONFIDENCE",
    telemetry: [
      { label: "BTC VOLUME", value: "142.85 BTC" },
      { label: "TARGET ADDR", value: "bc1qar0srrr7xfkvy5l643..." },
      { label: "NODE HOP", value: "3x Tor Relays" },
      { label: "JURISDICTION", value: "Chandigarh · UT" }
    ],
    actionLabel: "Issue Asset Freeze",
    actionToast: "Dispatched Emergency Asset Freeze Notice to FIU-IND Gateway.",
    linkHref: "/entities/e-darklord99",
    iconType: "CRYPTO"
  },
  {
    id: "BRIEF-02",
    category: "STATUTORY DIRECTIVE · PMLA § 17",
    title: "Hawala Syndicate Layering via Sector 17 Nodal Accounts",
    subtitle: "State Bank & HDFC Mule Accounts Flagged",
    description: "Automated cash deposits followed by immediate offshore RTGS transfers across 6 beneficiary companies. Statutory requisition prepared for competent judicial magistrate endorsement.",
    priority: "CRITICAL",
    badge: "ACTIONABLE",
    telemetry: [
      { label: "AMOUNT", value: "₹4.82 Crore" },
      { label: "FLAGGED MULES", value: "4 Linked Accounts" },
      { label: "COMPLIANCE", value: "CrPC § 91" },
      { label: "STATUS", value: "Ready for Signoff" }
    ],
    actionLabel: "Generate Subpoena",
    actionToast: "CrPC § 91 Notice generated and sealed with SHA-256 integrity hash.",
    linkHref: "/actions",
    iconType: "FINANCIAL"
  },
  {
    id: "BRIEF-03",
    category: "INFRASTRUCTURE INTEL · C&C RECON",
    title: "Pegasus-Variant RAT Outbound Telemetry Detected",
    subtitle: "Reverse Proxy Beaconing on Port 8443",
    description: "Anomalous persistent heartbeat identified targeting critical infrastructure gateways. High-entropy encrypted payloads detected bypassing standard signature detection filters.",
    priority: "HIGH",
    badge: "ACTIVE SURVEILLANCE",
    telemetry: [
      { label: "REMOTE IP", value: "192.168.1.45 (Tor Exit)" },
      { label: "PROTOCOL", value: "TLS 1.3 Mimic" },
      { label: "PAYLOAD HASH", value: "e3b0c44298fc1c149afb..." },
      { label: "SEVERITY", value: "Level 1 Threat" }
    ],
    actionLabel: "Deploy Countermeasure",
    actionToast: "Autonomous firewall blackhole rule deployed across border gateways.",
    linkHref: "/alerts",
    iconType: "DARKNET"
  },
  {
    id: "BRIEF-04",
    category: "LEGAL EVOCATION · BHARATIYA NAGARIK SURAKSHA SANHITA",
    title: "Automated Production Order: Digital Evidence Preservation",
    subtitle: "Section 94 BNSS Digital Evidence Preservation Requisition",
    description: "Simulated procedural production orders compiled for telecommunications service providers, requesting CDR, IPDR, and cell tower telemetry logs.",
    priority: "MEDIUM",
    badge: "COURT READY",
    telemetry: [
      { label: "STATUTORY BASIS", value: "BNSS § 94 / IT Act" },
      { label: "EVIDENCE ATTACHED", value: "18 Digital Exhibits" },
      { label: "INVESTIGATOR", value: "OP-7492" },
      { label: "DISTRICT", value: "Cyber Cell, Chandigarh" }
    ],
    actionLabel: "Review Requisition",
    actionToast: "Statutory documentation dossier compiled and routed to legal review queue.",
    linkHref: "/reports",
    iconType: "LEGAL"
  }
];

export function IntelligenceCarousel({ 
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 6000 
}: { 
  slides?: CarouselSlide[];
  autoPlayInterval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const slideCount = slides.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % slideCount);
    setProgress(0);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + slideCount) % slideCount);
    setProgress(0);
  }, [slideCount]);

  const goToSlide = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Autoplay loop with smooth timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 100;
    const step = (intervalTime / autoPlayInterval) * 100;

    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          nextSlide();
          return 0;
        }
        return old + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, nextSlide]);

  const currentSlide = slides[currentIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div 
      className="relative w-full rounded-3xl bg-zinc-950/80 border border-white/10 overflow-hidden shadow-2xl p-6 mb-8 group"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Controls & Navigation Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
            LIVE OPERATIONAL DISPATCHES ({currentIndex + 1}/{slideCount})
          </span>
        </div>

        {/* Carousel Prev/Next & Play/Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title={isPlaying ? "Pause Rotation" : "Resume Rotation"}
          >
            {isPlaying ? <Pause size={12} weight="bold" /> : <Play size={12} weight="bold" />}
          </button>
          
          <button
            onClick={prevSlide}
            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title="Previous Directive"
          >
            <CaretLeft size={14} weight="bold" />
          </button>

          <button
            onClick={nextSlide}
            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title="Next Directive"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Slide Container with Animated Directional Transitions */}
      <div className="relative min-h-[220px] sm:min-h-[190px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            {/* Left Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={clsx(
                  "text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  currentSlide.priority === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/40" :
                  currentSlide.priority === "HIGH" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                  "bg-white/10 text-white border-white/20"
                )}>
                  {currentSlide.priority}
                </span>

                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  {currentSlide.category}
                </span>

                <span className="text-[9px] font-mono text-zinc-500 border border-white/10 px-2 py-0.5 rounded-full">
                  {currentSlide.badge}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight leading-snug mb-1">
                {currentSlide.title}
              </h2>
              
              <div className="text-xs font-mono text-zinc-400 mb-2 font-medium">
                {currentSlide.subtitle}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 max-w-3xl mb-4">
                {currentSlide.description}
              </p>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentSlide.telemetry.map((item, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-xs font-mono text-white font-medium truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Action Callout Column */}
            <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <button
                onClick={() => {
                  toast.success(currentSlide.actionLabel + " Executed", {
                    description: currentSlide.actionToast
                  });
                }}
                className="w-full md:w-48 py-2.5 px-4 bg-white text-black font-semibold rounded-xl text-xs font-mono hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              >
                <Lightning size={16} weight="fill" /> {currentSlide.actionLabel}
              </button>

              {currentSlide.linkHref && (
                <Link
                  href={currentSlide.linkHref}
                  className="w-full md:w-48 py-2 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
                >
                  Inspect Case Dossier <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Progress Bar & Indicator Pips */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 relative z-10">
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={clsx(
                "h-1.5 rounded-full transition-all cursor-pointer",
                idx === currentIndex 
                  ? "w-8 bg-white shadow-[0_0_10px_white]" 
                  : "w-2 bg-white/20 hover:bg-white/40"
              )}
              title={`Jump to ${s.title}`}
            />
          ))}
        </div>

        {/* Autoplay Active Progress Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
            AUTOROTATE {isPlaying ? "ACTIVE" : "PAUSED"}
          </span>
          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
