"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { NetworkGraph } from "@/components/NetworkGraph";
import { ShieldWarning, MagnifyingGlass, Funnel, Clock, CaretRight, Info, Eye, DownloadSimple, Printer, Checks, HandCoins, Lightning, Bank, ArrowsClockwise, FileText, CheckCircle } from "@phosphor-icons/react";
import clsx from "clsx";
import { BidirectionalBacktracker } from "@/lib/analytics/backtrack";

export default function InvestigationWorkspace() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [investigation, setInvestigation] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activePane, setActivePane] = useState<"GRAPH" | "BACKTRACK" | "REPORT" | "EVIDENCE">("GRAPH");

  // Bidirectional Backtracking Trace Data
  const [traceData, setTraceData] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const p = await params;
      setId(p.id as string);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/investigations/${id}`).then(r => r.json()).then(setInvestigation);
    fetch("/api/graph").then(r => r.json()).then(setGraphData);
    setTraceData(BidirectionalBacktracker.traceSyndicateFlow("ShadowBroker"));
  }, [id]);

  if (!investigation || !graphData) return (
    <div className="flex h-full items-center justify-center font-mono text-sm text-zinc-400 flex-col gap-4">
      <div className="w-4 h-4 bg-gov-blue animate-pulse"></div>
      LOADING INVESTIGATION WORKSPACE...
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden flex-col bg-zinc-900/50">
      {/* Institutional Top Header */}
      <header className="h-16 glass border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 font-mono text-[10px] bg-blue-50 text-gov-blue border border-blue-800/50 font-bold">{investigation.caseId}</span>
            <span className="px-2 py-0.5 bg-zinc-900/50 text-zinc-300 font-mono text-[10px] border border-white/10 font-semibold">{investigation.status}</span>
            <span className={clsx(
              "px-2 py-0.5 font-mono text-[10px] font-bold border",
              investigation.priority === 'CRITICAL' ? "badge-critical" : "badge-warning"
            )}>
              {investigation.priority}
            </span>
          </div>
          <h1 className="font-display font-bold text-white text-base">{investigation.title}</h1>
        </div>

        {/* View Switcher Toolbar */}
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-zinc-900/50 p-1 border border-white/10">
            <button 
              onClick={() => setActivePane("GRAPH")} 
              className={clsx("px-3 py-1.5 text-xs font-semibold transition-none", activePane === "GRAPH" ? "bg-gov-blue text-white" : "text-zinc-300 hover:text-white")}
            >
              Property Graph
            </button>
            <button 
              onClick={() => setActivePane("BACKTRACK")} 
              className={clsx("px-3 py-1.5 text-xs font-semibold transition-none", activePane === "BACKTRACK" ? "bg-gov-blue text-white" : "text-zinc-300 hover:text-white")}
            >
              Bidirectional Backtracking (MFScope)
            </button>
            <button 
              onClick={() => setActivePane("EVIDENCE")} 
              className={clsx("px-3 py-1.5 text-xs font-semibold transition-none", activePane === "EVIDENCE" ? "bg-gov-blue text-white" : "text-zinc-300 hover:text-white")}
            >
              Evidence Board
            </button>
            <button 
              onClick={() => setActivePane("REPORT")} 
              className={clsx("px-3 py-1.5 text-xs font-semibold transition-none", activePane === "REPORT" ? "bg-gov-blue text-white" : "text-zinc-300 hover:text-white")}
            >
              Case Dossier
            </button>
          </div>

          <div className="text-right hidden md:block border-l border-white/10 pl-4">
            <div className="text-[9px] font-mono text-zinc-400 uppercase">Investigating Officer</div>
            <div className="text-xs font-mono font-bold text-white">{investigation.investigator}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-zinc-400 uppercase">Graph Confidence</div>
            <div className="text-xs font-mono font-bold text-gov-blue">{(investigation.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel - Timeline & Summary */}
        <div className="w-80 glass border-r border-white/10 flex flex-col shrink-0 z-10 overflow-y-auto p-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Executive Intelligence Summary</h2>
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/30 p-3 border border-white/5">
              Syndicate identified as <strong className="text-white">{investigation.entities?.[0]?.entity?.label || "ShadowBroker"}</strong> operates across GenesisMarket (.onion) and Telegram. Automated on-chain tracing confirms fund flows to 4 domestic Indian bank accounts and an offshore Swiss deposit.
            </p>
          </div>

          <hr className="border-white/5" />

          {/* Timeline */}
          <div>
            <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-2 mb-4">
              <Clock size={14} /> Case Activity Log
            </h2>
            <div className="space-y-4 pl-1 text-xs">
              <div className="relative pl-4 border-l-2 border-gov-blue pb-2">
                <div className="absolute w-2 h-2 bg-gov-blue -left-[5px] top-1"></div>
                <div className="text-[10px] font-mono text-zinc-400 mb-0.5">Phase 2 Verified</div>
                <div className="font-semibold text-white">Bidirectional Backtracking Completed</div>
                <div className="text-[11px] text-zinc-300">Off-ramp choke points identified at HDFC and Swissquote.</div>
              </div>
              <div className="relative pl-4 border-l-2 border-white/10 pb-2">
                <div className="absolute w-2 h-2 bg-zinc-400 -left-[5px] top-1"></div>
                <div className="text-[10px] font-mono text-zinc-400 mb-0.5">Case Opening</div>
                <div className="font-semibold text-zinc-200">Investigation File Registered</div>
                <div className="text-[11px] text-zinc-300">Automated darknet ingestion alert triaged.</div>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Quick Action Block */}
          <div className="space-y-2">
            <Link href="/financial" className="w-full btn-gov py-2 text-xs text-center block">
              Review 6 Financial Assets (/financial)
            </Link>
            <Link href="/reports" className="w-full btn-secondary py-2 text-xs text-center block">
              Print Magistrate Report
            </Link>
          </div>
        </div>

        {/* Center Canvas Pane */}
        <div className="flex-1 relative bg-zinc-900/50 flex flex-col overflow-auto">
          
          {/* PANE 1: PROPERTY GRAPH */}
          {activePane === "GRAPH" && (
            <div className="w-full h-full relative">
              <NetworkGraph data={graphData} onNodeClick={setSelectedEntity} />
            </div>
          )}

          {/* PANE 2: BIDIRECTIONAL BACKTRACKING VISUALIZER (NDSS MFScope) */}
          {activePane === "BACKTRACK" && (
            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="glass nexus-border p-6 shadow-sm">
                <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gov-blue font-bold">
                      NDSS MFSCOPE PROTOCOL · REVERSE ON-CHAIN TAINT ANALYSIS
                    </span>
                    <h2 className="text-xl font-display font-bold text-white mt-1">
                      Syndicate Financial Flow & Choke-Point Analysis
                    </h2>
                  </div>
                  <span className="badge-critical font-mono">FLOW: $35,000 USD EQUIVALENT</span>
                </div>

                {/* Flow Diagram Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs mb-6">
                  <div className="bg-red-50 border border-red-800/50 p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-red-600 font-bold uppercase">1. Origin Point</div>
                      <div className="font-bold text-white mt-1">GenesisMarket Listing #8492</div>
                      <div className="text-[11px] text-zinc-300 mt-1">Synthetic Opioid Listing</div>
                    </div>
                    <span className="text-[10px] font-mono text-red-700 mt-3 font-semibold">Tor .onion</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-800/50 p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-amber-700 font-bold uppercase">2. Crypto Deposit</div>
                      <div className="font-bold text-white mt-1 break-all">0x742d...f44e</div>
                      <div className="text-[11px] text-zinc-300 mt-1">14.5 ETH Received</div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 mt-3 font-semibold">Ethereum Ledger</span>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-purple-700 font-bold uppercase">3. Mixer Layer</div>
                      <div className="font-bold text-white mt-1">Liquidity Pool Mixer</div>
                      <div className="text-[11px] text-zinc-300 mt-1">Smart Contract Obfuscation</div>
                    </div>
                    <span className="text-[10px] font-mono text-purple-700 mt-3 font-semibold">Tumbled Output</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-800/50 p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-blue-700 font-bold uppercase">4. Exchange Deposit</div>
                      <div className="font-bold text-white mt-1">Deposit Hot Wallet #99104</div>
                      <div className="text-[11px] text-zinc-300 mt-1">Binance / Gateway KYC</div>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 mt-3 font-semibold">Regulated KYC Link</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-300 p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-emerald-800 font-bold uppercase">5. Fiat Off-Ramps</div>
                      <div className="font-bold text-white mt-1">HDFC, SBI & Swissquote</div>
                      <div className="text-[11px] text-zinc-300 mt-1">INR 2.1M + CHF 25K</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 mt-3 font-semibold">Bank Wire Target</span>
                  </div>
                </div>

                {/* Evidentiary Box */}
                <div className="p-4 bg-zinc-800/30 border border-white/10 text-xs space-y-2">
                  <div className="font-bold text-white font-mono text-[11px] uppercase">
                    Forensic Choke-Point Verification
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {traceData?.evidentiarySummary}
                  </p>
                  <div className="pt-2 flex gap-3">
                    <Link href="/financial" className="btn-gov text-xs py-1.5 px-3 flex items-center gap-1">
                      <Bank size={14} /> Execute Section 68F Freeze on Accounts
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANE 3: EVIDENCE BOARD */}
          {activePane === "EVIDENCE" && (
            <div className="p-8 max-w-5xl mx-auto w-full">
              <h2 className="text-xl font-display font-bold text-white mb-6">Chain-of-Custody Evidence Board</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investigation.evidence?.map((ev: any) => (
                  <div key={ev.id} className="glass border border-white/10 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] uppercase font-bold bg-zinc-900/50 px-2 py-0.5 border border-white/10 text-zinc-200">{ev.type}</span>
                      <span className="font-mono text-xs text-gov-blue font-bold">CONF {(ev.confidence*100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">{ev.description}</p>
                    <div className="text-[11px] text-zinc-400 font-mono border-t border-zinc-100 pt-2 flex justify-between">
                      <span>Source: {ev.source}</span>
                      <span className="text-zinc-400">SHA-256 Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANE 4: CASE DOSSIER */}
          {activePane === "REPORT" && (
            <div className="p-8 max-w-4xl mx-auto w-full overflow-auto">
              <div className="glass border border-white/10 p-10 shadow-sm space-y-8 text-white">
                <div className="text-center border-b border-white/10 pb-6">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-1">
                    CHANDIGARH POLICE CYBER THREAT INTELLIGENCE DOSSIER
                  </div>
                  <h1 className="text-2xl font-display font-bold">{investigation.title}</h1>
                  <p className="font-mono text-xs text-gov-blue mt-1">CASE REF: {investigation.caseId} // FOR OFFICIAL POLICE USE ONLY</p>
                </div>
                
                <section className="space-y-2">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                    1. Investigative Scope & Background
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Target syndicate operating under persona "ShadowBroker" engages in multi-jurisdictional synthetic narcotics distribution. The pineSAW platform has linked the entity's GenesisMarket storefront to unencrypted Telegram communication vectors and identified 4 domestic accounts (HDFC, SBI, ICICI, Axis) used for fiat liquidation.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                    2. Recommended Statutory Injunctions
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-zinc-300 space-y-1.5">
                    <li>Immediate transmission of Section 91 Cr.P.C. requisitions to HDFC Bank Ltd and State Bank of India.</li>
                    <li>Service of Section 68F NDPS Act debit-freeze orders to prevent dissipation of illicit balances.</li>
                    <li>Inter-agency escalation to the Enforcement Directorate (ED) regarding the Swissquote offshore channel.</li>
                  </ul>
                </section>

                <div className="pt-4 flex justify-end">
                  <button onClick={() => window.print()} className="btn-gov text-xs py-2 px-4 flex items-center gap-2">
                    <Printer size={16} /> Print Official Intelligence Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Drawer (Entity Details / Action Queue) */}
        {selectedEntity && (
          <div className="w-96 glass border-l border-white/10 flex flex-col shrink-0 z-20 shadow-xl">
            <div className="p-5 bg-zinc-800/30 border-b border-white/10 relative">
              <button onClick={() => setSelectedEntity(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><CaretRight size={18} /></button>
              <div className="text-[10px] font-mono text-gov-blue uppercase font-bold tracking-widest mb-1">{selectedEntity.group}</div>
              <h2 className="text-lg font-display font-bold text-white break-all">{selectedEntity.label}</h2>
              <div className="mt-3 flex gap-2">
                <span className="badge-critical font-mono text-[10px]">RISK: {selectedEntity.priorityScore || 85}</span>
                <span className="badge-neutral font-mono text-[10px]">CONF: 95%</span>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-1">Entity Rationale</div>
                <p className="text-zinc-300 bg-zinc-800/30 p-2.5 border border-white/5 leading-relaxed">
                  Identified as central hub in the syndicate transaction graph. Direct connections to high-velocity nodes and fiat off-ramps.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <Link href={`/entities/${selectedEntity.id}`} className="w-full btn-gov text-center py-2 block">
                  Open Forensic Profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
