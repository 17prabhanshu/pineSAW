"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import {
  Broadcast,
  ArrowsClockwise,
  PaperPlaneRight,
  Hash,
  Database,
  ShieldCheck,
  Lightning,
  Pulse,
  Copy,
  Check,
  Terminal,
  Cpu,
  ArrowSquareOut
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";
import type { KafkaTelemetry } from "@/lib/kafka/kafkaClient";

export default function KafkaDashboardPage() {
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
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

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
        source: "Kafka Dashboard Console",
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans pt-24 pb-16">
      <TopNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Broadcast size={28} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white">
                  APACHE KAFKA EVENT BUS & STREAMING ENGINE
                </h1>
                <span
                  className={clsx(
                    "px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded border",
                    isConnected
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  )}
                >
                  {isConnected ? "● CLUSTER CONNECTED" : "◐ RESILIENT BUFFER MODE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Target Broker: <code className="text-amber-300">localhost:9092</code> (Binary TCP Wire Protocol) · Client ID: <code className="text-slate-300">{telemetry?.clientId || "pinesaw-cti-node"}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEmitTestEvent}
              disabled={isEmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Lightning size={16} weight="fill" />
              {isEmitting ? "Emitting..." : "Emit Test Intercept"}
            </button>
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Stream Telemetry"
            >
              <ArrowsClockwise size={16} className={clsx(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Technical Notice Banner */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono text-amber-200/90 flex items-start gap-3">
          <Terminal size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300">
              Why port 9092 cannot be opened directly in a browser:
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Port <code className="text-amber-300">9092</code> is Apache Kafka's <strong>raw binary TCP socket</strong> (used by backend producers & consumers), not an HTTP web server. This web dashboard on port <code className="text-sky-300">3000</code> is the human-readable management console that connects to the bus in real time.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Produced Events</span>
              <PaperPlaneRight size={16} className="text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {telemetry?.totalProduced.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Dispatched to Kafka topics</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Active Topics</span>
              <Hash size={16} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {Object.keys(telemetry?.topics || {}).length}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Partitioned event streams</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Ring Buffer Depth</span>
              <Database size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {telemetry?.bufferQueueSize || 0}{" "}
              <span className="text-xs text-slate-500 font-normal">/ {telemetry?.bufferCapacity || 200}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Zero-loss persistence queue</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Evidence Integrity</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Section 63 BSA SHA-256 Hashes</div>
          </div>
        </div>

        {/* Topic Partition Stats */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <Pulse size={16} className="text-amber-400" /> Topic Partition Offsets & Throughput
            </h2>
            <span className="text-xs font-mono text-slate-500">Auto-refreshing every 3s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(telemetry?.topics || {}).map((top) => (
              <div
                key={top.name}
                className="p-4 rounded-xl border border-slate-800 bg-[#131D31] flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {top.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Latest Offset: <strong className="text-amber-300">#{top.lastOffset}</strong> ·{" "}
                    {top.lastTimestamp
                      ? new Date(top.lastTimestamp).toLocaleTimeString()
                      : "Awaiting Stream"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                    {top.totalMessages} msgs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Message Feed */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase text-slate-200 tracking-wider">
                Live Stream Envelope Inspector
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Inspect raw envelopes, timestamps, and cryptographic proofs
              </p>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["ALL", "pinesaw.raw.intercepts", "pinesaw.extracted.entities", "pinesaw.alerts.threat", "pinesaw.audit.chain_of_custody"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={clsx(
                      "px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer",
                      selectedTopic === t
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                    )}
                  >
                    {t === "ALL" ? "ALL TOPICS" : t.split(".").pop()?.toUpperCase()}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                No stream messages on this topic filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isExpanded = expandedMsgId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-slate-800 bg-[#131D31] hover:border-slate-700 transition-colors overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedMsgId(isExpanded ? null : msg.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-500 shrink-0">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 border border-slate-700 text-amber-300 shrink-0">
                          {msg.topic}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-300 truncate">
                          <strong className="text-slate-400">{msg.source}:</strong>{" "}
                          {msg.data?.headline || msg.data?.text || msg.data?.title || JSON.stringify(msg.data).substring(0, 70)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                          SHA: <code className="text-slate-400">{msg.sha256.substring(0, 8)}...</code>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(JSON.stringify(msg, null, 2), msg.id);
                          }}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy Full JSON Payload"
                        >
                          {copiedId === msg.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-[#090E17] border-t border-slate-800 font-mono text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-slate-800 text-[11px] flex-wrap gap-2">
                          <span>
                            Evidence SHA-256: <code className="text-emerald-400">{msg.sha256}</code>
                          </span>
                          <span>
                            Delivery Mode:{" "}
                            <span className={clsx(msg.isBuffered ? "text-amber-400" : "text-emerald-400 font-bold")}>
                              {msg.isBuffered ? "IN-MEMORY RING BUFFER" : "COMMITTED TO KAFKA BROKER"}
                            </span>
                          </span>
                        </div>
                        <pre className="text-slate-300 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed p-2 rounded bg-black/40 border border-slate-900">
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
      </main>
    </div>
  );
}
