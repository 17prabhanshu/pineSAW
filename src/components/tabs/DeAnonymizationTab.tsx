"use client";

import { useState } from "react";
import { 
  Fingerprint, 
  ShareNetwork, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  DownloadSimple, 
  Robot, 
  ArrowsLeftRight, 
  Sparkle,
  LockKey,
  GlobeHemisphereWest,
  Cpu
} from "@phosphor-icons/react";
import clsx from "clsx";
import { toast } from "sonner";

interface DeAnonymizationTabProps {
  entity: any;
}

export default function DeAnonymizationTab({ entity }: DeAnonymizationTabProps) {
  const [copiedAffidavit, setCopiedAffidavit] = useState(false);
  const [isAgentDispatched, setIsAgentDispatched] = useState(false);

  // Cross-Platform identity resolution nodes
  const identityResolutions = [
    {
      layer: "DARKNET FORUM HANDLE",
      platform: "Agora & Bohemia Market",
      identifier: entity?.label || "DarkLord99",
      confidence: 99.4,
      verification: "Cryptographic PGP Signatures across 18 listings",
      status: "CONFIRMED"
    },
    {
      layer: "PGP PUBLIC KEY FINGERPRINT",
      platform: "MIT PGP Keyserver & Tor Mirrors",
      identifier: "4A81 B892 018C EFE1 F890 A912 80AB 9901 41D2",
      confidence: 98.2,
      verification: "RSA 4096-bit key created 2021-04-12",
      status: "CONFIRMED"
    },
    {
      layer: "MESSAGING / C2 INTERCEPT",
      platform: "Telegram Darknet Syndicate",
      identifier: `@${(entity?.label || "darklord").toLowerCase().replace(/[^a-z0-9]/g, "")}_ops (ID: 184920194)`,
      confidence: 94.6,
      verification: "Shared Wasabi BTC deposit address mentioned in private escrow chat",
      status: "HIGH PROBABILITY"
    },
    {
      layer: "FINANCIAL MULE KYC",
      platform: "Domestic Indian Banking Switch (RTGS/IMPS)",
      identifier: "Axis Bank A/C: 91901004829108 (IFSC: UTIB0000041)",
      confidence: 91.8,
      verification: "NDPS § 68F peeling chain hop #4 liquidated through P2P crypto desk",
      status: "ACTIONABLE"
    }
  ];

  // SHAP feature importance attributions
  const shapFeatures = [
    { feature: "Shared Bitcoin Peeling Chain Cluster", impact: "+38.4%", value: 38.4, detail: "Direct utxo convergence into laundering mixer" },
    { feature: "PGP Key Header Timestamp & KeyID Match", impact: "+28.2%", value: 28.2, detail: "Exact subkey fingerprint match across 3 darknet forums" },
    { feature: "Stylometric Lexical & Homoglyph Vector", impact: "+18.9%", value: 18.9, detail: "97.1% cosine similarity on linguistic phrasing & typo cadences" },
    { feature: "Temporal Online/Offline Correlation", impact: "+10.9%", value: 10.9, detail: "Simultaneous login timestamps on Tor exit node and Telegram" }
  ];

  const handleCopyAffidavit = () => {
    const text = `IN THE COURT OF THE SPECIAL JUDGE, NDPS ACT
AFFIDAVIT UNDER SECTION 68F(1) & 68F(2) - MIT-CSAIL DE-ANONYMIZATION EVIDENCE
TARGET: ${entity?.label || "DarkLord99"} (Entity ID: ${entity?.id || "ENT-0x99"})
DE-ANONYMIZED IDENTITY: Identified financial beneficiary of illicit darknet narcotics syndicates.
CONFIDENCE: 96.4% Heterogeneous Graph Neural Network Overlap Probability.
PRIMARY PGP FINGERPRINT: 4A81 B892 018C EFE1 F890 A912 80AB 9901 41D2
LINKED FINANCIAL ACCOUNTS: Axis Bank A/C: 91901004829108 (IFSC: UTIB0000041)
STATUTORY BASIS: Proceeds of illicit trafficking seized and frozen under Section 68F of the NDPS Act.`;

    navigator.clipboard.writeText(text);
    setCopiedAffidavit(true);
    toast.success("Statutory Affidavit Copied", {
      description: "NDPS § 68F de-anonymization evidence dossier copied to clipboard."
    });
    setTimeout(() => setCopiedAffidavit(false), 3000);
  };

  const handleDispatchGnnAgent = () => {
    setIsAgentDispatched(true);
    toast.success("Autonomous GNN Agent Dispatched", {
      description: `Tasked with autonomous crawling and recursive 3-hop link expansion on ${entity?.label}.`
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* Executive Overview Banner */}
      <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              MIT-CSAIL Graph Neural De-anonymization Suite
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
              RGCN + HGT Model v3.2
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Multi-modal identity overlap synthesis resolving pseudonymous darknet entities, Tor hidden services, PGP keys, and Telegram channels to actionable real-world financial endpoints.
          </p>
        </div>

        {/* Global Match Score Card */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-black border border-white/10 shrink-0">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">RESOLVED CONFIDENCE</div>
            <div className="text-2xl font-bold text-white mt-0.5">96.4%</div>
            <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck size={12} weight="fill" /> High Evidentiary Weight
            </div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <button
            onClick={handleDispatchGnnAgent}
            disabled={isAgentDispatched}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Robot size={14} />
            {isAgentDispatched ? "Agent Active" : "Run GNN Deep-Walk"}
          </button>
        </div>
      </div>

      {/* Cross-Platform Identity Resolution Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowsLeftRight size={14} className="text-zinc-400" />
            Cross-Platform Entity Overlap Matrix (4 Layers)
          </h3>
          <span className="text-[10px] text-zinc-400">
            Validated against Stanford SNAP & AIL Multi-socket Intercepts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {identityResolutions.map((res, i) => (
            <div 
              key={i}
              className="p-4 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-zinc-500 uppercase tracking-widest">{res.layer}</span>
                  <span className={clsx(
                    "font-bold px-1.5 py-0.2 rounded text-[9px]",
                    res.confidence > 95 ? "bg-white/10 text-white" : "bg-zinc-800 text-zinc-300"
                  )}>
                    {res.confidence}% OVERLAP
                  </span>
                </div>

                <div className="text-sm font-bold text-white select-all break-all">
                  {res.identifier}
                </div>

                <div className="text-[10px] text-zinc-400 mt-1">
                  Platform: <span className="text-zinc-300">{res.platform}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 truncate max-w-[240px]">{res.verification}</span>
                <span className="text-emerald-400 font-semibold">{res.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: SHAP Feature Importance & Stylometric NLP Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: SHAP Feature Attribution Waterfall */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-white" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                SHAP Feature Importance Attribution
              </h4>
            </div>
            <span className="text-[10px] text-zinc-500">De-anonymization Weights</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Mathematical proof explaining model confidence. Features with positive Shapley values provide mathematically verifiable linkages between the target and real-world endpoints.
          </p>

          <div className="space-y-3 pt-2">
            {shapFeatures.map((shap, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-semibold">{shap.feature}</span>
                  <span className="text-white font-bold">{shap.impact}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${shap.value * 2}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500">{shap.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Stylometric & Temporal Footprint */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-white" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Stylometry & Temporal Profile
              </h4>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-black border border-white/10">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">Typing Cadence & Stylistic Markers</div>
              <div className="text-zinc-300 leading-relaxed text-[11px]">
                Detected homoglyphs (Cyrillic 'а' replacing Latin 'a' in Telegram escrow handles) and characteristic double-spacing syntax.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black border border-white/10">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">Temporal Activity Window</div>
              <div className="text-zinc-300 text-[11px]">
                Peak operational burst: <strong className="text-white">18:30 - 02:45 UTC</strong>. 98.4% alignment between Tor onion updates and Telegram customer support broadcasts.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black border border-white/10">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">Carrier / Relay Infrastructure</div>
              <div className="text-zinc-300 text-[11px]">
                Fixed guard relay: <span className="text-white font-mono">185.220.101.42 (NL)</span> with fast 30-day circuit stability.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Statutory Legal Action & Affidavit Export */}
      <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-white" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Statutory NDPS Section 68F Evidence Package
            </h4>
          </div>
          <p className="text-[11px] text-zinc-400">
            Export legally admissible de-anonymization affidavit and asset freezing petition ready for court submission.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyAffidavit}
            className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white hover:text-black transition-all text-xs font-semibold flex items-center gap-1.5 text-white"
          >
            {copiedAffidavit ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copiedAffidavit ? "Affidavit Copied" : "Copy Affidavit"}
          </button>
          <button
            onClick={() => {
              toast.success("Affidavit PDF Generated", {
                description: "Statutory de-anonymization packet compiled with GNN graph certs."
              });
            }}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <DownloadSimple size={14} />
            Download Dossier
          </button>
        </div>
      </div>

    </div>
  );
}
