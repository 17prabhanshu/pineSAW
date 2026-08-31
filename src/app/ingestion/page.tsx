"use client";

import { useState } from "react";
import { Database, Play, CheckCircle, Warning, Clock } from "@phosphor-icons/react";
import clsx from "clsx";

export default function IngestionSimulator() {
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "COMPLETE">("IDLE");
  const [logs, setLogs] = useState<{msg: string, type: 'info'|'success'|'warning'}[]>([]);

  const runIngestion = () => {
    setStatus("RUNNING");
    setLogs([]);
    
    const steps = [
      { msg: "Connecting to synthetic observation stream...", delay: 500, type: "info" },
      { msg: "Receiving 42 records from GenesisMarket...", delay: 1500, type: "info" },
      { msg: "Validating schemas... 40 accepted, 2 rejected (malformed).", delay: 2200, type: "warning" },
      { msg: "Normalizing identifiers (PGP keys, emails)...", delay: 3000, type: "info" },
      { msg: "Running Entity Resolution...", delay: 4000, type: "info" },
      { msg: "Resolved 3 aliases to known entity 'ShadowBroker'", delay: 4500, type: "success" },
      { msg: "Extracting relationships...", delay: 5200, type: "info" },
      { msg: "Created 12 new OWNS relationships.", delay: 5800, type: "success" },
      { msg: "Enriching risk scores...", delay: 6500, type: "info" },
      { msg: "Generated 1 NEW_LINK alert for Investigation INV-2026-0042", delay: 7200, type: "warning" },
      { msg: "Indexing complete. Pipeline finished.", delay: 8000, type: "success" },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { msg: step.msg, type: step.type as any }]);
        if (step === steps[steps.length - 1]) {
          setStatus("COMPLETE");
        }
      }, step.delay);
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Ingestion Pipeline</h1>
        <p className="text-zinc-600 font-mono text-sm">CONTROLLED DEMO ENVIRONMENT · SYNTHETIC INTELLIGENCE LAYER</p>
      </header>

      <div className="surface-1 nexus-border rounded-none p-6 mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-lg font-medium text-zinc-900 mb-1">Observation Stream Controller</h2>
            <p className="text-sm text-zinc-600">Trigger a simulated ingestion and entity-resolution pipeline.</p>
          </div>
          <button 
            onClick={runIngestion}
            disabled={status === "RUNNING"}
            className="btn-gov px-6 py-2.5 rounded-none font-medium flex items-center gap-2 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {status === "RUNNING" ? <Clock className="animate-spin" /> : <Play weight="fill" />}
            {status === "RUNNING" ? "PROCESSING PIPELINE..." : "START INGESTION"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Records Received</div>
            <div className="text-3xl font-display text-zinc-900">{status === "COMPLETE" ? "128" : "-"}</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Records Accepted</div>
            <div className="text-3xl font-display text-nexus-cyan">{status === "COMPLETE" ? "117" : "-"}</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Entities Resolved</div>
            <div className="text-3xl font-display text-zinc-900">{status === "COMPLETE" ? "31" : "-"}</div>
          </div>
          <div className="bg-zinc-50 p-4 rounded-none border border-zinc-200">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Alerts Triggered</div>
            <div className="text-3xl font-display text-nexus-amber">{status === "COMPLETE" ? "4" : "-"}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 surface-1 nexus-border rounded-none flex flex-col overflow-hidden">
        <div className="p-4 nexus-border-b bg-zinc-100 flex items-center gap-2 text-xs font-mono text-zinc-700 uppercase tracking-widest">
          <Database /> Pipeline Audit Log
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-[#050505] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 mb-2 hover:bg-white/5 px-2 py-1 rounded-none -mx-2 transition-colors">
              <span className="text-zinc-600 shrink-0 select-none">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
              <span className={clsx(
                log.type === 'info' && "text-zinc-600",
                log.type === 'warning' && "text-nexus-amber",
                log.type === 'success' && "text-nexus-cyan"
              )}>
                {log.msg}
              </span>
            </div>
          ))}
          {status === "IDLE" && (
            <div className="text-zinc-600 italic px-2">WAITING FOR PIPELINE TRIGGER...</div>
          )}
          {status === "RUNNING" && (
            <div className="flex gap-4 mt-2 px-2">
              <span className="text-nexus-cyan animate-pulse">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
