"use client";
import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export function IntelligenceFlowchart({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const [option, setOption] = useState<any>({});

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    // Advanced, sleek color palette for OSINT
    const groupStyles: Record<string, { color: string, border: string }> = {
      'ACTOR': { color: 'rgba(14, 165, 233, 0.8)', border: '#0ea5e9' },          // Sky blue
      'BANK_ACCOUNT': { color: 'rgba(16, 185, 129, 0.8)', border: '#10b981' }, // Emerald
      'WALLET': { color: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },       // Amber
      'IDENTIFIER': { color: 'rgba(168, 85, 247, 0.8)', border: '#a855f7' },   // Purple
      'LISTING': { color: 'rgba(239, 68, 68, 0.8)', border: '#ef4444' }        // Red
    };

    const nodes = data.nodes.map((n: any) => {
      const style = groupStyles[n.group] || { color: 'rgba(100, 116, 139, 0.8)', border: '#94a3b8' };
      const size = n.group === 'ACTOR' ? 38 : n.group === 'WALLET' ? 28 : 22;
      
      return {
        id: n.id,
        name: n.label || n.id,
        symbolSize: size,
        itemStyle: {
          color: style.color,
          borderColor: style.border,
          borderWidth: 1.5,
          shadowBlur: 15,
          shadowColor: style.border
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#e4e4e7',
          fontSize: 11,
          fontFamily: '"Space Grotesk", monospace',
          textBorderColor: 'rgba(0,0,0,0.8)',
          textBorderWidth: 3,
        },
        // Store raw node data for click events
        raw: n
      };
    });

    const links = data.links.map((l: any) => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      value: l.value || 1,
      lineStyle: {
        width: 1.5,
        color: 'rgba(255, 255, 255, 0.15)',
        curveness: 0.15
      }
    }));

    const newOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontFamily: '"Space Grotesk", monospace',
          fontSize: 12
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const r = params.data.raw;
            const style = groupStyles[r.group] || { border: '#fff' };
            return `
              <div style="font-weight:700;margin-bottom:4px;color:${style.border};letter-spacing:0.05em">${r.group}</div>
              <div style="font-size:14px;color:#fff;">${r.label || r.id}</div>
              ${r.priorityScore ? `<div style="margin-top:6px;font-size:11px;color:#a1a1aa">Risk Priority: <span style="color:#fff">${r.priorityScore}</span></div>` : ''}
            `;
          }
          return null;
        }
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          force: {
            repulsion: 400,
            edgeLength: 150,
            gravity: 0.05,
            friction: 0.1
          },
          emphasis: {
            focus: 'adjacency',
            scale: true,
            lineStyle: {
              width: 3,
              color: '#ffffff'
            },
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 20
            }
          }
        }
      ]
    };

    setOption(newOption);
  }, [data]);

  const onEvents = useMemo(() => ({
    click: (e: any) => {
      if (e.dataType === 'node' && onNodeClick) {
        onNodeClick(e.data.raw);
      }
    }
  }), [onNodeClick]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background styling for a deep, slick look */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, #18181b 0%, #000000 100%)',
        zIndex: -1
      }} />
      <ReactECharts 
        option={option} 
        style={{ width: '100%', height: '100%' }} 
        onEvents={onEvents}
        notMerge={true}
      />
    </div>
  );
}
