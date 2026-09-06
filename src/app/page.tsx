"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WarningOctagon, Folder, CheckSquareOffset, FileText, MagnifyingGlass, Funnel, Clock, CaretRight, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { NewCaseModal } from "@/components/NewCaseModal";
import { motion, AnimatePresence } from "motion/react";

export default function CommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="p-8 h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-t-2 border-gemini-purple rounded-full animate-spin"></div>
        <div className="text-sm font-mono text-zinc-400 animate-pulse tracking-widest">INITIALIZING SECURE TERMINAL...</div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col min-h-full relative pb-20"
    >
      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6 uppercase tracking-widest">
        <span>pineSAW</span> <CaretRight /> <span className="text-zinc-300">Command Center</span>
      </div>

      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-white tracking-tight mb-2">
            Command Center
          </h1>
          <p className="text-zinc-400 font-medium">Real-time intelligence and threat monitoring</p>
        </div>
        <div className="flex gap-3">
          <Link href="/actions" className="btn-secondary">
            <CheckSquareOffset size={16} className="inline mr-2" /> Action Center
          </Link>
          <button 
            onClick={() => setIsNewCaseOpen(true)}
            className="btn-gov shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <Folder size={16} className="inline mr-2" /> New Case
          </button>
        </div>
      </header>

      {/* Operational Status KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "Active Investigations", value: data.activeInvestigations || "06", color: "text-white" },
          { label: "Critical Alerts", value: data.recentAlerts?.filter((a:any)=>a.severity==='CRITICAL').length || "03", color: "text-red-400" },
          { label: "Pending Actions", value: "11", color: "text-amber-400" },
          { label: "Entities Under Review", value: data.totalEntities || "42", color: "text-white" },
          { label: "Reports Pending", value: "04", color: "text-zinc-300" },
          { label: "Escalations Drafted", value: "02", color: "text-gemini-accent" }
        ].map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="glass rounded-2xl p-5 hover:bg-zinc-800/40 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-zinc-300 transition-colors">{kpi.label}</div>
            <div className={clsx("text-3xl font-display font-semibold", kpi.color)}>{kpi.value.toString().padStart(2, '0')}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Priority Incidents Table */}
        <div className={clsx(
          "flex-1 flex flex-col min-h-0 glass rounded-2xl overflow-hidden shadow-2xl transition-all duration-500",
          selectedIncident ? "w-2/3" : "w-full"
        )}>
          <div className="p-5 border-b border-white/5 bg-[#18181b]/50 backdrop-blur-md flex justify-between items-center">
            <h2 className="text-sm font-display font-semibold text-white tracking-wide flex items-center gap-2">
              <WarningOctagon className="text-red-400" size={18} /> Priority Incidents
            </h2>
            <div className="flex gap-3">
              <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"><Funnel size={14}/> Filter</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#09090b]/80 sticky top-0 z-10 border-b border-white/5 backdrop-blur-md">
                <tr className="font-mono text-[10px] uppercase text-zinc-400">
                  <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Entity</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Risk Score</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Primary Reason</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.topEntities?.slice(0,8).map((ent: any) => (
                  <tr 
                    key={ent.id} 
                    onClick={() => setSelectedIncident(ent)}
                    className={clsx(
                      "transition-all cursor-pointer group hover:bg-zinc-800/30",
                      selectedIncident?.id === ent.id ? "bg-gemini-purple/10" : ""
                    )}
                  >
                    <td className="px-6 py-4">
                      <span className={ent.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                        {ent.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-200 group-hover:text-white transition-colors">{ent.label}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{ent.priorityScore}</td>
                    <td className="px-6 py-4 text-zinc-400 truncate max-w-[200px] text-xs">
                      {ent.riskFactors ? JSON.parse(ent.riskFactors)[0] : "Multiple indicators"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-semibold text-gemini-accent hover:text-white transition-colors">
                        Investigate &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-out Drawer */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-1/3 glass rounded-2xl flex flex-col shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#18181b]/80 to-[#09090b]/80 relative backdrop-blur-xl">
                <button 
                  onClick={() => setSelectedIncident(null)} 
                  className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 p-2 rounded-full"
                >
                  <X size={16}/>
                </button>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">ENTITY INCIDENT</div>
                <h2 className="text-2xl font-display font-semibold text-white mb-4 tracking-tight">{selectedIncident.label}</h2>
                <div className="flex gap-2">
                  <span className={selectedIncident.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                    RISK SCORE: {selectedIncident.priorityScore}
                  </span>
                  <span className="badge-neutral">
                    {selectedIncident.type}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6 space-y-8 custom-scrollbar">
                <section>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold">Why Flagged</h3>
                  <div className="text-sm text-zinc-300 leading-relaxed bg-black/20 border border-white/5 p-4 rounded-xl shadow-inner">
                    Activity spike and cross-platform overlapping identifiers strongly suggest evasion tactics and possible illicit trade facilitation.
                  </div>
                </section>
                
                <section>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold">Risk Contribution</h3>
                  <div className="space-y-2">
                    {(selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors) : ["Suspicious Activity"]).map((risk: string, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                        <span className="text-zinc-300">{risk}</span>
                        <span className="text-amber-400 font-mono font-medium">+{(selectedIncident.priorityScore / (selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors).length : 1)).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold">Pending Actions</h3>
                  <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <div className="text-sm text-zinc-300">Prepare Bank Request</div>
                      <span className="badge-warning">DRAFT</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-zinc-300">Review Financial Links</div>
                      <span className="badge-critical">PENDING</span>
                    </div>
                  </div>
                </section>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-[#18181b]/50 backdrop-blur-md">
                <button onClick={() => router.push(`/investigations/${selectedIncident.id}`)} className="w-full btn-gov shadow-lg">
                  Open Investigation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
