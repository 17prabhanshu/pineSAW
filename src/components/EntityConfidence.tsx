"use client";

import React, { useState } from "react";
import { Info, ShieldCheck, ShieldWarning, TreeStructure, Link as LinkIcon, Sparkle } from "@phosphor-icons/react";
import clsx from "clsx";

export interface EntityConfidenceProps {
  score?: number; // legacy score (0-100), mapped to Admiralty/NATO rating
  tier?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  grade?: string; // e.g. "A1", "B2", "C3"
  sourceReliability?: "A" | "B" | "C" | "D" | "E" | "F";
  contentCredibility?: "1" | "2" | "3" | "4" | "5" | "6";
  reasoning?: string;
  centrality?: number | string;
  cluster?: string;
  degreesOfSeparation?: number;
  evidenceCount?: number;
  compact?: boolean;
  showDetails?: boolean;
}

// Admiralty / NATO System Mapping:
// Source Reliability:
// A: Completely Reliable
// B: Usually Reliable
// C: Fairly Reliable
// D: Not Usually Reliable
// E: Unreliable
// F: Reliability Cannot Be Judged
//
// Content Credibility:
// 1: Confirmed by other sources
// 2: Probably True
// 3: Possibly True
// 4: Doubtful
// 5: Improbable
// 6: Truth Cannot Be Judged

export function EntityConfidence({
  score = 75,
  tier,
  grade,
  sourceReliability,
  contentCredibility,
  reasoning,
  centrality = 0.84,
  cluster = "Cluster-4 (Narcotics/Crypto)",
  degreesOfSeparation = 1,
  evidenceCount = 6,
  compact = false,
  showDetails = true,
}: EntityConfidenceProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Derive NATO grade if not provided
  const derivedGrade = grade || (score >= 85 ? "A1" : score >= 70 ? "B2" : score >= 50 ? "C3" : "D4");
  const derivedTier = tier || (score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW");
  const rel = sourceReliability || derivedGrade[0] as "A"|"B"|"C"|"D";
  const cred = contentCredibility || derivedGrade[1] as "1"|"2"|"3"|"4";

  const gradeLabels: Record<string, { label: string; desc: string }> = {
    A1: { label: "Completely Reliable · Confirmed", desc: "Corroborated across independent Tor scrape channels & verified cryptographic ledger." },
    B2: { label: "Usually Reliable · Probably True", desc: "Corroborated by darknet vendor telemetry and cross-referenced alias linkages." },
    C3: { label: "Fairly Reliable · Possibly True", desc: "Single-source darknet listing with semantic vector matching." },
    D4: { label: "Doubtful / Unverified", desc: "Uncorroborated report pending secondary evidence verification." },
  };

  const activeGradeMeta = gradeLabels[derivedGrade] || gradeLabels.B2;

  if (compact) {
    return (
      <div className="relative inline-flex items-center gap-1.5 font-mono">
        <span
          className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer inline-flex items-center gap-1",
            derivedTier === "CRITICAL"
              ? "bg-red-950/40 text-red-400 border-red-800/40"
              : derivedTier === "HIGH"
              ? "bg-amber-950/40 text-amber-400 border-amber-800/40"
              : "bg-zinc-900 text-zinc-300 border-white/10"
          )}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          title="Click to inspect NATO/Admiralty Intelligence Matrix"
        >
          <span>{derivedGrade}</span>
          <span className="text-[9px] opacity-75 uppercase">
            {derivedTier === "CRITICAL" ? "High Confidence" : derivedTier === "HIGH" ? "Moderate Confidence" : "Corroborated"}
          </span>
          <Info size={11} className="opacity-60" />
        </span>

        {isPopoverOpen && (
          <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3.5 rounded-xl border border-white/15 bg-[#0a0c10] shadow-2xl text-left text-xs font-sans">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Admiralty / NATO Standard</span>
              <span className="font-mono text-xs font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{derivedGrade}</span>
            </div>
            <div className="text-xs font-semibold text-white mb-1">{activeGradeMeta.label}</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed mb-3">{activeGradeMeta.desc}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/10 pt-2 text-zinc-500">
              <div>Source: <span className="text-zinc-300 font-bold">{rel} (Reliable)</span></div>
              <div>Content: <span className="text-zinc-300 font-bold">{cred} (Probably True)</span></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative p-4 rounded-xl border border-white/10 bg-[#0a0c10] text-left">
      {/* Reasoning First Display (Section 3.7) */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkle size={12} className="text-[#00f0ff]" /> GNN Attribution & Explainability
          </span>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1",
                derivedTier === "CRITICAL"
                  ? "bg-red-950/40 text-red-400 border-red-800/40"
                  : derivedTier === "HIGH"
                  ? "bg-amber-950/40 text-amber-400 border-amber-800/40"
                  : "bg-zinc-900 text-zinc-300 border-white/10"
              )}
            >
              NATO {derivedGrade} · {derivedTier === "CRITICAL" ? "High Confidence" : "Moderate Confidence"}
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {reasoning ||
            "Identified via high-weight cross-platform identifiers and GNN neighbor-aggregation. Directly connected to flagged laundering clusters."}
        </p>
      </div>

      {/* Admiralty Standard Breakdown */}
      <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-y-2 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-4">
          <span>Source: <span className="text-zinc-300">Grade {rel}</span></span>
          <span>Credibility: <span className="text-zinc-300">Level {cred}</span></span>
        </div>
        {showDetails && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Eigenvector Centrality in SNAP graph">
              <TreeStructure size={12} className="text-zinc-400" />
              <span>Centrality: {typeof centrality === "number" ? centrality.toFixed(2) : centrality}</span>
            </span>
            <span className="flex items-center gap-1" title="Corroborated Evidence Nodes">
              <LinkIcon size={12} className="text-zinc-400" />
              <span>{evidenceCount} Evidence Nodes</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
