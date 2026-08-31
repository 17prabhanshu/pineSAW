"use client";

import React, { useState } from "react";
import { BentoDashboard } from "@/components/dashboard/bento-grid";
import { IdentityGraphCanvas } from "@/components/graph/identity-graph";
import { GlobalCommandMenu } from "@/components/command/cmdk-dialog";
import { 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  Radio, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import Link from "next/link";

export default function ThreatIntelligenceConsole() {
  const [activeView, setActiveView] = useState<"bento" | "graph">("bento");

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 p-6 md:p-8 space-y-8">
      {/* 21st.dev Top Navigation & Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Autonomous Threat Intelligence Console
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-violet-400">
                PRO v2.4
              </span>
            </h1>
          </div>
          <p className="mt-1 text-xs font-mono text-zinc-400">
            Real-Time Tor Stream Multiplexer · GLiNER NLP Extraction · Neo4j Property Graph
          </p>
        </div>

        {/* View Switcher & Command Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-zinc-900/60 p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveView("bento")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                activeView === "bento"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Bento Feed
            </button>
            <button
              onClick={() => setActiveView("graph")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                activeView === "graph"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> React Flow Graph
            </button>
          </div>

          <GlobalCommandMenu onSelectView={(v) => setActiveView(v)} />
        </div>
      </header>

      {/* Primary Display Pane */}
      {activeView === "bento" ? (
        <BentoDashboard />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>DRAG NODES TO INSPECT · PINCH OR SCROLL TO ZOOM · CLICK CONNECTORS</span>
            <button 
              onClick={() => setActiveView("bento")}
              className="text-violet-400 hover:underline flex items-center gap-1"
            >
              Return to Bento Stream <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <IdentityGraphCanvas />
        </div>
      )}
    </div>
  );
}
