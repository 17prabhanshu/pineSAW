"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HandCoins, ShieldWarning, FileText, CheckCircle, Clock, CaretRight, ShieldChevron, Export, X } from "@phosphor-icons/react";
import clsx from "clsx";

export default function ActionCenter() {
  const [actions, setActions] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  useEffect(() => {
    fetch("/api/actions").then(r => r.json()).then(setActions);
  }, []);

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className={clsx("flex-1 p-8 flex flex-col transition-all duration-150 overflow-auto", selectedAction ? "mr-[450px]" : "")}>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>NEXUS</span> <CaretRight /> <span className="text-zinc-700">Action Center</span>
        </div>

        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-semibold text-zinc-900 tracking-tight">Investigative Actions</h1>
            <p className="text-sm text-zinc-600 mt-1">Simulated operational tasks and procedural preparation workflows.</p>
          </div>
          <div className="flex gap-2">
            {["All", "Critical", "Pending", "Draft", "Completed"].map(f => (
              <button key={f} className="px-3 py-1 bg-zinc-50 hover:bg-zinc-200 border border-zinc-300 rounded-none text-xs font-medium text-zinc-700 transition-colors">
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {actions.map((act, idx) => (
            <div 
              key={act.id}
              onClick={() => setSelectedAction(act)}
              className={clsx(
                "surface-1 nexus-border rounded-none p-5 cursor-pointer group transition-colors",
                selectedAction?.id === act.id ? "border-gov-blue bg-zinc-50" : "hover:bg-zinc-50"
              )}
            >
              <div className="flex gap-6">
                <div className="w-16 shrink-0 border-r border-zinc-200 pr-4 flex flex-col items-center justify-center">
                  <div className="text-[10px] font-mono text-zinc-500 mb-1">0{idx+1}</div>
                  <span className={clsx(
                    "text-[10px] font-mono font-bold tracking-widest uppercase",
                    act.priority === 'CRITICAL' ? 'text-nexus-red' : 
                    act.priority === 'HIGH' ? 'text-nexus-amber' :
                    act.priority === 'MEDIUM' ? 'text-gov-blue' : 'text-zinc-600'
                  )}>
                    {act.priority}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-zinc-900 mb-2 group-hover:text-gov-blue transition-colors">{act.title}</h3>
                  <div className="text-sm text-zinc-600 mb-3">{act.reason}</div>
                  <div className="flex gap-4 text-xs font-mono">
                    {act.Investigation && (
                      <span className="text-zinc-500">CASE: <span className="text-gov-blue">{act.Investigation.caseId}</span></span>
                    )}
                    {act.Entity && (
                      <span className="text-zinc-500">ENTITY: <span className="text-zinc-700">{act.Entity.label}</span></span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-48 flex flex-col items-end justify-between">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-none font-mono text-[10px] uppercase border",
                    act.status === 'PENDING' ? "badge-warning" :
                    act.status === 'READY' ? "badge-info" :
                    "bg-zinc-50 text-zinc-600 border-zinc-300"
                  )}>
                    {act.status}
                  </span>
                  <div className="flex gap-2 mt-4">
                    <button className="btn-secondary">Review</button>
                    <button className="btn-gov">Prepare</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedAction && (
        <div className="absolute top-0 right-0 bottom-0 w-[450px] bg-white border-l border-zinc-300 shadow-md flex flex-col drawer-animate z-30">
          <div className="p-6 border-b border-zinc-300 bg-zinc-100 relative">
            <button onClick={() => setSelectedAction(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"><X size={16}/></button>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">ACTION DETAILS</div>
            <h2 className="text-xl font-display font-medium text-zinc-900 leading-tight mb-4">{selectedAction.title}</h2>
            <div className="flex gap-2">
              <span className={clsx(
                "px-2 py-0.5 rounded-none font-mono text-[10px] uppercase border",
                selectedAction.status === 'PENDING' ? "badge-warning" :
                selectedAction.status === 'READY' ? "badge-info" :
                "bg-zinc-50 text-zinc-600 border-zinc-300"
              )}>
                {selectedAction.status}
              </span>
              <span className="badge-neutral border-zinc-300">PRIORITY: {selectedAction.priority}</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Why This Action?</h3>
              <div className="text-sm text-zinc-700 leading-relaxed p-3 bg-zinc-50 border border-zinc-200 rounded-none">
                {selectedAction.reason}
              </div>
            </section>

            {(selectedAction.Investigation || selectedAction.Entity) && (
              <section className="space-y-3">
                {selectedAction.Investigation && (
                  <div className="flex justify-between items-center p-3 border border-zinc-200 bg-zinc-100 rounded-none">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Case</div>
                      <div className="text-sm text-zinc-900 font-medium">{selectedAction.Investigation.caseId}</div>
                    </div>
                    <Link href={`/investigations/${selectedAction.Investigation.id}`} className="text-xs text-gov-blue font-mono hover:underline">View</Link>
                  </div>
                )}
                {selectedAction.Entity && (
                  <div className="flex justify-between items-center p-3 border border-zinc-200 bg-zinc-100 rounded-none">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Target Entity</div>
                      <div className="text-sm text-zinc-900 font-medium">{selectedAction.Entity.label}</div>
                    </div>
                    <Link href={`/entities/${selectedAction.Entity.id}`} className="text-xs text-gov-blue font-mono hover:underline">View</Link>
                  </div>
                )}
              </section>
            )}

            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Procedural Basis</h3>
              <div className="p-3 border border-nexus-amber/20 bg-nexus-amber/5 rounded-none">
                <div className="flex items-center gap-2 text-nexus-amber text-xs font-mono uppercase tracking-widest mb-1">
                  <ShieldWarning /> Potential Relevance
                </div>
                <div className="text-sm text-zinc-700">Requires review under PMLA / IT Act corresponding provisions.</div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Required Information</h3>
              <ul className="list-disc pl-4 text-sm text-zinc-600 space-y-1">
                <li>Investigation officer details</li>
                <li>Competent authority selection</li>
                <li>Attached evidence references</li>
              </ul>
            </section>

            <section className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Generate Simulated Document</h3>
              <div className="space-y-2 mt-3">
                <button className="w-full btn-gov py-2 flex items-center justify-center gap-2">
                  <FileText size={16} /> Generate Draft {selectedAction.type === 'BANK_REQUEST' ? 'Request' : 'Package'}
                </button>
                <button className="w-full btn-secondary py-2 flex items-center justify-center gap-2">
                  <Export size={16} /> Export PDF
                </button>
              </div>
              <div className="text-center text-[10px] font-mono text-zinc-500 mt-3 uppercase tracking-widest">Simulated / Demo Request</div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
