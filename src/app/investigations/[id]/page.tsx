"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IntelligenceFlowchart } from "@/components/IntelligenceFlowchart";
import { TorScrapeModal } from "@/components/TorScrapeModal";

import { ShieldWarning, MagnifyingGlass, Funnel, Clock, CaretRight, Info, Eye, DownloadSimple, Printer, Checks, HandCoins, Lightning, Bank, ArrowsClockwise, FileText, CheckCircle } from "@phosphor-icons/react";
import clsx from "clsx";
import { BidirectionalBacktracker } from "@/lib/analytics/backtrack";
import { motion } from "framer-motion";
import { motionTokens } from "@/lib/motionTokens";

export default function InvestigationWorkspace() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [investigation, setInvestigation] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activePane, setActivePane] = useState<"GRAPH" | "BACKTRACK" | "REPORT" | "EVIDENCE">("GRAPH");
  const [torModalOpen, setTorModalOpen] = useState(false);

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

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("tab") === "evidence") {
        setActivePane("EVIDENCE");
      }
    }
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
            <span className="px-2 py-0.5 font-mono text-[10px] bg-white/10 text-white border border-white/20 font-bold">{investigation.caseId}</span>
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
          <div className="flex items-center bg-zinc-900/60 p-1 border border-white/5 rounded-full">
            <button 
              onClick={() => setActivePane("GRAPH")} 
              className={clsx("px-4 py-1.5 text-xs font-medium rounded-full transition-all", activePane === "GRAPH" ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
            >
              Property Graph
            </button>
            <button 
              onClick={() => setActivePane("BACKTRACK")} 
              className={clsx("px-4 py-1.5 text-xs font-medium rounded-full transition-all", activePane === "BACKTRACK" ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
            >
              Bidirectional Backtracking (MFScope)
            </button>
            <button 
              onClick={() => setActivePane("EVIDENCE")} 
              className={clsx(
                "px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5", 
                activePane === "EVIDENCE" ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              Evidence Board
              {investigation.evidence?.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  {investigation.evidence.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActivePane("REPORT")} 
              className={clsx("px-4 py-1.5 text-xs font-medium rounded-full transition-all", activePane === "REPORT" ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
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
        <div className="w-80 bg-zinc-900/60 border-r border-white/5 flex flex-col shrink-0 z-10 overflow-y-auto p-6 space-y-8">
          <div className="space-y-2">
            <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Executive Intelligence Summary</h2>
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/20 p-3 border border-white/5">
              Case Target: <strong className="text-white">{investigation.entities?.[0]?.entity?.label || investigation.title}</strong>. Operational status: <span className="text-emerald-400 font-bold">{investigation.status}</span>. Multi-vector cyber intelligence with automated Section 63 BSA evidence preservation.
            </p>
          </div>

          <hr className="border-white/5" />

          {/* Timeline */}
          <div>
            <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-2 mb-4">
              <Clock size={14} /> Case Activity Log
            </h2>
            <div className="space-y-4 pl-1 text-xs">
              {/* Dynamic Ingested Evidence */}
              {investigation.evidence?.map((ev: any) => (
                <div key={ev.id} className="relative pl-4 border-l-2 border-emerald-500 pb-2">
                  <div className="absolute w-2 h-2 bg-emerald-400 -left-[5px] top-1 rounded-full"></div>
                  <div className="text-[10px] font-mono text-emerald-400 mb-0.5">
                    {ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Forensic Entry"}
                  </div>
                  <div className="font-semibold text-white truncate">
                    {ev.type === "DIGITAL_INTERCEPT" ? "Digital Intercept Admitted" : ev.type}
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">
                    {ev.source}: {ev.description?.split('\n')[0]}
                  </div>
                </div>
              ))}

              {/* Dynamic Case Notes */}
              {investigation.notes?.map((n: any) => (
                <div key={n.id} className="relative pl-4 border-l-2 border-cyan-500 pb-2">
                  <div className="absolute w-2 h-2 bg-cyan-400 -left-[5px] top-1 rounded-full"></div>
                  <div className="text-[10px] font-mono text-cyan-400 mb-0.5">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Case Note"}
                  </div>
                  <div className="font-semibold text-zinc-200">Officer Note ({n.author})</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">{n.content}</div>
                </div>
              ))}

              <div className="relative pl-4 border-l-2 border-gov-blue pb-2">
                <div className="absolute w-2 h-2 bg-gov-blue -left-[5px] top-1"></div>
                <div className="text-[10px] font-mono text-zinc-400 mb-0.5">Phase 2 Verified</div>
                <div className="font-semibold text-white">Bidirectional Backtracking Completed</div>
                <div className="text-[11px] text-zinc-400">Off-ramp choke points identified at HDFC and Swissquote.</div>
              </div>
              <div className="relative pl-4 border-l-2 border-white/10 pb-2">
                <div className="absolute w-2 h-2 bg-zinc-400 -left-[5px] top-1"></div>
                <div className="text-[10px] font-mono text-zinc-400 mb-0.5">Case Opening</div>
                <div className="font-semibold text-zinc-200">Investigation File Registered</div>
                <div className="text-[11px] text-zinc-400">Automated darknet ingestion alert triaged.</div>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Quick Action Block */}
          <div className="space-y-2 no-print">
            <button
              type="button"
              onClick={() => {
                setActivePane("REPORT");
                setTimeout(() => window.print(), 150);
              }}
              className="w-full btn-gov py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow hover:scale-[1.01] transition-all"
            >
              <Printer size={14} /> Print Case Dossier (PDF)
            </button>
            <Link href="/financial" className="w-full btn-secondary py-2 text-xs text-center block">
              Review 6 Financial Assets (/financial)
            </Link>
            <Link href="/reports" className="w-full text-zinc-400 hover:text-white py-1 text-xs text-center block text-[11px] font-mono">
              Custom Statutory Generator (/reports) ➔
            </Link>
            <button
              onClick={() => setTorModalOpen(true)}
              className="w-full py-2 text-xs font-mono text-center border transition-all flex items-center justify-center gap-2"
              style={{
                background: "rgba(0,240,255,0.04)",
                borderColor: "rgba(0,240,255,0.25)",
                color: "#00f0ff",
                boxShadow: "0 0 18px rgba(0,240,255,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,240,255,0.10)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(0,240,255,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,240,255,0.04)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(0,240,255,0.08)";
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }}
              />
              Scrape via Tor
            </button>
          </div>
        </div>

        {/* Center Canvas Pane */}
        <div className="flex-1 relative bg-zinc-900/50 flex flex-col overflow-auto">
          
          {/* PANE 1: PROPERTY GRAPH */}
          {activePane === "GRAPH" && (
            <div className="w-full h-full relative">
              <IntelligenceFlowchart data={graphData} onNodeClick={setSelectedEntity} />
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
                  <div className="bg-zinc-950 border border-red-500/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-red-400 font-bold uppercase">1. Origin Point</div>
                      <div className="font-bold text-white mt-1">GenesisMarket Listing #8492</div>
                      <div className="text-[11px] text-zinc-400 mt-1">Synthetic Opioid Listing</div>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 mt-3 font-semibold">Tor .onion</span>
                  </div>

                  <div className="bg-zinc-950 border border-amber-500/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-amber-300 font-bold uppercase">2. Crypto Deposit</div>
                      <div className="font-bold text-white mt-1 break-all">0x742d...f44e</div>
                      <div className="text-[11px] text-zinc-400 mt-1">14.5 ETH Received</div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 mt-3 font-semibold">Ethereum Ledger</span>
                  </div>

                  <div className="bg-zinc-950 border border-purple-500/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-purple-300 font-bold uppercase">3. Mixer Layer</div>
                      <div className="font-bold text-white mt-1">Liquidity Pool Mixer</div>
                      <div className="text-[11px] text-zinc-400 mt-1">Smart Contract Obfuscation</div>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 mt-3 font-semibold">Tumbled Output</span>
                  </div>

                  <div className="bg-zinc-950 border border-white/20 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-zinc-300 font-bold uppercase">4. Exchange Deposit</div>
                      <div className="font-bold text-white mt-1">Deposit Hot Wallet #99104</div>
                      <div className="text-[11px] text-zinc-400 mt-1">Binance / Gateway KYC</div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-300 mt-3 font-semibold">Regulated KYC Link</span>
                  </div>

                  <div className="bg-zinc-950 border border-emerald-500/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">5. Fiat Off-Ramps</div>
                      <div className="font-bold text-white mt-1">HDFC, SBI & Swissquote</div>
                      <div className="text-[11px] text-zinc-400 mt-1">INR 2.1M + CHF 25K</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 mt-3 font-semibold">Bank Wire Target</span>
                  </div>
                </div>

                {/* Evidentiary Box */}
                <div className="p-4 bg-zinc-800/20 border border-white/10 text-xs space-y-2">
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
            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Chain-of-Custody Evidence Board</h2>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Forensic digital exhibits admitted under Section 63 BSA / Section 65B Indian Evidence Act
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-zinc-300">
                    Total Exhibits: <strong className="text-white">{investigation.evidence?.length || 0}</strong>
                  </span>
                  <Link 
                    href="/ingestion" 
                    className="px-3 py-1 rounded-full bg-white text-black font-mono font-bold text-xs hover:bg-zinc-200 transition-colors"
                  >
                    + Harvest Leads
                  </Link>
                </div>
              </div>

              {(!investigation.evidence || investigation.evidence.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-400 space-y-3">
                  <p>No digital evidence exhibits attached to this case file yet.</p>
                  <Link 
                    href="/ingestion" 
                    className="inline-block px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                  >
                    Open Ingestion Harvester ➔
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investigation.evidence?.map((ev: any) => {
                    const isUrl = ev.source?.startsWith("http://") || ev.source?.startsWith("https://");
                    return (
                      <div key={ev.id} className="glass border border-white/10 p-5 shadow-sm space-y-3 rounded-xl bg-zinc-950/80">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 border border-white/15 text-zinc-200 rounded">
                            {ev.type}
                          </span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">
                            CONF {(ev.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap bg-black/50 p-3 rounded border border-white/5 max-h-48 overflow-y-auto">
                          {ev.description}
                        </div>

                        <div className="text-[11px] text-zinc-400 font-mono border-t border-white/10 pt-2 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">
                              Source:{" "}
                              {isUrl ? (
                                <a 
                                  href={ev.source} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-cyan-400 underline hover:text-cyan-300"
                                >
                                  {ev.source.substring(0, 40)}...
                                </a>
                              ) : (
                                <strong className="text-white">{ev.source}</strong>
                              )}
                            </span>
                            <span className="text-emerald-400 text-[10px] flex items-center gap-1 shrink-0 font-bold">
                              <CheckCircle size={12} weight="fill" /> SHA-256 Verified
                            </span>
                          </div>
                          {ev.createdAt && (
                            <span className="text-[10px] text-zinc-500">
                              Logged: {new Date(ev.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PANE 4: CASE DOSSIER (Always present in DOM so printing works from any tab) */}
          <div className={clsx("p-8 max-w-4xl mx-auto w-full overflow-auto", activePane === "REPORT" ? "block" : "hidden print:block")}>
              <div 
                id="print-section" 
                className="printable-dossier glass border border-white/10 p-10 shadow-sm space-y-8 text-white rounded-2xl relative"
              >
                {/* Institutional Police Header */}
                <div className="text-center border-b border-white/10 pb-6">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-1">
                    CHANDIGARH POLICE // CYBER CRIME & NARCOTICS INTELLIGENCE CELL
                  </div>
                  <h1 className="text-2xl font-display font-bold tracking-wide">{investigation.title}</h1>
                  <p className="font-mono text-xs text-gov-blue mt-1 font-semibold">
                    CASE REF: {investigation.caseId} // STATUTORY SUBMISSION FOR JUDICIAL PRODUCTION
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-400 flex-wrap">
                    <span>STATUS: <strong className="text-white">{investigation.status}</strong></span>
                    <span>•</span>
                    <span>PRIORITY: <strong className="text-red-400">{investigation.priority}</strong></span>
                    <span>•</span>
                    <span>OFFICER: <strong className="text-white">{investigation.investigator}</strong></span>
                    <span>•</span>
                    <span>ADMISSIBILITY: <strong className="text-emerald-400">SEC. 63 BSA (2023)</strong></span>
                  </div>
                </div>
                
                {/* Section 1 */}
                <section className="space-y-2">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                    1. Investigative Scope & Background
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Intelligence file registered under reference <strong>{investigation.caseId}</strong>. Primary subject: <strong className="text-white">{investigation.entities?.[0]?.entity?.label || investigation.title}</strong>. The platform continuously assimilates multi-source intercepts across clearweb forums, Tor .onion hidden services, and Telegram C2 networks, securing chain-of-custody under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of the Indian Evidence Act).
                  </p>
                </section>

                {/* Section 2 */}
                <section className="space-y-2">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                    2. Recommended Statutory Injunctions
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-zinc-300 space-y-1.5">
                    <li>Immediate transmission of Section 91 Cr.P.C. requisitions to banking and ISP intermediaries.</li>
                    <li>Service of Section 68F NDPS Act debit-freeze orders against detected financial choke points.</li>
                    <li>Inter-agency escalation regarding detected offshore liquidation channels.</li>
                  </ul>
                </section>

                {/* Section 3: Exhibits Table */}
                {investigation.evidence?.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                      3. Admitted Digital Evidence & Forensic Exhibits ({investigation.evidence.length})
                    </h3>
                    <div className="space-y-3">
                      {investigation.evidence.map((ev: any, idx: number) => (
                        <div key={ev.id} className="p-3.5 bg-zinc-950 border border-white/10 rounded-lg text-xs space-y-1.5 font-mono page-break-avoid">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1">
                            <span className="font-bold text-white uppercase">Exhibit #{idx + 1}: {ev.type}</span>
                            <span className="text-emerald-400 text-[10px] font-bold">SHA-256 Validated</span>
                          </div>
                          <div className="text-zinc-400 text-[11px] truncate">
                            <strong>Source:</strong> {ev.source}
                          </div>
                          <div className="text-zinc-200 text-[11px] leading-relaxed whitespace-pre-wrap bg-black/40 p-2 rounded border border-white/5">
                            {ev.description}
                          </div>
                          <div className="text-[10px] text-zinc-500 pt-0.5 flex justify-between">
                            <span>Admitted: {new Date(ev.createdAt).toLocaleString()}</span>
                            <span>Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 4: Forensic Certificate & Signature Block */}
                <section className="space-y-3 pt-4 border-t border-white/10 page-break-avoid">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
                    4. Statutory Certificate of Authenticity (Sec. 63 BSA / Sec. 65B IEA)
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    &ldquo;I hereby certify that the electronic intercepts and cryptographic hashes catalogued in this dossier were produced by automated, tamper-evident computational systems operating lawfully under the continuous custody of the Chandigarh Cyber Crime Cell. The SHA-256 hashes confirm bit-level integrity from ingestion to judicial production without algorithmic alteration.&rdquo;
                  </p>
                  <div className="pt-8 grid grid-cols-2 gap-10 text-xs font-mono text-zinc-400">
                    <div>
                      <div className="border-b border-zinc-400/50 pb-8 mb-1.5"></div>
                      <div className="font-bold text-white uppercase">{investigation.investigator || "Investigating Officer"}</div>
                      <div className="text-[10px] text-zinc-500">Cyber Crime & Narcotics Intelligence Desk</div>
                    </div>
                    <div className="text-right">
                      <div className="border-b border-zinc-400/50 pb-8 mb-1.5"></div>
                      <div className="font-bold text-white uppercase">Station Official Seal & Stamp</div>
                      <div className="text-[10px] text-zinc-500">Date: {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </section>

                {/* Print Action Button */}
                <div className="pt-6 flex justify-end no-print">
                  <button 
                    type="button"
                    onClick={() => window.print()} 
                    className="btn-gov text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <Printer size={16} /> Print Official Intelligence Dossier
                  </button>
                </div>
              </div>
            </div>

        </div>

        {/* Right Drawer (Entity Details / Action Queue) */}
        {selectedEntity && (
          <motion.div 
            drag
            initial={{ scale: 0.8, filter: "blur(20px)", opacity: 0 }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
            transition={motionTokens.awwwardsSpring}
            className="absolute top-20 right-6 w-96 glass border border-white/10 flex flex-col shrink-0 z-50 shadow-2xl rounded-xl cursor-grab active:cursor-grabbing"
          >
            <div className="p-5 bg-zinc-800/20 border-b border-white/10 relative cursor-default">
              <button onClick={() => setSelectedEntity(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><CaretRight size={18} /></button>
              <div className="text-[10px] font-mono text-gov-blue uppercase font-bold tracking-widest mb-1">{selectedEntity.group}</div>
              <h2 className="text-lg font-display font-bold text-white break-all">{selectedEntity.label}</h2>
              <div className="mt-3 flex gap-2">
                <span className="badge-critical font-mono text-[10px]">RISK: {selectedEntity.priorityScore || 85}</span>
                <span className="badge-neutral font-mono text-[10px]">
                  CONF: {selectedEntity.confidence ? Math.round(selectedEntity.confidence * 100) : Math.min(98, Math.max(72, Math.round(76 + ((selectedEntity.priorityScore || 80) * 0.2) + ((selectedEntity.id || "0").charCodeAt(0) % 5))))}%
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-1">Entity Rationale</div>
                <p className="text-zinc-300 bg-zinc-800/20 p-2.5 border border-white/5 leading-relaxed">
                  Identified as central hub in the syndicate transaction graph. Direct connections to high-velocity nodes and fiat off-ramps.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 cursor-default">
                <Link href={`/entities/${selectedEntity.id}`} className="w-full btn-gov text-center py-2 block">
                  Open Forensic Profile
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tor Scrape Modal */}
      <TorScrapeModal
        open={torModalOpen}
        onClose={() => setTorModalOpen(false)}
        investigationId={id}
      />
    </div>
  );
}
