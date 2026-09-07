"use client";

import { useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export function EntityFlowchart({ data }: { data: any }) {
  // Convert graphData { nodes, links } to React Flow { nodes, edges }
  const initialNodes = useMemo(() => {
    if (!data?.nodes) return [];
    
    // Distribute nodes in a structured left-to-right hierarchy instead of random balls
    const nodes = data.nodes.map((n: any, i: number) => {
      // Very basic static layout: 
      // Main entity on left (x=100, y=300)
      // Connected entities fanning out to the right (x=500, y=i*100)
      const isMain = i === 0;
      return {
        id: n.id,
        position: { x: isMain ? 100 : 500, y: isMain ? 300 : i * 100 },
        data: { label: `${n.label}\n(${n.group})` },
        style: {
          background: isMain ? '#ffffff' : '#000000',
          color: isMain ? '#000000' : '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: isMain ? 'bold' : 'normal',
          boxShadow: isMain ? '0 0 20px rgba(255,255,255,0.4)' : 'none'
        }
      };
    });
    return nodes;
  }, [data]);

  const initialEdges = useMemo(() => {
    if (!data?.links) return [];
    return data.links.map((l: any, i: number) => ({
      id: `e${i}`,
      source: l.source,
      target: l.target,
      label: l.label,
      animated: true,
      style: { stroke: 'rgba(255,255,255,0.4)', strokeWidth: 1.5 },
      labelStyle: { fill: '#a1a1aa', fontWeight: 700, fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#000000' }
    }));
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  );
}
