"use client";
import dynamic from 'next/dynamic';
import { useCallback, useRef, useEffect, useState } from 'react';
import { MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsOutSimple, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export function NetworkGraph({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) onNodeClick(node);
    setSelectedNode(node);
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
    <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-400 font-mono text-xs">
      INITIALIZING INSTITUTIONAL GRAPH ENGINE...
    </div>
  );

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] overflow-hidden">
      {/* Top Legend and Filter Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-black/50/95 backdrop-blur-sm p-1.5 border border-zinc-300 shadow-sm text-xs font-mono">
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
              filterType === btn.key ? btn.color : "bg-zinc-800/50 text-zinc-700 hover:bg-white/10"
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
          className="p-2 hover:bg-zinc-800/50 text-zinc-700 transition-colors"
        >
          <MagnifyingGlassPlus size={16} weight="bold" />
        </button>
        <button 
          onClick={handleZoomOut} 
          title="Zoom Out"
          className="p-2 hover:bg-zinc-800/50 text-zinc-700 transition-colors"
        >
          <MagnifyingGlassMinus size={16} weight="bold" />
        </button>
        <button 
          onClick={handleResetZoom} 
          title="Fit to Screen"
          className="p-2 hover:bg-zinc-800/50 text-zinc-700 transition-colors"
        >
          <ArrowsOutSimple size={16} weight="bold" />
        </button>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: mousePos.y + 15,
              left: mousePos.x + 15,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            className="bg-black/50 text-white text-xs font-mono p-3 rounded-md shadow-xl border border-zinc-700 min-w-[200px]"
            layoutId={`node-panel-${hoveredNode.id}`}
          >
            <div className="font-bold text-sm mb-1">{hoveredNode.label}</div>
            <div className="text-zinc-400 mb-2">Group: {hoveredNode.group}</div>
            {hoveredNode.priorityScore && (
              <div className="flex justify-between items-center border-t border-zinc-800 pt-2 mt-2">
                <span>Priority</span>
                <span className="text-amber-400 font-bold">{hoveredNode.priorityScore}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-4 right-4 z-40 w-80 bg-black/50/95 backdrop-blur-md shadow-2xl border border-white/10 rounded-lg overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
            layoutId={`node-panel-${selectedNode.id}`}
          >
            <div className="p-4 bg-black/50 text-white flex justify-between items-start">
              <div>
                <motion.h2 className="text-lg font-bold font-mono" layoutId={`node-title-${selectedNode.id}`}>
                  {selectedNode.label}
                </motion.h2>
                <motion.div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider" layoutId={`node-group-${selectedNode.id}`}>
                  {selectedNode.group}
                </motion.div>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-zinc-400 font-mono mb-1">ID</div>
                  <div className="font-mono text-zinc-200 bg-zinc-800/50 p-2 rounded text-xs break-all">
                    {selectedNode.id}
                  </div>
                </div>

                {selectedNode.priorityScore && (
                  <div>
                    <div className="text-xs text-zinc-400 font-mono mb-1">Priority Score</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500"
                          style={{ width: `${Math.min(100, selectedNode.priorityScore)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold">{selectedNode.priorityScore}</span>
                    </div>
                  </div>
                )}

                {Object.keys(selectedNode).filter(k => !['id', 'label', 'group', 'priorityScore', 'x', 'y', 'vx', 'vy', 'index', 'color'].includes(k)).length > 0 && (
                  <div>
                    <div className="text-xs text-zinc-400 font-mono mb-2 border-b border-white/10 pb-1">Additional Properties</div>
                    <div className="space-y-2">
                      {Object.entries(selectedNode)
                        .filter(([k]) => !['id', 'label', 'group', 'priorityScore', 'x', 'y', 'vx', 'vy', 'index', 'color'].includes(k))
                        .map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-xs font-mono text-zinc-400">{k}</span>
                            <span className="text-sm text-zinc-200">{String(v)}</span>
                          </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel={() => ''} // Disable default tooltip since we use custom hover
        onNodeHover={(node: any) => {
          setHoveredNode(node || null);
          if (node) {
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
        }}
        nodeColor={(node: any) => {
          if (node === selectedNode || node === hoveredNode) return '#0EA5E9'; // Sky Blue highlight
          if (node.group === 'ACTOR') return '#002244';
          if (node.group === 'BANK_ACCOUNT') return '#047857';
          if (node.group === 'WALLET') return '#D97706';
          if (node.group === 'IDENTIFIER') return '#2563EB';
          if (node.group === 'LISTING') return '#DC2626';
          return '#64748B';
        }}
        nodeRelSize={7}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (globalScale < 1.8 && node !== hoveredNode && node !== selectedNode) return;
          
          // Draw highlight ring if selected or hovered
          if (node === selectedNode || node === hoveredNode) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#0EA5E9';
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
          }

          const label = node.label || '';
          const fontSize = (node === selectedNode ? 14 : 11) / globalScale;
          ctx.font = `${node === selectedNode ? 'bold ' : ''}${fontSize}px IBM Plex Mono, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Text background for better readability
          const textWidth = ctx.measureText(label).width;
          const bgHeight = fontSize + 4 / globalScale;
          
          if (node === selectedNode || node === hoveredNode) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(node.x - textWidth/2 - 2, node.y + 10 - bgHeight/2, textWidth + 4, bgHeight);
          }

          ctx.fillStyle = node === selectedNode ? '#3b82f6' : '#f4f4f5';
          ctx.fillText(label.length > 18 && node !== selectedNode ? label.substring(0, 16) + '...' : label, node.x, node.y + 12);
        }}
        linkColor={(link: any) => {
          if (selectedNode) {
            const isConnected = link.source.id === selectedNode.id || link.target.id === selectedNode.id;
            return isConnected ? 'rgba(14, 165, 233, 0.8)' : 'rgba(148, 163, 184, 0.2)';
          }
          if (hoveredNode) {
            const isConnected = link.source.id === hoveredNode.id || link.target.id === hoveredNode.id;
            return isConnected ? 'rgba(14, 165, 233, 0.6)' : 'rgba(148, 163, 184, 0.3)';
          }
          return 'rgba(148, 163, 184, 0.5)';
        }}
        linkWidth={(link: any) => {
          if (selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id)) return 2.5;
          if (hoveredNode && (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id)) return 2;
          return 1.5;
        }}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => '#64748B'}
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
      />
    </div>
  );
}
