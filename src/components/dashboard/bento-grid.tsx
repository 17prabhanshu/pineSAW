"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Zap, 
  Key, 
  Wallet, 
  Search, 
  Filter, 
  Share2, 
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { 
  INITIAL_INTEL_STREAM, 
  INITIAL_TELEMETRY, 
  ACTIVE_CLUSTER, 
  TOR_PROXY_NODES,
  generateRandomIntelEvent 
} from "@/mock/stream-data";
import { IntelEvent, TelemetryPoint } from "@/types/intel";
import { EntitySheet } from "@/components/dashboard/entity-sheet";

export function BentoDashboard() {
  const [stream, setStream] = useState<IntelEvent[]>(INITIAL_INTEL_STREAM);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(INITIAL_TELEMETRY);
  const [selectedEvent, setSelectedEvent] = useState<IntelEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Auto-pulse stream every 3.5 seconds
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newEvent = generateRandomIntelEvent();
      setStream((prev) => [newEvent, ...prev.slice(0, 7)]);

      // Update telemetry
      setTelemetry((prev) => {
        const last = prev[prev.length - 1];
        const newSec = Math.min(55, Math.max(15, last.eventsPerSec + (Math.random() * 8 - 4)));
        const newTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        return [...prev.slice(1), { time: newTime, eventsPerSec: parseFloat(newSec.toFixed(1)), circuitsActive: 50, bandwidthMbps: parseFloat((newSec * 0.7).toFixed(1)) }];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleCopyWallet = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-xs font-mono font-medium text-zinc-300">
            STREAM ISOLATION ACTIVE · 50/50 MULTIPLEXED CIRCUITS SYNCED
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs text-zinc-400">
          <div>
            <span className="text-zinc-600 mr-2">INGESTION RATE:</span>
            <span className="text-emerald-400 font-bold">{telemetry[telemetry.length - 1]?.eventsPerSec || 42.0} evt/s</span>
          </div>
          <div>
            <span className="text-zinc-600 mr-2">LATENCY:</span>
            <span className="text-zinc-200">124ms avg</span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`rounded-lg border px-3 py-1 text-[11px] font-semibold transition-all ${
              isLive 
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
            }`}
          >
            {isLive ? "● LIVE FEED PAUSE" : "▶ RESUME STREAM"}
          </button>
        </div>
      </div>

      {/* THE 21ST.DEV BENTO GRID */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
        
        {/* TILE A: HERO LIVE STREAM (2x2) */}
        <SpotlightCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col p-6 min-h-[520px]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white">Live OSINT Intelligence Stream</h3>
                <p className="text-[11px] font-mono text-zinc-500">Autonomous Tor & Telegram Ingestion Feed</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-violet-400">
              REAL-TIME NLP
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {stream.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedEvent(event)}
                  className="group/item relative cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-violet-500/40 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-zinc-200">{event.vendorAlias}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">via {event.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-bold ${
                        event.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {event.severity}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{event.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-1 mb-2.5">{event.title}</p>

                  {/* Discovered Wallets Quick Copy Pill */}
                  {event.wallets.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 truncate">
                        <Wallet className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.wallets[0].address}</span>
                      </div>
                      <button
                        onClick={(e) => handleCopyWallet(event.wallets[0].address, e)}
                        className="rounded border border-white/[0.08] bg-white/[0.04] p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                        title="Copy Wallet"
                      >
                        {copiedId === event.wallets[0].address ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <span className="ml-auto text-[10px] font-mono text-zinc-500 group-hover/item:text-violet-400 flex items-center gap-1">
                        Inspect <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SpotlightCard>

        {/* TILE B: REAL-TIME INGESTION VELOCITY (1x1) */}
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-white">Ingestion Velocity</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +18.4%
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {telemetry[telemetry.length - 1]?.eventsPerSec}
              </span>
              <span className="text-xs text-zinc-500 ml-1 font-mono">pkts / sec</span>
            </div>
          </div>

          <div className="h-28 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry}>
                <defs>
                  <linearGradient id="velocityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Area type="monotone" dataKey="eventsPerSec" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#velocityGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* TILE D: TOR STREAM ISOLATION STATUS (1x1) */}
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-white">Tor SOCKS5 Fleet</h4>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
              ONLINE
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {TOR_PROXY_NODES.map((node) => (
              <div key={node.id} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${node.status === "ACTIVE" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                  <span className="font-mono text-[11px] text-zinc-300">{node.relay}</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{node.latencyMs}ms</span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-white/[0.06] flex justify-between text-[10px] font-mono text-zinc-500">
            <span>IsolateSOCKSAuth</span>
            <span className="text-indigo-400">RFC 1928 ENABLED</span>
          </div>
        </SpotlightCard>

        {/* TILE C: IDENTITY RESOLUTION CLUSTER (2x1) */}
        <SpotlightCard className="md:col-span-2 lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Resolved Syndicate Cluster</h4>
                  <p className="text-[10px] font-mono text-zinc-500">Cross-Platform MIT Lincoln Lab Persona Linkage</p>
                </div>
              </div>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                CONFIDENCE: {(ACTIVE_CLUSTER.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Cluster Link Visualizer */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Primary Target</span>
                  <span className="font-bold text-white text-sm">{ACTIVE_CLUSTER.primaryActor}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Est. Seizure Volume</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{ACTIVE_CLUSTER.totalVolumeUsd}</span>
                </div>
              </div>

              {/* Linking Chain */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] font-mono">
                <div className="bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-zinc-300">
                  GenesisMarket (.onion)
                </div>
                <div className="text-violet-400 font-bold">⇄ Shared PGP ⇄</div>
                <div className="bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-zinc-300">
                  Telegram @shadow_broker_t
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-zinc-400">
            <span>6 Mapped Accounts (HDFC, SBI, Swissquote)</span>
            <button 
              onClick={() => window.open("/investigations/INV-2026-0042", "_blank")}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open Full Forensic Workspace <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </SpotlightCard>

      </div>

      {/* Side Context Sheet */}
      <EntitySheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onInvestigate={(evt) => window.open("/investigations/INV-2026-0042", "_blank")}
      />
    </div>
  );
}
