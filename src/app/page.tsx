"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WarningOctagon, Folder, CheckSquareOffset, FileText, MagnifyingGlass, Funnel, Clock, CaretRight, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { NewCaseModal } from "@/components/NewCaseModal";

export default function CommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm font-mono text-zinc-500">INITIALIZING SECURE TERMINAL...</div>;

  return (
    <div className="flex h-full overflow-hidden relative">
      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />
      <div className={clsx("flex-1 overflow-auto flex flex-col p-8 transition-all duration-150", selectedIncident ? "mr-[400px]" : "")}>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">
          <span>pineSAW</span> <CaretRight /> <span className="text-zinc-700">Command Center</span>
        </div>

        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-semibold text-zinc-900 tracking-tight">Command Center</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/actions" className="btn-gov">
              <CheckSquareOffset size={16} /> Action Center
            </Link>
            <button 
              onClick={() => setIsNewCaseOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Folder size={16} /> New Case
            </button>
          </div>
        </header>

        {/* Operational Status KPI Strip */}
        <div className="bg-white nexus-border rounded-none flex divide-x divide-zinc-300 mb-8 overflow-hidden shadow-sm">
          {[
            { label: "Active Investigations", value: data.activeInvestigations || "06", color: "text-zinc-900" },
            { label: "Critical Alerts", value: data.recentAlerts?.filter((a:any)=>a.severity==='CRITICAL').length || "03", color: "text-nexus-red" },
            { label: "Pending Actions", value: "11", color: "text-nexus-amber" },
            { label: "Entities Under Review", value: data.totalEntities || "42", color: "text-zinc-900" },
            { label: "Reports Pending", value: "04", color: "text-zinc-900" },
            { label: "Escalations Drafted", value: "02", color: "text-gov-blue" }
          ].map((kpi, i) => (
            <div key={i} className="flex-1 p-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-700">{kpi.label}</div>
              <div className={clsx("text-2xl font-display font-semibold", kpi.color)}>{kpi.value.toString().padStart(2, '0')}</div>
            </div>
          ))}
        </div>

        {/* Priority Incidents Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-white nexus-border rounded-none shadow-sm overflow-hidden">
          <div className="p-4 nexus-border-b bg-zinc-100 flex justify-between items-center">
            <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <WarningOctagon className="text-nexus-red" size={16} /> Priority Incidents
            </h2>
            <div className="flex gap-2">
              <button className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-mono"><Funnel size={14}/> Filter</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-100 sticky top-0 z-10 border-b border-zinc-300">
                <tr className="font-mono text-[10px] uppercase text-zinc-500">
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Risk</th>
                  <th className="px-4 py-3 font-semibold">Primary Reason</th>
                  <th className="px-4 py-3 font-semibold">Case</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {data.topEntities?.slice(0,8).map((ent: any) => (
                  <tr 
                    key={ent.id} 
                    onClick={() => setSelectedIncident(ent)}
                    className={clsx(
                      "transition-colors cursor-pointer group",
                      selectedIncident?.id === ent.id ? "bg-gov-blue/10 border-l-2 border-l-gov-blue" : "hover:bg-zinc-50 border-l-2 border-l-transparent"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={ent.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                        {ent.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800 group-hover:text-zinc-900">{ent.label}</td>
                    <td className="px-4 py-3 font-mono text-xs">{ent.priorityScore}</td>
                    <td className="px-4 py-3 text-zinc-600 truncate max-w-[200px] text-xs">
                      {ent.riskFactors ? JSON.parse(ent.riskFactors)[0] : "Multiple indicators"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gov-blue">INV-2026-0042</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs font-semibold text-gov-blue hover:text-zinc-900 transition-colors">
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {selectedIncident && (
        <div className="absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-zinc-300 shadow-md flex flex-col drawer-animate z-30">
          <div className="p-5 border-b border-zinc-300 bg-zinc-100 relative">
            <button onClick={() => setSelectedIncident(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"><X size={16}/></button>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">ENTITY INCIDENT</div>
            <h2 className="text-xl font-display font-semibold text-zinc-900 mb-2">{selectedIncident.label}</h2>
            <div className="flex gap-2">
              <span className={selectedIncident.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                RISK: {selectedIncident.priorityScore}
              </span>
              <span className="badge-neutral">
                {selectedIncident.type}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-5 space-y-6">
            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Why Flagged</h3>
              <div className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-200 p-3 rounded-none">
                Activity spike and cross-platform overlapping identifiers strongly suggest evasion tactics.
              </div>
            </section>
            
            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Risk Contribution</h3>
              <div className="space-y-1">
                {(selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors) : ["Suspicious Activity"]).map((risk: string, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-zinc-100 px-2 py-1.5 rounded-none border border-zinc-200">
                    <span className="text-zinc-700">{risk}</span>
                    <span className="text-nexus-amber font-mono">+{(selectedIncident.priorityScore / (selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors).length : 1)).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Pending Actions</h3>
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-none space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-zinc-800">Prepare Bank Request</div>
                  <span className="badge-warning">DRAFT</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-sm text-zinc-800">Review Financial Links</div>
                  <span className="badge-critical">PENDING</span>
                </div>
              </div>
            </section>
          </div>
          
          <div className="p-5 border-t border-zinc-300 bg-zinc-100 flex gap-2">
            <button onClick={() => router.push(`/entities/${selectedIncident.id}`)} className="btn-gov flex-1 text-center">
              Open Investigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
