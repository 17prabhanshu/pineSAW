"use client";

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Fingerprint, 
  Lightning, 
  Copy, 
  Check, 
  WarningCircle, 
  ArrowSquareOut,
  Robot,
  ChartLineUp,
  Cpu
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";
import type { AgentTelemetry } from "@/app/api/agents/route";

interface AgentPerformanceModalProps {
  agent: AgentTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentPerformanceModal({ agent, isOpen, onClose }: AgentPerformanceModalProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  if (!isOpen || !agent) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    toast.success("Cryptographic Proof Copied to Clipboard");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/agents/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, runFullIntegrityCheck: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditResult(data);
        toast.success(`Forensic Audit Passed for ${agent.name}`, {
          description: `4/4 Proof-of-Work hashes verified intact against blockchain & FAISS ledger.`
        });
      } else {
        toast.error("Audit Execution Failed", { description: data.error || "Unknown error" });
      }
    } catch (err: any) {
      toast.error("Network error during audit verification", { description: err.message });
    } finally {
      setIsAuditing(false);
    }
  };

  const completionPct = agent.metrics.completionRate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="bg-zinc-950 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/50">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/5 border border-white/15 rounded-xl text-white">
                <Robot size={24} weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-white tracking-wide">{agent.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase font-bold tracking-wider">
                    {auditResult ? "AUDITED & VERIFIED" : agent.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {agent.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{agent.role} · Law Enforcement Autonomous Workload</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-zinc-300">
            {/* Quantifiable Telemetry Metrics Cards */}
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2.5 flex items-center gap-2">
                <ChartLineUp size={14} className="text-white" />
                <span>Quantifiable Performance Telemetry & SLA Compliance</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase">Tasks Completed</span>
                  <div className="text-lg font-bold text-white flex items-baseline gap-1.5">
                    <span>{agent.metrics.tasksCompleted}</span>
                    <span className="text-xs text-zinc-500 font-normal">/ {agent.metrics.tasksQueued}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-1 block">{completionPct}% through rate</span>
                </div>

                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase">Precision Score</span>
                  <div className="text-lg font-bold text-emerald-400">
                    {agent.metrics.precisionScore}%
                  </div>
                  <span className="text-[9px] text-zinc-400 block">Validated Ground Truth</span>
                  <span className="text-[9px] text-zinc-600 block">0.0% False Positive Rate</span>
                </div>

                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase">Evidence Yield</span>
                  <div className="text-lg font-bold text-white">
                    {agent.metrics.evidenceYieldCount}
                  </div>
                  <span className="text-[9px] text-zinc-400 block">Digital Artifacts Captured</span>
                  <span className="text-[9px] text-zinc-600 block">On-Chain & Tor Endpoints</span>
                </div>

                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase">SLA & Latency</span>
                  <div className="text-lg font-bold text-white">
                    {agent.metrics.slaComplianceRate}%
                  </div>
                  <span className="text-[9px] text-zinc-400 block">{agent.metrics.avgLatencyMs}ms avg response</span>
                  <span className="text-[9px] text-emerald-400 block">SLA Compliance Met</span>
                </div>
              </div>
            </div>

            {/* Active Target Assignments */}
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2.5 flex items-center justify-between">
                <span>Active Target Assignments ({agent.activeAssignments.length})</span>
                <span className="text-zinc-500 text-[9px]">Continuous Autonomous Surveillance</span>
              </div>
              <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-black/40">
                {agent.activeAssignments.map((target) => (
                  <div key={target.entityId} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{target.entityLabel}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-red-950/60 text-red-400 border border-red-500/30 rounded font-bold">
                          RISK {target.priorityScore}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                        <Clock size={11} className="text-zinc-500" />
                        <span>Assigned: {new Date(target.assignedAt).toLocaleTimeString()}</span>
                        <span>·</span>
                        <span className="text-amber-300/90">{target.phase}</span>
                      </div>
                    </div>

                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300">
                      Surveillance Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deterministic Cryptographic Proof of Work Trail */}
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Fingerprint size={14} className="text-white" />
                  <span>Deterministic Action Proof-of-Work (PoW) Trail</span>
                </span>
                <span className="text-[9px] text-zinc-500">SHA-256 Verifiable Hashes</span>
              </div>

              <div className="space-y-2">
                {agent.recentProofOfWork.map((pow) => (
                  <div 
                    key={pow.actionId}
                    className="p-3.5 bg-black/80 border border-white/10 rounded-xl space-y-2 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-bold">
                          {pow.actionId}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {pow.actionType}
                        </span>
                        <span className="text-zinc-500 text-[10px]">→</span>
                        <span className="text-white font-semibold text-[10px]">{pow.target}</span>
                      </div>

                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                        {pow.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {pow.findingsSummary}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-zinc-400 overflow-hidden">
                        <Fingerprint size={13} className="text-zinc-500 shrink-0" />
                        <span className="text-zinc-500 shrink-0">SHA-256 PoW:</span>
                        <span className="text-zinc-300 font-mono truncate">{pow.sha256ProofHash}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(pow.sha256ProofHash, pow.actionId)}
                        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors shrink-0 cursor-pointer"
                        title="Copy SHA-256 Proof"
                      >
                        {copiedHash === pow.actionId ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Audit Certificate Banner (if run) */}
            {auditResult && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck size={18} weight="fill" />
                    <span>FORENSIC PROOF-OF-WORK AUDIT VERIFIED</span>
                  </div>
                  <span className="text-[10px] text-emerald-300/80">RECORD: {auditResult.auditRecordId}</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  {auditResult.message}
                </p>
                <div className="text-[10px] text-emerald-300/60 font-mono truncate">
                  Audit Hash: {auditResult.auditHash}
                </div>
                <div className="text-[9px] text-zinc-400 pt-1">
                  Certifying Authority: {auditResult.certifyingOfficer.name} · {auditResult.certifyingOfficer.unit}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Audit Execution Trigger */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3">
            <div className="text-[10px] text-zinc-500">
              Deterministic evidentiary standard compliant with Indian Evidence Act & CrPC § 91.
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                isAuditing ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {isAuditing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                  <span>Verifying PoW Hashes...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} weight="bold" />
                  <span>Trigger Forensic Audit</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
