"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldWarning, IdentificationCard, Link as LinkIcon, Graph, TrendUp, Folder, FileText, NotePencil, WarningOctagon, Clock, MapPin, MagnifyingGlass, CaretRight, Plus, Gavel, HandCoins, ArrowRight } from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { NetworkGraph } from "@/components/NetworkGraph";

export default function EntityIntelligence() {
  const params = useParams();
  const [id, setId] = useState<string>("");
  const [entity, setEntity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    // resolve params promise safely for Next 15
    const resolveParams = async () => {
      const p = await params;
      setId(p.id as string);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/entities/${id}`).then(r => r.json()).then(setEntity);
  }, [id]);

  if (!entity) return <div className="p-8 font-mono text-zinc-400 text-sm">LOADING ENTITY INTELLIGENCE...</div>;

  const tabs = ["OVERVIEW", "IDENTIFIERS", "ACTIVITY", "RELATIONSHIPS", "FINANCIAL", "EVIDENCE", "ALERTS", "INVESTIGATIONS", "LEGAL", "ACTIONS"];

  const handleNoteSubmit = () => {
    if (!noteText.trim()) return;
    alert("Simulated: Note added to entity.");
    setNoteText("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <header className="px-8 pt-8 pb-4 shrink-0 bg-zinc-900/50 nexus-border-b z-10 relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-2xl bg-zinc-800/30 text-zinc-300 font-mono text-[10px] border border-zinc-700">{entity.type}</span>
              <span className={clsx(
                "px-2 py-0.5 rounded-2xl font-mono text-[10px] border",
                entity.priorityScore >= 80 ? "badge-critical" : 
                entity.priorityScore >= 50 ? "badge-warning" : 
                "badge-info"
              )}>
                PRIORITY {entity.priorityScore}
              </span>
              <span className="px-2 py-0.5 rounded-2xl glass text-zinc-400 font-mono text-[10px] border border-zinc-800">
                CONFIDENCE {(entity.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">{entity.label}</h1>
            <p className="text-zinc-400 font-mono text-xs flex gap-4">
              <span>ID: {entity.id}</span>
              <span>FIRST SEEN: {new Date(entity.createdAt).toISOString().split('T')[0]}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-zinc-800/30 hover:bg-zinc-700/50 border border-white/10 px-4 py-2 rounded-2xl text-sm transition-colors flex items-center gap-2">
              <Folder weight="fill" /> Add to Case
            </button>
            <button className="btn-gov px-4 py-2 rounded-2xl font-medium text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
              <MagnifyingGlass weight="bold" /> Investigate
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-white/5 overflow-x-auto no-scrollbar pb-[-1px]">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-2 text-xs font-mono tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab ? "border-nexus-cyan text-white" : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-white/10"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-zinc-900/50">
        
        {activeTab === "OVERVIEW" && (
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              {/* Rationale Panel */}
              <div className="bg-zinc-900/60 border-l-2 border-l-nexus-amber border border-white/5 rounded-[2rem] p-5">
                <h2 className="text-sm font-mono text-nexus-amber flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <ShieldWarning weight="fill" /> Risk Assessment
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-zinc-400 font-mono text-[10px] uppercase mb-1">Risk Summary</div>
                    <div className="text-sm text-zinc-200 leading-relaxed">
                      Entity flagged due to multiple independent observations showing overlapping identifiers with high-priority illicit actors. Recent activity spike is highly anomalous relative to baseline.
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 font-mono text-[10px] uppercase mb-2">Score Breakdown</div>
                    <div className="space-y-2">
                      {entity.riskFactors ? JSON.parse(entity.riskFactors).map((risk: string, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-zinc-800/30 px-3 py-2 rounded-2xl">
                          <span className="text-zinc-300">{risk}</span>
                          <span className="text-nexus-amber font-mono text-xs">+{(entity.priorityScore / JSON.parse(entity.riskFactors).length).toFixed(0)}</span>
                        </div>
                      )) : <div className="text-sm text-zinc-400 italic">No specific risk components flagged.</div>}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 font-mono text-[10px] uppercase mb-1">Analyst Interpretation & Next Steps</div>
                    <p className="text-sm text-zinc-300 mb-2">Confidence in association is high ({(entity.confidence*100).toFixed(0)}%). Recommend verifying financial identifiers to corroborate link.</p>
                    <button className="text-xs font-mono text-nexus-cyan flex items-center gap-1 hover:underline">
                      Generate Bank Information Request <CaretRight />
                    </button>
                  </div>
                </div>
              </div>

              {/* Linked Investigations */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Folder className="text-zinc-300" /> Active Investigations ({entity.investigations?.length || 0})
                  </h2>
                </div>
                <div className="space-y-2">
                  {entity.investigations?.length > 0 ? entity.investigations.map((inv: any) => (
                    <Link key={inv.investigation.id} href={`/investigations/${inv.investigation.id}`} className="flex justify-between items-center bg-zinc-800/30 px-4 py-3 rounded-2xl hover:bg-zinc-700/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Folder weight="fill" className="text-zinc-400 group-hover:text-nexus-cyan" />
                        <div>
                          <div className="text-sm font-medium text-white">{inv.investigation.title}</div>
                          <div className="text-xs font-mono text-zinc-400 mt-0.5">{inv.investigation.caseId}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-2xl bg-zinc-800 text-zinc-300 font-mono text-[10px] uppercase border border-zinc-700">
                        {inv.investigation.status}
                      </span>
                    </Link>
                  )) : <div className="text-sm text-zinc-400 py-4 text-center">Entity is not currently part of an active investigation.</div>}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Properties */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5">
                <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <IdentificationCard className="text-zinc-300" /> Key Identifiers
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Label</span>
                    <span className="font-mono text-white">{entity.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Type</span>
                    <span className="font-mono text-white">{entity.type}</span>
                  </div>
                  {entity.sourceRelations.slice(0,3).map((rel: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <LinkIcon size={12}/> {rel.type}
                      </span>
                      <Link href={`/entities/${rel.target.id}`} className="font-mono text-nexus-cyan hover:underline truncate max-w-[150px] text-right">
                        {rel.target.label}
                      </Link>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab("IDENTIFIERS")} className="text-xs font-mono text-zinc-300 hover:text-white mt-2 flex items-center gap-1">
                    View all identifiers <ArrowRight />
                  </button>
                </div>
              </div>

              {/* Analyst Notes */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] flex flex-col">
                <div className="p-4 nexus-border-b bg-zinc-900/50 flex justify-between items-center">
                  <h2 className="text-xs font-mono text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <NotePencil className="text-zinc-300" /> Analyst Notes
                  </h2>
                </div>
                <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
                  {entity.notes?.map((note: any) => (
                    <div key={note.id} className="bg-zinc-800/30 p-3 rounded-2xl text-sm relative">
                      <div className="text-zinc-300 mb-2">{note.content}</div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span>{note.author}</span>
                        <span>{new Date(note.createdAt).toISOString().split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                  {(!entity.notes || entity.notes.length === 0) && (
                    <div className="text-center text-zinc-400 text-xs py-4">No notes recorded.</div>
                  )}
                </div>
                <div className="p-3 nexus-border-t bg-zinc-900/50 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add a note..." 
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    className="flex-1 bg-zinc-900/60 border border-white/10 rounded-2xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-300 focus:outline-none focus:border-nexus-cyan"
                  />
                  <button onClick={handleNoteSubmit} className="glass/10 hover:glass/20 px-3 py-1.5 rounded-2xl text-xs transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "LEGAL" && (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-display font-medium text-white">Legal & Procedural Relevance</h2>
                <p className="text-sm text-zinc-300 mt-1">Potentially applicable legal categories for this entity. <strong className="text-nexus-amber">Requires verification.</strong></p>
              </div>
              <button className="bg-zinc-800/30 border border-white/10 hover:border-white/10 px-4 py-2 rounded-2xl text-sm flex items-center gap-2 transition-colors">
                <Plus /> Add Reference
              </button>
            </div>

            <div className="space-y-4">
              {entity.legalReferences?.length > 0 ? entity.legalReferences.map((ref: any) => (
                <div key={ref.id} className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5 flex gap-5">
                  <div className="mt-1">
                    <Gavel className="text-2xl text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">{ref.jurisdiction}</div>
                        <h3 className="font-medium text-white">{ref.provision}</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-nexus-amber/10 text-nexus-amber border border-nexus-amber/20 rounded-2xl font-mono text-[10px] uppercase">
                        Unverified
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-4">
                      <strong>Relevance:</strong> {ref.reason}
                    </p>
                    <div className="flex gap-3">
                      <button className="text-xs font-mono text-nexus-cyan flex items-center gap-1 hover:underline">
                        Prepare Draft Request
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-12 text-center flex flex-col items-center">
                  <Gavel size={48} className="text-zinc-300 mb-4" />
                  <p className="text-zinc-300 mb-2">No legal provisions currently linked.</p>
                  <button className="text-nexus-cyan text-sm">Add initial legal category for review</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ACTIONS" && (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-display font-medium text-white">Investigator Action Center</h2>
              <p className="text-sm text-zinc-300 mt-1">Recommended and pending simulated actions involving this entity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 hover:border-nexus-cyan/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <HandCoins className="text-3xl text-zinc-400 group-hover:text-nexus-cyan transition-colors" />
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-2xl font-mono text-[10px] uppercase">Draft</span>
                </div>
                <h3 className="font-medium text-white mb-2">Generate Bank Information Request</h3>
                <p className="text-sm text-zinc-300 mb-4">Prepare a simulated draft request targeting linked financial identifiers for verification.</p>
                <button className="w-full bg-zinc-800/30 border border-white/10 group-hover:bg-nexus-cyan group-hover:text-black py-2 rounded-2xl text-sm transition-colors">
                  Prepare Request
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 hover:border-nexus-amber/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <ShieldWarning className="text-3xl text-zinc-400 group-hover:text-nexus-amber transition-colors" />
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-2xl font-mono text-[10px] uppercase">Draft</span>
                </div>
                <h3 className="font-medium text-white mb-2">Prepare Escalation Package</h3>
                <p className="text-sm text-zinc-300 mb-4">Package current evidence and relationship mappings for simulated referral to competent authority.</p>
                <button className="w-full bg-zinc-800/30 border border-white/10 group-hover:bg-nexus-amber group-hover:text-black py-2 rounded-2xl text-sm transition-colors">
                  Draft Escalation
                </button>
              </div>
            </div>

            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-widest mb-4">Logged Actions</h3>
            <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem]">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/30 border-b border-white/10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-400">
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Action Type</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {entity.actionItems?.map((action: any) => (
                    <tr key={action.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className={clsx(
                          "px-2 py-0.5 rounded-2xl font-mono text-[10px] border uppercase",
                          action.status === 'PENDING' ? "badge-warning" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        )}>
                          {action.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-zinc-300">{action.type}</td>
                      <td className="px-5 py-3 text-zinc-300">{action.title}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-zinc-400">{new Date(action.createdAt).toISOString().split('T')[0]}</td>
                    </tr>
                  ))}
                  {(!entity.actionItems || entity.actionItems.length === 0) && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-400 text-sm">No actions recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Fallback for other tabs to show they are functional but empty in this demo */}
        {!["OVERVIEW", "LEGAL", "ACTIONS"].includes(activeTab) && (
          <div className="p-8 flex items-center justify-center h-64 text-zinc-400 text-sm font-mono flex-col gap-4">
            <Folder size={48} className="opacity-50" />
            No records available for {activeTab} in this demo slice.
            <button onClick={() => setActiveTab("OVERVIEW")} className="text-nexus-cyan hover:underline">Return to Overview</button>
          </div>
        )}

      </div>
    </div>
  );
}
