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
    <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-500 font-mono text-xs">
      INITIALIZING INSTITUTIONAL GRAPH ENGINE...
    </div>
  );

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] overflow-hidden">
      {/* Top Legend and Filter Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 border border-zinc-300 shadow-sm text-xs font-mono">
        {[
          { key: "ALL", label: "ALL NODES", color: "bg-zinc-800 text-white" },
          { key: "ACTOR", label: "ACTORS", color: "bg-[#002244] text-white" },
          { key: "BANK_ACCOUNT", label: "BANKS (FIAT)", color: "bg-emerald-700 text-white" },
          { key: "WALLET", label: "CRYPTO WALLETS", color: "bg-amber-600 text-white" },
          { key: "IDENTIFIER", label: "IDENTIFIERS", color: "bg-blue-600 text-white" }
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilterType(btn.key)}
            className={`px-2 py-1 text-[10px] font-semibold transition-none ${
              filterType === btn.key ? btn.color : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Zoom Control Overlay */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-white p-1 border border-zinc-300 shadow-sm">
        <button 
          onClick={handleZoomIn} 
          title="Zoom In"
          className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors"
        >
          <MagnifyingGlassPlus size={16} weight="bold" />
        </button>
        <button 
          onClick={handleZoomOut} 
          title="Zoom Out"
          className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors"
        >
          <MagnifyingGlassMinus size={16} weight="bold" />
        </button>
        <button 
          onClick={handleResetZoom} 
          title="Fit to Screen"
          className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors"
        >
          <ArrowsOutSimple size={16} weight="bold" />
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel={(node: any) => `${node.label} [${node.group}] - Priority: ${node.priorityScore || 'N/A'}`}
        nodeColor={(node: any) => {
          if (node.group === 'ACTOR') return '#002244'; // Deep Navy
          if (node.group === 'BANK_ACCOUNT') return '#047857'; // Emerald Green
          if (node.group === 'WALLET') return '#D97706'; // Amber Gold
          if (node.group === 'IDENTIFIER') return '#2563EB'; // Royal Blue
          if (node.group === 'LISTING') return '#DC2626'; // Ruby Red
          return '#64748B';
        }}
        nodeRelSize={7}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (globalScale < 1.8) return;
          const label = node.label || '';
          const fontSize = 11 / globalScale;
          ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#0F172A';
          ctx.fillText(label.length > 18 ? label.substring(0, 16) + '...' : label, node.x, node.y + 12);
        }}
        linkColor={() => 'rgba(148, 163, 184, 0.5)'}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => '#64748B'}
        onNodeClick={handleNodeClick}
        backgroundColor="#F8FAFC"
      />
    </div>
  );
}
