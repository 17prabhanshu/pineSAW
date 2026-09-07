"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Bank, 
  CurrencyBtc, 
  ShieldWarning, 
  ShieldCheck, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Lightning, 
  FileText, 
  ArrowClockwise,
  LockKey,
  GlobeHemisphereWest,
  MapPin,
  WarningOctagon,
  CaretRight
} from "@phosphor-icons/react";
import clsx from "clsx";
import { toast } from "sonner";

export interface ReactorHop {
  id: string;
  hopNumber: number;
  label: string;
  entityName: string;
  type: "DARKNET_ESCROW" | "COINJOIN_MIXER" | "OFFSHORE_OTC" | "DOMESTIC_BANK" | "PHYSICAL_ATM";
  typeLabel: string;
  amount: string;
  fiatEquiv: string;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  identifier: string;
  timestamp: string;
  jurisdiction: string;
  indicators: string[];
  statuteAction: string;
  statuteNoticeType: "SECTION_91_CRPC" | "SECTION_68F_NDPS";
}

const REACTOR_HOPS: ReactorHop[] = [
  {
    id: "hop-1",
    hopNumber: 1,
    label: "Darknet Market Escrow",
    entityName: "Agora Cluster #8841 (Fentanyl Listing)",
    type: "DARKNET_ESCROW",
    typeLabel: "Tor Escrow Node",
    amount: "142.85 BTC",
    fiatEquiv: "$9,285,250 USD",
    riskScore: 99,
    riskLevel: "CRITICAL",
    identifier: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    timestamp: "2026-03-04 02:14:18 UTC",
    jurisdiction: "Torland / Anonymous Exit",
    indicators: ["Agora Vendor 'SilkMerchant_99'", "High-frequency multi-sig release", "Known darknet market cluster"],
    statuteAction: "Request Blockchain Explorer Attribution",
    statuteNoticeType: "SECTION_91_CRPC"
  },
  {
    id: "hop-2",
    hopNumber: 2,
    label: "Obfuscation / Layering Protocol",
    entityName: "Wasabi 2.0 CoinJoin Pool",
    type: "COINJOIN_MIXER",
    typeLabel: "Privacy Protocol Mixer",
    amount: "141.20 BTC",
    fiatEquiv: "8 Equal-size UTXOs",
    riskScore: 94,
    riskLevel: "CRITICAL",
    identifier: "tx: 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    timestamp: "2026-03-04 03:41:02 UTC",
    jurisdiction: "Decentralized Peer-to-Peer",
    indicators: ["Peeling chain detected", "High entropy Zerolink outputs", "Mixer fee: 0.003 BTC"],
    statuteAction: "Demixing Heuristics Decomposition",
    statuteNoticeType: "SECTION_91_CRPC"
  },
  {
    id: "hop-3",
    hopNumber: 3,
    label: "Fiat Off-Ramp Settlement",
    entityName: "Unregistered Telegram P2P OTC Desk",
    type: "OFFSHORE_OTC",
    typeLabel: "Unregulated VASP Gateway",
    amount: "₹4,82,00,000 INR",
    fiatEquiv: "Split across 3 RTGS tranches",
    riskScore: 89,
    riskLevel: "HIGH",
    identifier: "OTC-BATCH-IND-882194",
    timestamp: "2026-03-04 07:12:45 UTC",
    jurisdiction: "Offshore / Hawala Settlement",
    indicators: ["Unverified Telegram Hawala desk", "RTGS batch injection", "No KYC / AML documentation"],
    statuteAction: "Issue FIU-IND Cross-Border Intercept Notice",
    statuteNoticeType: "SECTION_68F_NDPS"
  },
  {
    id: "hop-4",
    hopNumber: 4,
    label: "Domestic Beneficiary Mule Account",
    entityName: "State Bank of India (Acct: 31920048123)",
    type: "DOMESTIC_BANK",
    typeLabel: "Scheduled Commercial Bank",
    amount: "₹1,60,00,000 INR",
    fiatEquiv: "Nodal Account (Sector 17)",
    riskScore: 96,
    riskLevel: "CRITICAL",
    identifier: "SBI-0001239 · IFSC: SBIN0001239",
    timestamp: "2026-03-04 09:28:11 IST",
    jurisdiction: "Sector 17, Chandigarh (UT)",
    indicators: ["Rapid velocity cash withdrawal attempt", "Controlled by alias 'neon_dist_1'", "FIU-IND Suspicious Transaction Flag"],
    statuteAction: "Prepare Section 68F NDPS Act Asset Freeze Order",
    statuteNoticeType: "SECTION_68F_NDPS"
  },
  {
    id: "hop-5",
    hopNumber: 5,
    label: "Physical Liquidation Point",
    entityName: "Nodal ATM Outflow (Sector 17-C)",
    type: "PHYSICAL_ATM",
    typeLabel: "Physical Cash Extraction",
    amount: "₹12,50,000 INR",
    fiatEquiv: "Withdrawn via 4 ATM Cards",
    riskScore: 88,
    riskLevel: "HIGH",
    identifier: "ATM-CHD-SEC17C-04",
    timestamp: "2026-03-04 11:05:30 IST",
    jurisdiction: "Chandigarh Police Jurisdiction",
    indicators: ["ATM CCTV surveillance footage requested", "Card cloned / mule withdrawal", "Simultaneous withdrawal burst"],
    statuteAction: "Summons Under Section 91 Cr.P.C. for CCTV Requisition",
    statuteNoticeType: "SECTION_91_CRPC"
  }
];

export function ChainalysisReactorFlow({
  onSelectHopAction
}: {
  onSelectHopAction: (noticeType: "SECTION_91_CRPC" | "SECTION_68F_NDPS", hop: ReactorHop) => void;
}) {
  const [selectedHopIndex, setSelectedHopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-play trace stepper
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSelectedHopIndex(prev => (prev + 1) % REACTOR_HOPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeHop = REACTOR_HOPS[selectedHopIndex];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Identifier Copied", { description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/60 rounded-3xl border border-white/10 p-6 shadow-2xl">
      
      {/* Reactor Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 mb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              CHAINALYSIS REACTOR FORENSIC PATHWAY · CASE INV-2026-0042
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Bidirectional Asset Backtracking & Layering Decomposition
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Cryptographic tracing from Agora Tor escrow through Wasabi CoinJoin into Chandigarh Nodal Bank Accounts.
          </p>
        </div>

        {/* Playback & Reset Controls */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-2xl p-1 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause size={14} weight="bold" /> Pause Trace
              </>
            ) : (
              <>
                <Play size={14} weight="bold" /> Auto-Trace
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSelectedHopIndex(0);
              setIsPlaying(false);
              toast.info("Trace Reset", { description: "Returned to Genesis Escrow Node." });
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Trace"
          >
            <ArrowClockwise size={14} />
          </button>
        </div>
      </div>

      {/* Interactive Hop Progression Strip (Horizontal Flow Canvas) */}
      <div className="relative mb-6 overflow-x-auto pb-4 scrollbar-none">
        <div className="flex items-center gap-3 min-w-[880px]">
          {REACTOR_HOPS.map((hop, index) => {
            const isSelected = selectedHopIndex === index;
            const isPassed = selectedHopIndex >= index;

            return (
              <div key={hop.id} className="flex items-center gap-3 flex-1">
                {/* Node Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedHopIndex(index);
                    setIsPlaying(false);
                  }}
                  className={clsx(
                    "flex-1 rounded-2xl p-4 cursor-pointer transition-all border relative overflow-hidden backdrop-blur-xl",
                    isSelected
                      ? "bg-zinc-900 border-white shadow-[0_0_30px_rgba(255,255,255,0.18)]"
                      : isPassed
                      ? "bg-zinc-950/90 border-white/20 hover:border-white/40"
                      : "bg-zinc-950/40 border-white/5 opacity-50 hover:opacity-80"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border",
                      isSelected ? "bg-white text-black border-white" : "bg-black text-white border-white/20"
                    )}>
                      0{hop.hopNumber}
                    </span>

                    <span className={clsx(
                      "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded",
                      hop.riskLevel === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}>
                      RISK {hop.riskScore}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
                    {hop.typeLabel}
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate mt-0.5">
                    {hop.label}
                  </h3>

                  <div className="text-xs font-mono font-bold text-zinc-200 mt-2 truncate">
                    {hop.amount}
                  </div>
                </motion.div>

                {/* Connecting Vector Arrow */}
                {index < REACTOR_HOPS.length - 1 && (
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="w-8 h-px bg-white/20 relative">
                      <div className={clsx(
                        "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all",
                        isPassed ? "left-full -translate-x-full bg-white shadow-[0_0_8px_white]" : "left-0 bg-white/20"
                      )} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Hop Deep-Dive Forensics Console */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeHop.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto bg-zinc-950 border border-white/15 rounded-3xl p-6 flex flex-col justify-between shadow-2xl"
        >
          <div>
            {/* Hop Metadata Ribbon */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-white font-bold border border-white/20">
                    HOP 0{activeHop.hopNumber} OF 05
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    {activeHop.typeLabel}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-white tracking-tight">
                  {activeHop.entityName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white leading-none">
                    {activeHop.amount}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">
                    {activeHop.fiatEquiv}
                  </div>
                </div>

                <span className={clsx(
                  "px-3 py-1.5 rounded-xl font-mono text-xs font-bold border shrink-0",
                  activeHop.riskLevel === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                )}>
                  {activeHop.riskLevel} · {activeHop.riskScore}/100
                </span>
              </div>
            </div>

            {/* Forensics Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Technical Identifier */}
              <div className="bg-black/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                    CRYPTOGRAPHIC HASH / ACCOUNT NUMBER
                  </span>
                  <span className="text-xs font-mono text-white break-all select-all font-medium">
                    {activeHop.identifier}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(activeHop.identifier, activeHop.id)}
                  className="mt-3 text-[10px] font-mono uppercase text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === activeHop.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId === activeHop.id ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>

              {/* Timestamp & Geo Jurisdiction */}
              <div className="bg-black/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                    TIMESTAMP & JURISDICTION
                  </span>
                  <div className="text-xs font-mono text-white">
                    {activeHop.timestamp}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1 font-mono">
                    <MapPin size={12} /> {activeHop.jurisdiction}
                  </div>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 mt-3 uppercase">
                  CONFIRMATION: 42 CONFIRMATIONS
                </div>
              </div>

              {/* Attribution Flags */}
              <div className="bg-black/80 border border-white/10 rounded-2xl p-4">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  FORENSIC INDICATORS
                </span>
                <div className="space-y-1.5">
                  {activeHop.indicators.map((ind, i) => (
                    <div key={i} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400"></span>
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Footer: 1-Click Court & Freezing Execution */}
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <ShieldWarning size={16} className="text-white" />
              <span>Recommended Procedural Action: <strong className="text-white">{activeHop.statuteAction}</strong></span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success("Forensic Graph Snapshot Exported", {
                    description: `SHA-256 sealed exhibit generated for Hop 0${activeHop.hopNumber}`
                  });
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono transition-colors cursor-pointer border border-white/15"
              >
                Export Court Exhibit
              </button>

              <button
                onClick={() => onSelectHopAction(activeHop.statuteNoticeType, activeHop)}
                className="px-5 py-2 bg-white text-black font-semibold rounded-xl text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-1.5"
              >
                <Lightning size={14} weight="fill" /> Execute 1-Click Statutory Order
              </button>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
