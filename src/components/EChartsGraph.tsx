"use client";
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

export function EChartsGraph({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const [option, setOption] = useState<any>({});

  useEffect(() => {
    if (!data || !data.nodes) return;

    // Map your custom groups to colors
    const groupColors: Record<string, string> = {
      'ACTOR': '#002244',
      'BANK_ACCOUNT': '#047857',
      'WALLET': '#D97706',
      'IDENTIFIER': '#2563EB',
      'LISTING': '#DC2626'
    };

    const nodes = data.nodes.map((n: any) => ({
      id: n.id,
      name: n.label || n.id,
      symbolSize: n.group === 'ACTOR' ? 35 : n.group === 'WALLET' ? 25 : 20,
      itemStyle: {
        color: groupColors[n.group] || '#64748B',
        borderColor: '#ffffff33',
        borderWidth: 1
      },
      // You can store raw data here if you want it on click
      raw: n
    }));

    const links = data.links.map((l: any) => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      lineStyle: {
        width: 1.5,
        color: 'rgba(148, 163, 184, 0.4)',
        curveness: 0.2
      }
    }));

    const newOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#3f3f46',
        textStyle: {
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 12
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const r = params.data.raw;
            return `
              <div style="font-weight:bold;margin-bottom:4px;color:#0ea5e9;">${r.label || r.id}</div>
              <div style="font-size:10px;color:#a1a1aa;">Group: ${r.group}</div>
            `;
          }
          return null;
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            color: '#e4e4e7',
            fontSize: 10,
            fontFamily: 'Space Grotesk'
          },
          force: {
            repulsion: 200,
            edgeLength: 120,
            gravity: 0.1
          },
          lineStyle: {
            color: 'source',
            curveness: 0.1
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 3,
              color: '#0ea5e9'
            },
            itemStyle: {
              borderColor: '#0ea5e9',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: '#0ea5e9'
            }
          }
        }
      ]
    };

    setOption(newOption);
  }, [data]);

  const onEvents = {
    click: (e: any) => {
      if (e.dataType === 'node' && onNodeClick) {
        onNodeClick(e.data.raw);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <ReactECharts 
        option={option} 
        style={{ width: '100%', height: '100%' }} 
        onEvents={onEvents}
        theme="dark"
      />
    </div>
  );
}
