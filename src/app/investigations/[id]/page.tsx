"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NetworkGraph } from "@/components/NetworkGraph";
import { ShieldWarning, MagnifyingGlass, Funnel, Clock, CaretRight, Info, Eye, DownloadSimple, Printer, Checks, HandCoins, Lightning } from "@phosphor-icons/react";
import clsx from "clsx";

export default function InvestigationWorkspace() {
  const params = useParams();
  const [id, setId] = useState<string>("");
  const [investigation, setInvestigation] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activePane, setActivePane] = useState<"GRAPH" | "REPORT" | "EVIDENCE">("GRAPH");

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
    // For demo, fetch full graph but we'd normally filter by investigation entities
    fetch("/api/graph").then(r => r.json()).then(setGraphData);
  }, [id]);

  if (!investigation || !graphData) return (
    <div className="flex h-full items-center justify-center font-mono text-sm text-zinc-500 flex-col gap-4">
      <div className="w-4 h-4 bg-nexus-cyan rounded-none-full animate-pulse"></div>
      LOADING INVESTIGATION WORKSPACE...
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden flex-col">
      {/* Header */}
      <header className="h-16 surface-1 nexus-border-b px-6 flex items-center justify-between shrink-0 z-10 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-none bg-nexus-cyan/10 text-nexus-cyan font-mono text-[10px] border border-nexus-cyan/20">{investigation.caseId}</span>
            <span className="px-2 py-0.5 rounded-none bg-zinc-800 text-zinc-600 font-mono text-[10px]">{investigation.status}</span>
            <span className={clsx(
              "px-2 py-0.5 rounded-none font-mono text-[10px] border",
              investigation.priority === 'CRITICAL' ? "badge-critical" : "badge-warning"
            )}>
              {investigation.priority}
            </span>
          </div>
          <h1 className="font-display font-semibold text-zinc-900">{investigation.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-zinc-50 rounded-none p-1 border border-zinc-200">
            <button onClick={() => setActivePane("GRAPH")} className={clsx("px-3 py-1.5 rounded-none text-xs font-medium transition-colors", activePane === "GRAPH" ? "bg-zinc-200 text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}>Network Graph</button>
            <button onClick={() => setActivePane("EVIDENCE")} className={clsx("px-3 py-1.5 rounded-none text-xs font-medium transition-colors", activePane === "EVIDENCE" ? "bg-zinc-200 text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}>Evidence Board</button>
            <button onClick={() => setActivePane("REPORT")} className={clsx("px-3 py-1.5 rounded-none text-xs font-medium transition-colors", activePane === "REPORT" ? "bg-zinc-200 text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}>Draft Report</button>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Investigator</div>
            <div className="text-sm font-medium">{investigation.investigator}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Confidence</div>
            <div className="text-sm font-medium text-nexus-cyan">{(investigation.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel - Timeline & Evidence Nav */}
        <div className="w-80 surface-1 nexus-border-r flex flex-col shrink-0 z-10">
          <div className="p-4 flex flex-col gap-4 overflow-auto">
            
            {/* Overview Summary */}
            <div className="space-y-2">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Executive Summary</h2>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Investigation focuses on a cross-platform overlap involving high-priority entity identified as {investigation.entities?.[0]?.entity?.label || "Unknown"}. Financial linkages strongly suggest unified control.
              </p>
            </div>

            <hr className="border-zinc-200" />

            {/* Timeline */}
            <div>
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Clock /> Investigative Timeline</div>
              </h2>
              <div className="space-y-4 pl-2">
                <div className="relative pl-4 border-l border-zinc-800 pb-2">
                  <div className="absolute w-2 h-2 bg-nexus-cyan rounded-none-full -left-[5px] top-1 shadow-[0_0_8px_var(--color-nexus-cyan)]"></div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">Today 10:47:30</div>
                  <div className="text-sm font-medium text-zinc-900 mb-1">Cross-platform relationship confirmed</div>
                  <div className="text-xs text-zinc-600">Analyst verified overlapping PGP key.</div>
                </div>
                <div className="relative pl-4 border-l border-zinc-800 pb-2">
                  <div className="absolute w-2 h-2 bg-zinc-600 rounded-none-full -left-[5px] top-1"></div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">Today 10:42:11</div>
                  <div className="text-sm font-medium text-zinc-700 mb-1">Investigation Opened</div>
                </div>
                <div className="relative pl-4 border-l border-zinc-800 pb-2">
                  <div className="absolute w-2 h-2 bg-nexus-amber rounded-none-full -left-[5px] top-1"></div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">Today 10:36:42</div>
                  <div className="text-sm font-medium text-zinc-700 mb-1">Activity Spike Alert Generated</div>
                </div>
                <div className="relative pl-4 border-l border-transparent pb-2">
                  <div className="absolute w-2 h-2 bg-zinc-600 rounded-none-full -left-[5px] top-1"></div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">Yesterday 10:21:04</div>
                  <div className="text-sm font-medium text-zinc-600 mb-1">Synthetic marketplace observation</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Center - Contextual Pane */}
        <div className="flex-1 relative bg-zinc-100 flex flex-col">
          {activePane === "GRAPH" && (
            <>
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-zinc-50/80 backdrop-blur border border-zinc-300 px-3 py-1.5 rounded-none text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none-full bg-nexus-red"></span> Actor
                </div>
                <div className="bg-zinc-50/80 backdrop-blur border border-zinc-300 px-3 py-1.5 rounded-none text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none-full bg-nexus-cyan"></span> Account
                </div>
                <div className="bg-zinc-50/80 backdrop-blur border border-zinc-300 px-3 py-1.5 rounded-none text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none-full bg-nexus-amber"></span> Wallet
                </div>
              </div>
              <NetworkGraph data={graphData} onNodeClick={setSelectedEntity} />
            </>
          )}

          {activePane === "REPORT" && (
            <div className="p-8 max-w-4xl mx-auto w-full overflow-auto">
              <div className="surface-1 border border-zinc-300 rounded-none p-10 shadow-md">
                <div className="text-center border-b border-zinc-300 pb-6 mb-8">
                  <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">{investigation.title}</h1>
                  <p className="font-mono text-nexus-cyan">{investigation.caseId} // UNCLASSIFIED</p>
                </div>
                
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-2 mb-4">1. Objective</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed">Determine extent of control {investigation.entities?.[0]?.entity?.label} exerts over correlated accounts across GenesisMarket and Telegram, and map associated financial infrastructure.</p>
                  </section>
                  
                  <section>
                    <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-2 mb-4">2. Current Threat Assessment</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed">High confidence ({(investigation.confidence*100).toFixed(0)}%) in initial attribution. Activity burst suggests imminent operational changes. Threat level is marked {investigation.priority}.</p>
                  </section>

                  <section>
                    <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-2 mb-4">3. Recommended Actions</h3>
                    <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-2">
                      <li>Preserve relevant synthetic evidence on GenesisMarket.</li>
                      <li>Review associated financial identifiers for KYC correlation.</li>
                      <li>Prepare simulated financial-intelligence request to competent authority.</li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activePane === "EVIDENCE" && (
             <div className="p-8 w-full overflow-auto">
                <h2 className="text-xl font-display font-medium text-zinc-900 mb-6">Evidence Board</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investigation.evidence?.map((ev: any) => (
                    <div key={ev.id} className="surface-1 border border-zinc-300 rounded-none p-5 hover:border-zinc-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[10px] uppercase bg-white/5 px-2 py-0.5 rounded-none text-zinc-600">{ev.type}</span>
                        <span className="font-mono text-[10px] text-nexus-cyan">CONF {(ev.confidence*100).toFixed(0)}%</span>
                      </div>
                      <p className="text-sm text-zinc-900 mb-4">{ev.description}</p>
                      <div className="text-xs text-zinc-500 font-mono flex items-center justify-between">
                        <span>Source: {ev.source}</span>
                        <button className="text-nexus-cyan hover:underline">Review</button>
                      </div>
                    </div>
                  ))}
                  {(!investigation.evidence || investigation.evidence.length === 0) && (
                    <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-sm border border-dashed border-zinc-300 rounded-none">
                      NO EVIDENCE ATTACHED TO THIS INVESTIGATION
                    </div>
                  )}
                </div>
             </div>
          )}

        </div>

        {/* Right Panel - Investigator Action Panel / Entity Rationale */}
        <div className="w-96 surface-1 nexus-border-l flex flex-col relative shrink-0 z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.5)]">
          {activePane === "GRAPH" && selectedEntity ? (
            <>
              <div className="p-5 nexus-border-b bg-zinc-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-nexus-cyan/5 rounded-none-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="text-[10px] font-mono text-nexus-cyan mb-1">{selectedEntity.group}</div>
                <h2 className="text-xl font-display font-medium text-zinc-100 break-all">{selectedEntity.label}</h2>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 border border-zinc-300 py-1.5 rounded-none text-xs transition-colors flex items-center justify-center gap-2" onClick={() => window.open(`/entities/${selectedEntity.id}`, "_blank")}>
                    <Eye /> Full Profile
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-5 space-y-6">
                <div className="border border-nexus-amber/20 bg-nexus-amber/5 rounded-none p-4">
                  <h3 className="text-xs font-mono text-nexus-amber flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <ShieldWarning weight="fill" /> Investigative Rationale
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-zinc-500 font-mono text-[10px] uppercase mb-1">Why Surfaced</div>
                      <div className="text-zinc-700">Activity increased significantly over baseline. Multiple shared identifiers.</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-5 nexus-border-b bg-zinc-100">
                <h2 className="text-sm font-mono text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                  <Lightning weight="fill" className="text-nexus-cyan" /> Action Plan
                </h2>
              </div>
              <div className="flex-1 p-5 overflow-auto space-y-4">
                {investigation.actionItems?.map((action: any) => (
                  <div key={action.id} className="bg-zinc-50 border border-zinc-200 rounded-none p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-zinc-900">{action.title}</h3>
                      <span className={clsx(
                        "px-2 py-0.5 rounded-none font-mono text-[10px] border uppercase shrink-0 ml-2",
                        action.status === 'PENDING' ? "badge-warning" : 
                        action.status === 'DRAFT' ? "bg-zinc-800 text-zinc-600 border-zinc-700" :
                        "badge-info"
                      )}>
                        {action.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mb-3">{action.reason}</p>
                    <button className={clsx(
                      "w-full py-1.5 rounded-none text-xs transition-colors flex items-center justify-center gap-2 border",
                      action.status === 'PENDING' ? "badge-info hover:bg-nexus-cyan/20" : "bg-white/5 text-zinc-700 border-zinc-300 hover:bg-white/10"
                    )}>
                      {action.type === 'FREEZE' ? 'Execute simulated preservation' : 
                       action.type === 'BANK_REQUEST' ? 'Review & Draft Request' : 'Process Action'}
                    </button>
                  </div>
                ))}
                
                <div className="mt-8 border-t border-zinc-200 pt-6 space-y-3">
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Escalation & Export</h3>
                  <button className="w-full bg-zinc-50 border border-zinc-300 hover:bg-white/5 py-2.5 rounded-none text-sm transition-colors flex items-center justify-center gap-2">
                    <DownloadSimple /> Export PDF Report
                  </button>
                  <button className="w-full bg-nexus-amber/10 border border-nexus-amber/20 text-nexus-amber hover:bg-nexus-amber/20 py-2.5 rounded-none text-sm transition-colors flex items-center justify-center gap-2">
                    <ShieldWarning weight="fill" /> Prepare Referral Package
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
