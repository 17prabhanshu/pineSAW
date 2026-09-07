"use client";

import { useMemo, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Handle, Position, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';

// Custom Node to make it look incredibly aesthetic and sleek
const CustomNode = ({ data, isConnectable }: any) => {
  return (
    <div className="bg-black border border-white/20 rounded-xl p-4 min-w-[200px] shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2 h-2 !bg-white/50 !border-none" />
      
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{data.group || "Entity"}</div>
        <div className="text-sm font-bold text-white tracking-wide font-mono break-words">{data.label}</div>
        {data.priorityScore && (
          <div className="mt-2 text-xs font-mono text-zinc-400">
            RISK: <span className="text-white">{data.priorityScore}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2 h-2 !bg-white/50 !border-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export function IntelligenceFlowchart({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const router = useRouter();

  // Convert graphData { nodes, links } to React Flow { nodes, edges }
  const initialNodes = useMemo(() => {
    if (!data?.nodes) return [];
    
    // Distribute nodes in a structured left-to-right hierarchy (dagre-style approximation)
    // Find central node (highest degree or first)
    const centralNode = data.nodes[0];
    
    const nodes = data.nodes.map((n: any, i: number) => {
      const isMain = i === 0;
      
      // Attempt a hierarchical layout. 
      // Main node at left. Children fan out to the right.
      let x = 100;
      let y = 300;
      
      if (!isMain) {
        x = 500;
        // Distribute y evenly around center
        y = 100 + (i * 120);
      }
      
      return {
        id: n.id,
        type: 'custom',
        position: { x, y },
        data: { ...n },
      };
    });
    return nodes;
  }, [data]);

  const initialEdges = useMemo(() => {
    if (!data?.links) return [];
    return data.links.map((l: any, i: number) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      
      return {
        id: `e${i}-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: l.label,
        animated: true,
        style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1.5 },
        labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#000000', fillOpacity: 0.8 },
        labelBgBorderRadius: 4,
        labelBgPadding: [4, 2],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: 'rgba(255,255,255,0.5)',
        },
      };
    });
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((event: any, node: any) => {
    if (onNodeClick) {
      onNodeClick(node.data);
    } else {
      router.push(`/entities/${node.id}`);
    }
  }, [onNodeClick, router]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }} className="bg-[#050505]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#222" gap={16} />
        <Controls className="!bg-black !border-white/10 !fill-white" />
      </ReactFlow>
    </div>
  );
}
