"use client";

import { useEffect, useState } from "react";
import { WarningOctagon, BellRinging, ChartLineUp, Users, Folder, ShieldWarning, HandCoins } from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    fetch("/api/alerts").then(r => r.json()).then(setAlerts);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <div className={clsx("flex-1 p-8 flex flex-col transition-[margin] duration-300", selectedAlert ? "mr-[450px]" : "mr-0")}>
        <header className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Alerts</h1>
          <p className="text-zinc-300 font-mono text-sm">SYSTEM-GENERATED INTELLIGENCE EVENTS</p>
        </header>

        <div className="flex-1 overflow-auto space-y-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              onClick={() => setSelectedAlert(alert)}
              className={clsx(
                "bg-zinc-900/60 border border-white/5 rounded-[2rem] p-5 flex items-start gap-5 transition-colors cursor-pointer group",
                selectedAlert?.id === alert.id ? "border-nexus-cyan/50 " : "hover:"
              )}
            >
              <div className="mt-1 shrink-0">
                {alert.severity === 'CRITICAL' ? (
                  <WarningOctagon weight="fill" className="text-nexus-red text-2xl group-hover:scale-110 transition-transform" />
                ) : (
                  <BellRinging weight="fill" className="text-nexus-amber text-2xl group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg text-white group-hover:text-nexus-cyan transition-colors">{alert.title}</h3>
                  <span className={clsx(
                    "font-mono text-[10px] uppercase px-2 py-0.5 rounded-2xl border",
                    alert.status === 'UNREAD' ? "badge-warning" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                  )}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm mb-4">{alert.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span>{new Date(alert.createdAt).toISOString().replace('T', ' ').substring(0, 19)}</span>
                  <span>•</span>
                  <span className="uppercase text-zinc-300">{alert.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      <div className={clsx(
        "fixed right-0 top-0 bottom-0 w-[450px] glass rounded-l-[2.5rem] border-l border-white/10 shadow-md transition-transform duration-300 z-50 flex flex-col",
        selectedAlert ? "translate-x-0" : "translate-x-full"
      )}>
        {selectedAlert && (
          <>
            <div className="p-6 border-b border-white/10  relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-nexus-red/10 rounded-2xl-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
              <div className="text-[10px] font-mono text-nexus-red mb-2">{selectedAlert.id}</div>
              <h2 className="text-2xl font-display font-medium text-white leading-tight mb-2">{selectedAlert.title}</h2>
              <div className="flex gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 bg-nexus-red/10 text-nexus-red border border-nexus-red/20 rounded-2xl">
                  {selectedAlert.severity}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-2xl">
                  {selectedAlert.status}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-8">
              <section>
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Why was this triggered?</h3>
                <div className="text-sm text-zinc-300 leading-relaxed p-4  border border-white/5 rounded-2xl">
                  Activity increased 3.4× above the synthetic 14-day baseline. Overlapping platform identifiers indicate coordinated operational burst.
                </div>
              </section>

              <section>
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Threat Assessment</h3>
                <div className="text-sm text-zinc-300 space-y-2">
                  <p><strong className="text-zinc-200">Confidence:</strong> High (94%)</p>
                  <p><strong className="text-zinc-200">Potential Threat:</strong> Elevated transaction velocity suggests illicit marketplace liquidation or operational rotation.</p>
                  <p><strong className="text-zinc-200">Uncertainty:</strong> Requires verification of synthetic financial off-ramps.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Related Entities</h3>
                {selectedAlert.entityId ? (
                  <Link href={`/entities/${selectedAlert.entityId}`} className="flex items-center gap-3 p-3  hover:bg-zinc-700/50 border border-white/5 rounded-2xl transition-colors group">
                    <Users className="text-zinc-400 group-hover:text-nexus-cyan" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-nexus-cyan">Target Actor Found</div>
                      <div className="text-xs font-mono text-zinc-400">View Full Profile →</div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-sm text-zinc-400 italic">No direct entity linkage identified.</div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Recommended Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3  hover:bg-zinc-700/50 border border-white/5 rounded-2xl text-sm transition-colors flex items-center gap-3">
                    <Folder className="text-nexus-cyan" /> Create Investigation Case
                  </button>
                  <button className="w-full text-left p-3  hover:bg-zinc-700/50 border border-white/5 rounded-2xl text-sm transition-colors flex items-center gap-3">
                    <HandCoins className="text-nexus-amber" /> Inspect linked financial identifiers
                  </button>
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t border-white/10  flex gap-3">
              <button className="flex-1 btn-gov py-2 rounded-2xl text-sm font-medium hover:bg-cyan-400 transition-colors">
                Acknowledge
              </button>
              <button className="flex-1 bg-zinc-800/20 text-zinc-300 py-2 rounded-2xl text-sm hover:bg-zinc-800/40 border border-white/10 transition-colors">
                Dismiss
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
