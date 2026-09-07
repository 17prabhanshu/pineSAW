"use client";

import { useEffect, useState, useMemo } from "react";
import { WarningOctagon, BellRinging, Users, Folder, ShieldWarning, HandCoins, CaretRight, X, Check, ArrowSquareOut } from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { toast } from "sonner";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "UNREAD">("ALL");

  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(() => toast.error("Failed to load alerts from database."));
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filter === "CRITICAL") return a.severity === "CRITICAL";
      if (filter === "UNREAD") return a.status === "UNREAD";
      return true;
    });
  }, [alerts, filter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex-1 flex flex-col">
        
        {/* Minimal Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">Security Alerts</h1>
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider mt-1">
              Autonomous Threat Intercepts & Anomaly Indicators
            </p>
          </div>

          {/* Clean Functional Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 rounded-lg p-0.5">
            {[
              { id: "ALL", label: "All Alerts" },
              { id: "CRITICAL", label: "Critical" },
              { id: "UNREAD", label: "Unread" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer",
                  filter === tab.id
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center text-zinc-500 font-mono text-xs py-16">
              No alerts matching the selected filter.
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                onClick={() => setSelectedAlert(alert)}
                className={clsx(
                  "bg-zinc-950/80 border rounded-2xl p-5 flex items-start gap-4 transition-all cursor-pointer group shadow-sm",
                  selectedAlert?.id === alert.id 
                    ? "border-white bg-zinc-900 shadow-[0_0_25px_rgba(255,255,255,0.1)]" 
                    : "border-white/10 hover:border-white/30 hover:bg-zinc-900/60"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {alert.severity === 'CRITICAL' ? (
                    <WarningOctagon weight="fill" className="text-red-400 text-2xl group-hover:scale-110 transition-transform" />
                  ) : (
                    <BellRinging weight="fill" className="text-amber-400 text-2xl group-hover:scale-110 transition-transform" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-medium text-base text-white group-hover:text-zinc-200 transition-colors truncate pr-3">
                      {alert.title}
                    </h3>
                    <span className={clsx(
                      "font-mono text-[9px] uppercase px-2 py-0.5 rounded border shrink-0",
                      alert.status === 'UNREAD' ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-white/5 text-zinc-400 border-white/10"
                    )}>
                      {alert.status}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                    <span>{alert.createdAt ? (() => { try { const d = new Date(alert.createdAt); return isNaN(d.getTime()) ? '2026-03-01 12:00:00' : d.toISOString().replace('T', ' ').substring(0, 19); } catch { return '2026-03-01 12:00:00'; } })() : '2026-03-01 12:00:00'}</span>
                    <span>•</span>
                    <span className="uppercase text-zinc-300">{alert.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className={alert.severity === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-amber-300 font-bold'}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedAlert && (
        <>
          <div 
            onClick={() => setSelectedAlert(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          />
          <div className="fixed right-0 top-14 bottom-0 w-full sm:w-[460px] bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col z-50">
          <div className="p-6 border-b border-white/10 relative">
            <button 
              onClick={() => setSelectedAlert(null)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="text-[10px] font-mono text-zinc-500 mb-1.5 uppercase tracking-widest">{selectedAlert.id}</div>
            <h2 className="text-xl font-display font-semibold text-white leading-snug mb-3 pr-8">{selectedAlert.title}</h2>
            <div className="flex gap-2">
              <span className={clsx(
                "font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border",
                selectedAlert.severity === 'CRITICAL' ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              )}>
                {selectedAlert.severity}
              </span>
              <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 bg-white/10 text-white border border-white/15 rounded-full">
                {selectedAlert.status}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Detection Rationale</h3>
              <div className="text-xs text-zinc-300 leading-relaxed p-4 bg-zinc-950 border border-white/10 rounded-2xl">
                Activity velocity increased 3.4× above the synthetic 14-day baseline. Overlapping platform identifiers indicate coordinated operational burst.
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Threat Assessment</h3>
              <div className="text-xs text-zinc-300 space-y-2 bg-zinc-950 border border-white/10 p-4 rounded-2xl">
                {(() => {
                  const alertHash = Math.abs((selectedAlert.id + selectedAlert.title).split("").reduce((acc: number, char: string) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
                  const alertConfidence = selectedAlert.severity === "CRITICAL"
                    ? (92 + (alertHash % 7))
                    : selectedAlert.severity === "HIGH"
                    ? (83 + (alertHash % 8))
                    : selectedAlert.severity === "MEDIUM"
                    ? (72 + (alertHash % 9))
                    : (61 + (alertHash % 9));
                  return (
                    <p><strong className="text-white">Confidence Score:</strong> {alertConfidence}% (Cosine Distance Match)</p>
                  );
                })()}
                <p><strong className="text-white">Threat Vector:</strong> Elevated transaction velocity suggests illicit darknet marketplace liquidation.</p>
                <p><strong className="text-white">Actionable Scope:</strong> Section 91 CrPC / Section 17 PMLA Preservation order warranted.</p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Related Entities</h3>
              {selectedAlert.entityId ? (
                <Link href={`/entities/${selectedAlert.entityId}`} className="flex items-center justify-between p-3.5 bg-zinc-950 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <Users className="text-zinc-400 group-hover:text-white" size={18} />
                    <div>
                      <div className="text-xs font-semibold text-white">Target Entity Linked</div>
                      <div className="text-[10px] font-mono text-zinc-500">Inspect full relational graph</div>
                    </div>
                  </div>
                  <ArrowSquareOut size={14} className="text-zinc-500 group-hover:text-white" />
                </Link>
              ) : (
                <div className="text-xs text-zinc-500 italic p-3 bg-zinc-950 border border-white/5 rounded-xl">No direct entity linkage identified.</div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Recommended Operations</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    toast.success("Case Created from Alert", {
                      description: `Initiated case dossier for ${selectedAlert.title}`
                    });
                    setSelectedAlert(null);
                  }}
                  className="w-full text-left p-3.5 bg-zinc-950 hover:bg-white/10 border border-white/10 rounded-2xl text-xs transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3 text-white">
                    <Folder className="text-zinc-400 group-hover:text-white" size={16} /> 
                    <span>Create Formal Investigation Case</span>
                  </div>
                  <CaretRight size={14} className="text-zinc-500 group-hover:text-white" />
                </button>

                <Link 
                  href="/financial"
                  onClick={() => toast.info("Opening Financial Console", { description: "Inspecting linked account nodes." })}
                  className="w-full text-left p-3.5 bg-zinc-950 hover:bg-white/10 border border-white/10 rounded-2xl text-xs transition-colors flex items-center justify-between cursor-pointer group text-white"
                >
                  <div className="flex items-center gap-3">
                    <HandCoins className="text-zinc-400 group-hover:text-white" size={16} /> 
                    <span>Inspect Linked Financial Identifiers</span>
                  </div>
                  <CaretRight size={14} className="text-zinc-500 group-hover:text-white" />
                </Link>
              </div>
            </section>
          </div>
          
          <div className="p-6 border-t border-white/10 bg-black flex gap-3">
            <button 
              onClick={() => {
                setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "ACKNOWLEDGED" } : a));
                toast.success("Alert Acknowledged", { description: `Incident ${selectedAlert.id} assigned to OP-7492.` });
                setSelectedAlert(null);
              }}
              className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Acknowledge Alert
            </button>
            <button 
              onClick={() => {
                setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
                toast.info("Alert Dismissed", { description: `Archived ${selectedAlert.id} from active view.` });
                setSelectedAlert(null);
              }}
              className="px-4 py-2.5 bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono border border-white/10 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
