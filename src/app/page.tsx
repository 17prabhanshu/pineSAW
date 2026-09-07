"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  WarningOctagon, 
  Folder, 
  CheckSquareOffset, 
  FileText, 
  MagnifyingGlass, 
  Funnel, 
  Clock, 
  CaretRight, 
  X, 
  Lightning,
  UserGear,
  Robot,
  CheckCircle,
  ShieldCheck,
  ArrowSquareOut
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { NewCaseModal } from "@/components/NewCaseModal";
import { motion, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence } from "framer-motion";
import { CyberText } from "@/components/CyberText";
import { IntelligenceCarousel } from "@/components/IntelligenceCarousel";
import { toast } from "sonner";

// Available Autonomous & Tactical Agents
const AVAILABLE_AGENTS = [
  { id: "agt-spectre", name: "Agent Spectre", role: "Darknet & Tor Interception", status: "ACTIVE", badge: "AIL Stream" },
  { id: "agt-cipher", name: "Agent Cipher", role: "Crypto & Fiat Ledger Forensics", status: "ACTIVE", badge: "Chainalysis" },
  { id: "agt-lexis", name: "Agent Lexis", role: "Statutory Evidentiary Orders", status: "STANDBY", badge: "CrPC § 91" },
  { id: "agt-vanguard", name: "Agent Vanguard", role: "Cross-Platform Identity Resolution", status: "ACTIVE", badge: "Graph GNN" },
  { id: "op-7492", name: "Investigator OP-7492", role: "Lead Human Officer (Cyber Cell)", status: "LEAD", badge: "Authorized" }
];

export default function CommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  
  // Agent Assignment State (mapped by entity ID)
  const [assignedAgents, setAssignedAgents] = useState<Record<string, string>>({
    "e-darklord99": "Agent Spectre",
    "e-shadowbroker": "Agent Cipher",
    "e-huluplus": "Agent Lexis",
    "e-neonninja": "Agent Vanguard"
  });

  const [assigningEntity, setAssigningEntity] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(setData)
      .catch(() => {
        toast.error("Failed to load dashboard metrics.");
      });
  }, []);

  const handleAssignAgent = (entityId: string, entityLabel: string, agentName: string) => {
    setAssignedAgents(prev => ({
      ...prev,
      [entityId]: agentName
    }));
    setAssigningEntity(null);
    toast.success(`Agent Assigned: ${agentName}`, {
      description: `Deployed to lead forensic investigation on ${entityLabel}.`
    });
  };

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="text-xs font-mono text-zinc-500 tracking-widest uppercase flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>INITIALIZING COMMAND TERMINAL · OP-7492</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className={clsx("flex-1 overflow-y-auto flex flex-col p-6 md:p-8 transition-all duration-300", selectedIncident ? "mr-0 lg:mr-[420px]" : "")}>
        
        {/* Minimal Breadcrumb & System Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>DARKINT</span> <CaretRight size={10} /> <span className="text-white font-semibold">Command Center</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM NOMINAL · 4 AGENTS DEPLOYED</span>
          </div>
        </div>

        {/* Minimal Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Command Overview
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Active operational monitoring, tactical directives, and autonomous agent dispatch.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/actions" className="btn-gov text-xs py-2 px-4 flex items-center gap-2">
              <CheckSquareOffset size={16} /> Action Center
            </Link>
            <button 
              onClick={() => setIsNewCaseOpen(true)}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Folder size={16} /> New Case
            </button>
          </div>
        </header>

        {/* Streamlined Executive KPI Strip (Clean & Minimal 4-Metric Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Active Cases</span>
            <div className="text-2xl font-display font-light text-white mt-1">
              {data.metrics?.investigationCount || data.activeInvestigations || "06"}
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Critical Alerts</span>
            <div className="text-2xl font-display font-bold text-red-400 mt-1">
              {data.recentAlerts?.filter((a: any) => a.severity === 'CRITICAL').length || "03"}
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Monitored Entities</span>
            <div className="text-2xl font-display font-semibold text-white mt-1">
              {data.metrics?.entityCount || data.totalEntities || "42"}
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Autonomous Agents</span>
            <div className="text-2xl font-display font-semibold text-emerald-400 mt-1">
              4 Deployed
            </div>
          </div>
        </div>

        {/* Live Intelligence & Tactical Threat Dispatch Carousel */}
        <IntelligenceCarousel />

        {/* Main Operational Columns */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Column: Priority Incidents & Agent Assignment Table */}
          <div className="flex-[2] flex flex-col min-h-0 bg-zinc-950/80 border border-white/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <WarningOctagon className="text-white" size={16} />
                <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Priority Incidents & Agent Assignment
                </h2>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">
                {data.topEntities?.length || 0} Targets Ranked
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-black/80 sticky top-0 z-10 border-b border-white/10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-400">
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Target Actor</th>
                    <th className="px-4 py-3 font-semibold">Assigned Agent</th>
                    <th className="px-4 py-3 font-semibold">Primary Risk Indicator</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.topEntities?.slice(0, 8).map((ent: any) => {
                    const assigned = assignedAgents[ent.id] || "Agent Spectre";
                    const isSelected = selectedIncident?.id === ent.id;

                    return (
                      <tr 
                        key={ent.id} 
                        onClick={() => setSelectedIncident(ent)}
                        className={clsx(
                          "transition-colors cursor-pointer group",
                          isSelected ? "bg-white/10 border-l-2 border-l-white" : "hover:bg-white/5 border-l-2 border-l-transparent"
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase",
                            ent.priorityScore >= 80 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          )}>
                            {ent.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-white group-hover:text-zinc-200">
                          {ent.label}
                        </td>

                        {/* Interactive Agent Assignment Button */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setAssigningEntity(ent)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white font-mono text-[10px] transition-all cursor-pointer"
                            title="Click to reassign agent"
                          >
                            <Robot size={12} className="text-zinc-400" />
                            <span>{assigned}</span>
                            <CaretRight size={10} className="text-zinc-500" />
                          </button>
                        </td>

                        <td className="px-4 py-3 text-zinc-400 truncate max-w-[220px]">
                          {ent.riskFactors ? JSON.parse(ent.riskFactors)[0] : "Multiple cross-network indicators"}
                        </td>

                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setSelectedIncident(ent);
                              toast.info("Incident Profile Loaded", { description: `Examining telemetry for ${ent.label}` });
                            }} 
                            className="text-[10px] font-mono font-semibold uppercase px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
                          >
                            Investigate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Right Column: Autonomous Intelligence Agents Operations Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/80 border border-white/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Robot className="text-white" size={16} />
                <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Autonomous Agent Fleet
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">4 / 4 ONLINE</span>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {AVAILABLE_AGENTS.map((agt) => (
                <div 
                  key={agt.id}
                  className="p-3 bg-black/60 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0">
                      {agt.name.split(" ")[1]?.[0] || "A"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{agt.name}</span>
                        <span className="text-[8px] font-mono bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
                          {agt.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {agt.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={clsx(
                      "text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border",
                      agt.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      agt.status === "LEAD" ? "bg-white/10 text-white border-white/20" :
                      "bg-zinc-800 text-zinc-400 border-white/5"
                    )}>
                      {agt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500">Autonomous Execution Queue</span>
              <button 
                onClick={() => {
                  toast.success("Agent Sync Triggered", {
                    description: "All 4 autonomous agents dispatched for background telemetry scan."
                  });
                }}
                className="text-[10px] font-mono uppercase tracking-wider text-white underline hover:text-zinc-300 cursor-pointer"
              >
                Sync All Agents →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Detail Slide-Out Drawer */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div 
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-black/95 backdrop-blur-2xl border-l border-white/15 shadow-2xl flex flex-col z-40 pt-28"
          >
            <div className="p-6 border-b border-white/10 relative">
              <button 
                onClick={() => setSelectedIncident(null)} 
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-semibold">
                INCIDENT DOSSIER · {selectedIncident.id}
              </div>
              <h2 className="text-xl font-display font-semibold text-white leading-snug mb-3 pr-8">
                {selectedIncident.label}
              </h2>
              
              <div className="flex gap-2">
                <span className={clsx(
                  "px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border",
                  selectedIncident.priorityScore >= 80 ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                )}>
                  RISK SCORE: {selectedIncident.priorityScore}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-white/10 text-white border border-white/20">
                  {selectedIncident.type}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">
                  Investigation Lead & Assigned Agent
                </h3>
                <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Robot size={18} className="text-white" />
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {assignedAgents[selectedIncident.id] || "Agent Spectre"}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">Autonomous Oversight Active</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningEntity(selectedIncident)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white text-zinc-300 hover:text-black font-mono text-[10px] transition-colors cursor-pointer"
                  >
                    Reassign
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">
                  Why Flagged by Intelligence Core
                </h3>
                <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 border border-white/10 p-4 rounded-2xl">
                  Activity velocity anomaly detected. Identity overlaps with darknet marketplaces and offshore fiat liquidation accounts confirmed via dense vector cosine matching.
                </div>
              </section>
              
              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">
                  Identified Risk Indicators
                </h3>
                <div className="space-y-1.5">
                  {(selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors) : ["Tor Exit Relay Anomaly", "Unverified Off-Ramp", "Rapid Transaction Velocity"]).map((risk: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl border border-white/5 bg-zinc-950">
                      <span className="text-zinc-300">{risk}</span>
                      <span className="text-red-400 font-mono text-[10px] font-bold">CONFIRMED</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-black flex gap-3">
              <button 
                onClick={() => router.push(`/entities/${selectedIncident.id}`)} 
                className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl text-xs font-mono hover:bg-zinc-200 transition-colors text-center cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                Open Full Entity Dossier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASSIGN AGENT MODAL */}
      <AnimatePresence>
        {assigningEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">AGENT DEPLOYMENT</div>
                  <h3 className="text-lg font-display font-semibold text-white mt-0.5">
                    Assign Agent to {assigningEntity.label}
                  </h3>
                </div>
                <button onClick={() => setAssigningEntity(null)} className="text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-zinc-400 mb-4">
                Select an operational intelligence agent to lead autonomous surveillance, subpoena drafting, and evidence collection:
              </p>

              <div className="space-y-2 mb-6">
                {AVAILABLE_AGENTS.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => handleAssignAgent(assigningEntity.id, assigningEntity.label, agent.name)}
                    className="p-3 bg-zinc-900/60 border border-white/10 hover:border-white/40 hover:bg-white/10 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xs font-bold text-white">
                        {agent.name.split(" ")[1]?.[0] || "A"}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-white">
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10 group-hover:bg-white group-hover:text-black">
                      Deploy
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAssigningEntity(null)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono border border-white/10 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
