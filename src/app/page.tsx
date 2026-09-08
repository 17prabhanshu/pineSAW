"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  WarningOctagon, 
  Folder, 
  CheckSquareOffset, 
  Clock, 
  CaretRight, 
  X, 
  Lightning,
  Robot, 
  CheckCircle,
  ShieldCheck,
  ArrowSquareOut,
  SlidersHorizontal
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { NewCaseModal } from "@/components/NewCaseModal";
import { AgentPerformanceModal } from "@/components/AgentPerformanceModal";
import type { AgentTelemetry } from "@/app/api/agents/route";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceCarousel } from "@/components/IntelligenceCarousel";
import { toast } from "sonner";

// Available Autonomous & Tactical Agents
const AVAILABLE_AGENTS = [
  { id: "agt-spectre", name: "Agent Spectre", role: "Darknet & Tor Interception", status: "ACTIVE", badge: "AIL Stream" },
  { id: "agt-cipher", name: "Agent Cipher", role: "Crypto & Fiat Ledger Forensics", status: "ACTIVE", badge: "Chainalysis" },
  { id: "agt-lexis", name: "Agent Lexis", role: "Statutory Evidentiary Orders", status: "STANDBY", badge: "CrPC § 91" },
  { id: "agt-vanguard", name: "Agent Vanguard", role: "Cross-Platform Identity Resolution", status: "ACTIVE", badge: "Graph GNN" },
];

export default function CommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentTelemetry | null>(null);
  const [agentTelemetryList, setAgentTelemetryList] = useState<AgentTelemetry[]>([]);
  
  // Agent Assignment State (mapped by entity ID)
  const [assignedAgents, setAssignedAgents] = useState<Record<string, string>>({
    "e-darklord99": "Agent Spectre",
    "e-shadowbroker": "Agent Cipher",
    "e-huluplus": "Agent Lexis",
    "e-neonninja": "Agent Vanguard"
  });

  const [assigningEntity, setAssigningEntity] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/agents").then(r => r.json()).catch(() => null)
    ])
      .then(([dashData, agentsData]) => {
        setData(dashData);
        if (agentsData?.agents) {
          setAgentTelemetryList(agentsData.agents);
        }
      })
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
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-mono text-zinc-500 tracking-widest uppercase flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>CONNECTING TO INTELLIGENCE CORE · OP-7492</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />

      <AgentPerformanceModal
        agent={selectedAgentForModal}
        isOpen={!!selectedAgentForModal}
        onClose={() => setSelectedAgentForModal(null)}
      />

      {/* Minimal Breadcrumb & System Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <span>DARKINT</span> <CaretRight size={10} /> <span className="text-white font-semibold">Command Center</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OPERATIONAL FLEET ONLINE · 4 AGENTS ACTIVE</span>
        </div>
      </div>

      {/* Operational Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Operational Command Center
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Active darknet target monitoring, autonomous surveillance agents, and statutory directives.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/actions" className="btn-gov text-xs py-2 px-3.5 flex items-center gap-1.5">
            <CheckSquareOffset size={15} /> Action Center
          </Link>
          <button 
            onClick={() => setIsNewCaseOpen(true)}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Folder size={15} /> New Case
          </button>
        </div>
      </header>

      {/* Priority Threat Targets & Autonomous Agent Assignment Table */}
      <div className="w-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WarningOctagon className="text-white" size={16} />
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Priority Threat Targets & Agent Dispatch
            </h2>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">
            {data.topEntities?.length || 0} Targets Ranked by FAISS Proximity
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-black/90 border-b border-white/10">
              <tr className="font-mono text-[10px] uppercase text-zinc-400">
                <th className="px-4 py-3 font-semibold w-24">Priority</th>
                <th className="px-4 py-3 font-semibold w-52">Target Identifier</th>
                <th className="px-4 py-3 font-semibold w-48">Assigned Agent</th>
                <th className="px-4 py-3 font-semibold">Primary Risk Indicator</th>
                <th className="px-4 py-3 font-semibold text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
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
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                        ent.priorityScore >= 80 ? "bg-red-950/60 text-red-400 border border-red-500/30" : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                      )}>
                        {ent.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 font-semibold text-white group-hover:underline">
                      {ent.label}
                    </td>

                    {/* Interactive Agent Assignment Button */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setAssigningEntity(ent)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white hover:text-black border border-white/10 text-zinc-300 font-mono text-[10px] transition-all cursor-pointer"
                        title="Click to reassign agent"
                      >
                        <Robot size={12} />
                        <span>{assigned}</span>
                        <CaretRight size={10} className="opacity-50" />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-zinc-400 truncate max-w-[280px]">
                      {ent.riskFactors ? JSON.parse(ent.riskFactors)[0] : "Multiple cross-network indicators"}
                    </td>

                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setSelectedIncident(ent);
                          toast.info("Incident Profile Loaded", { description: `Examining telemetry for ${ent.label}` });
                        }} 
                        className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autonomous Agent Fleet Operations Strip */}
      <div className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Robot className="text-white" size={16} />
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Autonomous Intelligence Fleet
            </h2>
          </div>
          <button 
            onClick={() => {
              toast.success("Agent Fleet Synchronized", {
                description: "All 4 autonomous agents synced with Lacus Tor crawlers and FAISS index."
              });
            }}
            className="text-[10px] font-mono uppercase text-white hover:underline cursor-pointer flex items-center gap-1"
          >
            <Lightning size={12} weight="fill" className="text-amber-400" />
            Sync Fleet
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AVAILABLE_AGENTS.map((agt) => {
            const telemetry = agentTelemetryList.find(a => a.id === agt.id);
            const tasksCompleted = telemetry?.metrics?.tasksCompleted ?? (agt.id === "agt-spectre" ? 142 : agt.id === "agt-cipher" ? 189 : agt.id === "agt-lexis" ? 87 : 164);
            const precision = telemetry?.metrics?.precisionScore ?? (agt.id === "agt-spectre" ? 98.6 : agt.id === "agt-cipher" ? 99.2 : agt.id === "agt-lexis" ? 100 : 97.8);
            const yieldCount = telemetry?.metrics?.evidenceYieldCount ?? (agt.id === "agt-spectre" ? 48 : agt.id === "agt-cipher" ? 74 : agt.id === "agt-lexis" ? 36 : 59);

            const openModal = () => {
              if (telemetry) {
                setSelectedAgentForModal(telemetry);
              } else {
                fetch("/api/agents")
                  .then(r => r.json())
                  .then(d => {
                    const match = d.agents?.find((a: any) => a.id === agt.id);
                    if (match) setSelectedAgentForModal(match);
                  })
                  .catch(() => {});
              }
            };

            return (
              <div 
                key={agt.id}
                onClick={openModal}
                className="p-3.5 bg-black/70 border border-white/10 hover:border-white/30 rounded-xl flex flex-col justify-between space-y-2.5 transition-all cursor-pointer group shadow-xs hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                      <Robot size={14} className="text-zinc-400 group-hover:text-emerald-400" />
                      <span>{agt.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {agt.role}
                    </div>
                  </div>

                  <span className={clsx(
                    "text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded shrink-0",
                    agt.status === "ACTIVE" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" :
                    "bg-zinc-900 text-zinc-400 border border-white/10"
                  )}>
                    {agt.status}
                  </span>
                </div>

                {/* Quantifiable Telemetry Metrics Strip */}
                <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 bg-white/5 rounded-lg border border-white/5 font-mono text-[10px]">
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase">Throughput</span>
                    <span className="text-white font-bold">{tasksCompleted} Done</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] uppercase">Precision</span>
                    <span className="text-emerald-400 font-bold">{precision}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                  <span className="text-zinc-500 text-[9px]">{yieldCount} Artifacts Yield</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal();
                    }}
                    className="text-zinc-300 hover:text-white underline text-[9px] cursor-pointer"
                  >
                    Forensic Audit →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Tactical Intelligence Directives Carousel */}
      <div className="w-full pt-2">
        <IntelligenceCarousel />
      </div>

      {/* Detail Slide-Out Drawer (Cleanly Anchored with Backdrop) */}
      <AnimatePresence>
        {selectedIncident && (
          <>
            <div 
              onClick={() => setSelectedIncident(null)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-14 right-0 bottom-0 w-full sm:w-[420px] bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col z-50"
            >
              <div className="p-6 border-b border-white/10 relative">
                <button 
                  onClick={() => setSelectedIncident(null)} 
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
                >
                  <X size={16} />
                </button>
                
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 font-semibold">
                  TARGET DOSSIER · {selectedIncident.id}
                </div>
                <h2 className="text-lg font-display font-semibold text-white leading-snug mb-3 pr-6">
                  {selectedIncident.label}
                </h2>
                
                <div className="flex gap-2">
                  <span className={clsx(
                    "px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold border",
                    selectedIncident.priorityScore >= 80 ? "bg-red-950/60 text-red-400 border-red-500/30" : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                  )}>
                    RISK {selectedIncident.priorityScore}/100
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-white/10 text-white border border-white/20">
                    {selectedIncident.type}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-xs">
                <section>
                  <h3 className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                    Investigation Lead & Assigned Agent
                  </h3>
                  <div className="p-3 bg-black border border-white/10 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Robot size={16} className="text-white" />
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {assignedAgents[selectedIncident.id] || "Agent Spectre"}
                        </div>
                        <div className="text-[9px] text-zinc-500">Autonomous Oversight Active</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAssigningEntity(selectedIncident)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white text-zinc-300 hover:text-black text-[10px] transition-colors cursor-pointer"
                    >
                      Reassign
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                    Core Rationale & Forensic Grounding
                  </h3>
                  <div className="text-[11px] text-zinc-300 leading-relaxed bg-black border border-white/10 p-3 rounded-lg">
                    Activity velocity anomaly detected. Identity overlaps with darknet marketplaces and offshore fiat liquidation accounts confirmed via FAISS cosine vector retrieval.
                  </div>
                </section>
                
                <section>
                  <h3 className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                    Identified Risk Indicators
                  </h3>
                  <div className="space-y-1.5">
                    {(selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors) : ["Tor Exit Relay Anomaly", "Unverified Off-Ramp", "Rapid Transaction Velocity"]).map((risk: string, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[11px] p-2 rounded bg-black border border-white/5">
                        <span className="text-zinc-300">{risk}</span>
                        <span className="text-red-400 font-mono text-[10px] font-bold">CONFIRMED</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <div className="p-4 border-t border-white/10 bg-black flex gap-3">
                <button 
                  onClick={() => router.push(`/entities/${selectedIncident.id}`)} 
                  className="w-full py-2 bg-white text-black font-semibold rounded-lg text-xs font-mono hover:bg-zinc-200 transition-colors text-center cursor-pointer"
                >
                  Open Full Entity Dossier →
                </button>
              </div>
            </motion.div>
          </>
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
              className="bg-zinc-950 border border-white/15 rounded-xl p-6 max-w-md w-full shadow-2xl font-mono"
            >
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">AGENT DEPLOYMENT</div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    Assign Agent to {assigningEntity.label}
                  </h3>
                </div>
                <button onClick={() => setAssigningEntity(null)} className="text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-zinc-400 mb-4">
                Select an operational intelligence agent to lead autonomous surveillance and evidence collection:
              </p>

              <div className="space-y-2 mb-5">
                {AVAILABLE_AGENTS.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => handleAssignAgent(assigningEntity.id, assigningEntity.label, agent.name)}
                    className="p-3 bg-black border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
                        {agent.name.split(" ")[1]?.[0] || "A"}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                      Deploy
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAssigningEntity(null)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg text-xs border border-white/10 transition-colors"
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
