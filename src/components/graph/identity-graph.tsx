"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  ShieldAlert, 
  Wallet, 
  Send, 
  Key, 
  Banknote, 
  Maximize2, 
  RotateCcw, 
  Layers,
  Sparkles
} from "lucide-react";

// CUSTOM FROSTED GLASS NODE CARDS
function CustomEntityNode({ data }: { data: any }) {
  const getIcon = () => {
    if (data.type === "VENDOR") return <ShieldAlert className="h-4 w-4 text-violet-400" />;
    if (data.type === "WALLET") return <Wallet className="h-4 w-4 text-amber-400" />;
    if (data.type === "BANK") return <Banknote className="h-4 w-4 text-emerald-400" />;
    if (data.type === "HANDLE") return <Send className="h-4 w-4 text-blue-400" />;
    return <Key className="h-4 w-4 text-indigo-400" />;
  };

  const getBorderColor = () => {
    if (data.type === "VENDOR") return "border-violet-500/40 shadow-violet-500/10";
    if (data.type === "WALLET") return "border-amber-500/40 shadow-amber-500/10";
    if (data.type === "BANK") return "border-emerald-500/40 shadow-emerald-500/10";
    if (data.type === "HANDLE") return "border-blue-500/40 shadow-blue-500/10";
    return "border-zinc-700";
  };

  return (
    <div className={`group relative min-w-[220px] rounded-xl border ${getBorderColor()} bg-[#09090b]/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/30`}>
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-violet-400 !border-0" />
      
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            {data.type}
          </span>
          <h4 className="truncate text-xs font-semibold text-white tracking-tight">
            {data.label}
          </h4>
        </div>
      </div>

      {data.subtext && (
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>{data.subtext}</span>
          {data.risk && (
            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-400 font-bold">
              RISK: {data.risk}
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-violet-400 !border-0" />
    </div>
  );
}

const nodeTypes = {
  customEntity: CustomEntityNode,
};

const INITIAL_NODES: Node[] = [
  {
    id: "vendor_1",
    type: "customEntity",
    position: { x: 300, y: 50 },
    data: { label: "ShadowBroker", type: "VENDOR", subtext: "Primary Syndicate", risk: "88" },
  },
  {
    id: "pgp_1",
    type: "customEntity",
    position: { x: 120, y: 190 },
    data: { label: "PGP: 4A7B 89C1 DE34", type: "PGP_KEY", subtext: "Master Fingerprint" },
  },
  {
    id: "tg_1",
    type: "customEntity",
    position: { x: 480, y: 190 },
    data: { label: "@shadow_broker_t", type: "HANDLE", subtext: "Telegram Channel" },
  },
  {
    id: "wallet_btc",
    type: "customEntity",
    position: { x: 50, y: 340 },
    data: { label: "bc1qar0srrr7xfkv...", type: "WALLET", subtext: "14.85 BTC Balance" },
  },
  {
    id: "wallet_eth",
    type: "customEntity",
    position: { x: 300, y: 340 },
    data: { label: "0x742d35Cc6634...", type: "WALLET", subtext: "45.2 ETH Gateway" },
  },
  {
    id: "bank_hdfc",
    type: "customEntity",
    position: { x: 550, y: 340 },
    data: { label: "HDFC Bank (Acct: 501002)", type: "BANK", subtext: "INR 1.2M Seizure Target" },
  }
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "vendor_1", target: "pgp_1", animated: true, style: { stroke: "#8b5cf6", strokeWidth: 2 } },
  { id: "e1-3", source: "vendor_1", target: "tg_1", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
  { id: "e2-4", source: "pgp_1", target: "wallet_btc", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "e1-5", source: "vendor_1", target: "wallet_eth", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "e5-6", source: "wallet_eth", target: "bank_hdfc", animated: true, style: { stroke: "#10b981", strokeWidth: 2 } }
];

export function IdentityGraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050507]">
      {/* Top Floating Control Dock */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 p-1.5 backdrop-blur-xl shadow-lg">
        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-violet-400">
          <Sparkles className="h-3.5 w-3.5" /> PROPERTY GRAPH VIEW
        </span>
        <div className="h-4 w-px bg-white/[0.1]" />
        <span className="px-2 text-[11px] font-mono text-zinc-400">6 Entity Nodes · 5 Directed Edges</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="dark-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255, 255, 255, 0.07)" />
        <Controls className="!border !border-white/[0.08] !bg-zinc-900/90 !fill-white !rounded-xl" />
        <MiniMap 
          nodeColor="#8b5cf6" 
          maskColor="rgba(5, 5, 7, 0.85)"
          className="!border !border-white/[0.08] !bg-zinc-950 !rounded-xl" 
        />
      </ReactFlow>
    </div>
  );
}
