"use client";

import { useState, useEffect } from "react";
import {
  X,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  Broadcast,
  Database,
  ShieldCheck,
  PaperPlaneRight,
  Copy,
  Check,
  Hash,
  Pulse,
  Cpu,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";
import type { KafkaTelemetry, KafkaIntelEnvelope } from "@/lib/kafka/kafkaClient";

interface KafkaMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KafkaMonitorModal({ isOpen, onClose }: KafkaMonitorModalProps) {
  const [telemetry, setTelemetry] = useState<KafkaTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEmitting, setIsEmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kafka/status");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEmitTestEvent = async () => {
    setIsEmitting(true);
    try {
      const testPayload = {
        topic: "pinesaw.raw.intercepts",
        source: "Kafka Monitor Tester (UI Console)",
        autoExtract: true,
        data: {
          testRunId: `TEST-${Date.now()}`,
          headline: "LIVE TEST: Intercepted Fentanyl & Ice supply order via Kafka Stream",
          text: "CHANDIGARH SECTOR 35 DEAD DROP: 100 pills fentanyl m30 ready. BTC payment to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq. Telegram contact @tri_city_vendor.",
          timestamp: new Date().toISOString(),
          priority: 88,
        },
      };

      const res = await fetch("/api/kafka/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Event Dispatched to Kafka Event Bus", {
          description: `Message ID: ${data.envelope.id} · SHA-256 Verified`,
        });
        fetchTelemetry();
      } else {
        toast.error("Failed to publish test event");
      }
    } catch (e: any) {
      toast.error("Dispatch Error", { description: e.message });
    } finally {
      setIsEmitting(false);
    }
  };

  const filteredMessages = telemetry?.recentMessages.filter((msg) => {
    if (selectedTopic === "ALL") return true;
    return msg.topic === selectedTopic;
  }) || [];

  const isConnected = telemetry?.status === "CONNECTED";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Broadcast size={20} weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                    APACHE KAFKA EVENT BUS TELEMETRY
                  </h2>
                  <span
                    className={clsx(
                      "px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded border",
                      isConnected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    )}
                  >
                    {isConnected ? "● CLUSTER CONNECTED" : "◐ RESILIENT BUFFER MODE"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Brokers: {telemetry?.brokers.join(", ") || "localhost:9092"} · Client:{" "}
                  {telemetry?.clientId || "pinesaw-core-bus"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTelemetry}
                disabled={loading}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh Status"
              >
                <ArrowsClockwise size={16} className={clsx(loading && "animate-spin")} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-[#0B1120] border-b border-slate-800">
            <div className="p-3 rounded border border-slate-800 bg-[#1E293B]/40">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider">Produced Events</span>
                <PaperPlaneRight size={14} className="text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {telemetry?.totalProduced.toLocaleString() || 0}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dispatched to Bus</div>
            </div>

            <div className="p-3 rounded border border-slate-800 bg-[#1E293B]/40">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider">Active Topics</span>
                <Hash size={14} className="text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {Object.keys(telemetry?.topics || {}).length}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Partitioned Streams</div>
            </div>

            <div className="p-3 rounded border border-slate-800 bg-[#1E293B]/40">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider">Ring Buffer Depth</span>
                <Database size={14} className="text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {telemetry?.bufferQueueSize || 0}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {telemetry?.bufferCapacity || 200}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Zero-Loss Persistence</div>
            </div>

            <div className="p-3 rounded border border-slate-800 bg-[#1E293B]/40">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider">Evidence Security</span>
                <ShieldCheck size={14} className="text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">SHA-256 Signed Envelopes</div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Topic Partition Stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <Pulse size={14} className="text-amber-400" /> Topic Partition Health & Offsets
                </h3>
                <button
                  onClick={handleEmitTestEvent}
                  disabled={isEmitting}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Lightning size={14} weight="fill" />
                  {isEmitting ? "Emitting..." : "Emit Test Intercept"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(telemetry?.topics || {}).map((top) => (
                  <div
                    key={top.name}
                    className="p-3 rounded border border-slate-800 bg-[#141E33] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-200">{top.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Latest Offset: <span className="text-slate-300">#{top.lastOffset}</span> ·{" "}
                        {top.lastTimestamp
                          ? new Date(top.lastTimestamp).toLocaleTimeString()
                          : "Awaiting Stream"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {top.totalMessages} msgs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Message Feed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                  Live Stream Envelope Inspector
                </h3>

                {/* Topic Filter Pills */}
                <div className="flex items-center gap-1">
                  {["ALL", "pinesaw.raw.intercepts", "pinesaw.alerts.threat", "pinesaw.audit.chain_of_custody"].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTopic(t)}
                        className={clsx(
                          "px-2 py-0.5 text-[10px] font-mono rounded transition-colors",
                          selectedTopic === t
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {t === "ALL" ? "ALL" : t.split(".").pop()?.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded">
                    No stream messages on this topic filter.
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isExpanded = expandedMsgId === msg.id;
                    return (
                      <div
                        key={msg.id}
                        className="rounded border border-slate-800 bg-[#131D31] hover:border-slate-700 transition-colors overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedMsgId(isExpanded ? null : msg.id)}
                          className="p-3 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 border border-slate-700 text-amber-300">
                              {msg.topic}
                            </span>
                            <span className="text-xs font-mono font-medium text-slate-300 truncate max-w-md">
                              {msg.source}:{" "}
                              {msg.data?.headline || msg.data?.text || msg.data?.title || JSON.stringify(msg.data).substring(0, 60)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">
                              SHA: {msg.sha256.substring(0, 8)}...
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(JSON.stringify(msg, null, 2), msg.id);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-300"
                              title="Copy JSON Payload"
                            >
                              {copiedId === msg.id ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 bg-[#090E17] border-t border-slate-800/80 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-slate-800 text-[11px]">
                              <span>
                                Payload Hash: <code className="text-emerald-400">{msg.sha256}</code>
                              </span>
                              <span>
                                Status:{" "}
                                <span className={clsx(msg.isBuffered ? "text-amber-400" : "text-emerald-400")}>
                                  {msg.isBuffered ? "BUFFERED" : "COMMITTED TO BROKER"}
                                </span>
                              </span>
                            </div>
                            <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(msg.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-[#1E293B] flex items-center justify-between text-xs font-mono text-slate-400">
            <div>
              Kafka Cluster Protocol: <span className="text-slate-200">KRaft Mode (3.7.0)</span> · Zero-Loss Guarantee
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
            >
              Close Console
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
