"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShieldAlert, 
  Wallet, 
  Key, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Clock, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from "lucide-react";
import { IntelEvent } from "@/types/intel";

interface EntitySheetProps {
  event: IntelEvent | null;
  onClose: () => void;
  onInvestigate?: (event: IntelEvent) => void;
}

export function EntitySheet({ event, onClose, onInvestigate }: EntitySheetProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  if (!event) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleInvestigateClick = () => {
    setActionDone(true);
    if (onInvestigate) onInvestigate(event);
    setTimeout(() => setActionDone(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sliding Sheet */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/[0.1] bg-[#09090b]/95 text-zinc-100 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-violet-400">{event.id}</span>
                  <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                    <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    {event.severity}
                  </span>
                </div>
                <h2 className="text-base font-semibold tracking-tight text-white">{event.vendorAlias}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Title & Description */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Intercepted Payload Title</span>
              <h3 className="mt-1 text-sm font-medium text-white">{event.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">{event.snippet}</p>
            </div>

            {/* Contraband Tags */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Detected Substances</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {event.contraband.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Cryptocurrency Footprints */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                  <Wallet className="h-3.5 w-3.5 text-amber-400" /> Discovered On-Chain Wallets ({event.wallets.length})
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {event.wallets.map((wallet, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-400">
                          {wallet.network}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{wallet.type}</span>
                        {wallet.balanceEstimate && (
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                            Est. {wallet.balanceEstimate}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-zinc-300">{wallet.address}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(wallet.address)}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                      title="Copy Address"
                    >
                      {copiedAddress === wallet.address ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Vectors */}
            <div>
              <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                <Send className="h-3.5 w-3.5 text-blue-400" /> Communication Handles
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {event.handles.map((handle, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3"
                  >
                    <div>
                      <span className="block text-[10px] font-mono text-zinc-500">{handle.platform}</span>
                      <span className="font-mono text-xs text-zinc-200">{handle.handle}</span>
                    </div>
                    {handle.verified && (
                      <span className="rounded-full bg-emerald-500/10 p-1 text-emerald-400">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PGP & Circuit Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
                <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <Key className="h-3 w-3 text-violet-400" /> PGP Key Fingerprint
                </span>
                <p className="mt-1 font-mono text-xs text-violet-300 font-semibold">{event.pgpKeyId || "N/A"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5">
                <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <Cpu className="h-3 w-3 text-indigo-400" /> Tor Stream Circuit
                </span>
                <p className="mt-1 font-mono text-xs text-indigo-300 font-semibold">{event.torCircuitId}</p>
              </div>
            </div>

            {/* Collapsible JSON Viewer */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/30">
              <button
                onClick={() => setJsonExpanded(!jsonExpanded)}
                className="flex w-full items-center justify-between p-3.5 text-xs font-mono text-zinc-400 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-500" /> Raw Intercept Payload (JSON)
                </span>
                {jsonExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {jsonExpanded && (
                <div className="border-t border-white/[0.06] p-3">
                  <pre className="max-h-48 overflow-auto rounded-lg bg-black/60 p-3 font-mono text-[10px] leading-relaxed text-emerald-400/90">
                    {JSON.stringify(event.rawJson, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="border-t border-white/[0.08] bg-[#09090b] p-5">
            <button
              onClick={handleInvestigateClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:opacity-90 active:scale-[0.99]"
            >
              {actionDone ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" /> Target Synced to Investigation
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Link to Property Graph & Generate Subpoena
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
