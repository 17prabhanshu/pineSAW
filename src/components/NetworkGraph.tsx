"use client";
import dynamic from 'next/dynamic';
import { useCallback, useRef, useEffect, useState } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export function NetworkGraph({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) onNodeClick(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(4, 1000);
    }
  }, [onNodeClick]);

  if (!mounted) return <div className="w-full h-full bg-white flex items-center justify-center text-zinc-500 font-mono text-xs">LOADING GRAPH ENGINE...</div>;

  return (
    <div className="w-full h-full relative">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel="label"
        nodeColor={(node: any) => {
          if (node.group === 'ACTOR') return '#f44336';
          if (node.group === 'ACCOUNT') return '#00e5ff';
          if (node.group === 'WALLET') return '#ffb300';
          return '#666';
        }}
        nodeRelSize={6}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        linkWidth={1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        backgroundColor="#121212"
      />
    </div>
  );
}
