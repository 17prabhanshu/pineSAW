"use client";
import dynamic from 'next/dynamic';
import { useCallback, useRef, useEffect, useState } from 'react';
import { MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsOutSimple } from '@phosphor-icons/react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export function NetworkGraph({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) onNodeClick(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(3.5, 800);
    }
  }, [onNodeClick]);

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 0.7, 400);
  };

  const handleResetZoom = () => {
    if (fgRef.current) fgRef.current.zoomToFit(600, 40);
  };

  // Filter nodes if requested
  const filteredData = {
    nodes: data?.nodes?.filter((n: any) => filterType === "ALL" || n.group === filterType) || [],
    links: data?.links?.filter((l: any) => {
      if (filterType === "ALL") return true;
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      const srcNode = data?.nodes?.find((n: any) => n.id === srcId);
      const tgtNode = data?.nodes?.find((n: any) => n.id === tgtId);
      return srcNode?.group === filterType || tgtNode?.group === filterType;
    }) || []
  };

  if (!mounted) return (
    <div className="w-full h-full bg-zinc-800/30 flex items-center justify-center text-zinc-400 font-mono text-xs">
      INITIALIZING INSTITUTIONAL GRAPH ENGINE...
    </div>
  );

  return (
    <div className="w-full h-full relative bg-transparent overflow-hidden rounded-2xl border border-white/5">
      {/* Top Legend and Filter Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex gap-2 p-2 border border-white/10 shadow-sm text-xs font-mono rounded-xl bg-black/40 backdrop-blur-md">
        {[
          { key: "ALL", label: "ALL NODES", color: "bg-gemini-purple text-white shadow-[0_0_10px_rgba(139,92,246,0.4)] border border-gemini-purple" },
          { key: "ACTOR", label: "ACTORS", color: "bg-gemini-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-gemini-accent" },
          { key: "BANK_ACCOUNT", label: "BANKS (FIAT)", color: "bg-emerald-600 text-white border border-emerald-500" },
          { key: "WALLET", label: "CRYPTO WALLETS", color: "bg-amber-600 text-white border border-amber-500" },
          { key: "IDENTIFIER", label: "IDENTIFIERS", color: "bg-indigo-600 text-white border border-indigo-500" }
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilterType(btn.key)}
            className={`px-3 py-1.5 text-[10px] font-semibold transition-all rounded-lg ${
              filterType === btn.key ? btn.color : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 border border-transparent"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Zoom Control Overlay */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 p-2 border border-white/10 shadow-sm rounded-xl bg-black/40 backdrop-blur-md">
        <button 
          onClick={handleZoomIn} 
          title="Zoom In"
          className="p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <MagnifyingGlassPlus size={18} weight="bold" />
        </button>
        <button 
          onClick={handleZoomOut} 
          title="Zoom Out"
          className="p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <MagnifyingGlassMinus size={18} weight="bold" />
        </button>
        <button 
          onClick={handleResetZoom} 
          title="Fit to Screen"
          className="p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <ArrowsOutSimple size={18} weight="bold" />
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel={(node: any) => `${node.label} [${node.group}] - Priority: ${node.priorityScore || 'N/A'}`}
        nodeColor={(node: any) => {
          if (node.group === 'ACTOR') return '#3b82f6'; // Gemini Blue
          if (node.group === 'BANK_ACCOUNT') return '#059669'; // Emerald
          if (node.group === 'WALLET') return '#d97706'; // Amber
          if (node.group === 'IDENTIFIER') return '#8b5cf6'; // Gemini Purple
          if (node.group === 'LISTING') return '#dc2626'; // Red
          return '#64748b';
        }}
        nodeRelSize={7}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (globalScale < 1.8) return;
          const label = node.label || '';
          const fontSize = 11 / globalScale;
          ctx.font = `${fontSize}px Space Grotesk, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#f4f4f5'; // Light text
          ctx.fillText(label.length > 18 ? label.substring(0, 16) + '...' : label, node.x, node.y + 14);
        }}
        linkColor={() => 'rgba(255, 255, 255, 0.15)'}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => 'rgba(255, 255, 255, 0.4)'}
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
      />
    </div>
  );
}
