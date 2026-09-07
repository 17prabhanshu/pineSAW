import re

with open('src/app/entities/[id]/page.tsx', 'r') as f:
    content = f.read()

graph_logic = """
  const graphData = entity ? {
    nodes: [
      { id: entity.id, label: entity.label, group: entity.type, priorityScore: entity.priorityScore },
      ...(entity.sourceRelations || []).map((r: any) => ({ id: r.target.id, label: r.target.label, group: r.target.type, priorityScore: r.target.priorityScore })),
      ...(entity.targetRelations || []).map((r: any) => ({ id: r.source.id, label: r.source.label, group: r.source.type, priorityScore: r.source.priorityScore }))
    ],
    links: [
      ...(entity.sourceRelations || []).map((r: any) => ({ source: entity.id, target: r.target.id, label: r.type })),
      ...(entity.targetRelations || []).map((r: any) => ({ source: r.source.id, target: entity.id, label: r.type }))
    ]
  } : { nodes: [], links: [] };

  if (!entity) return <div"""

content = content.replace('  if (!entity) return <div', graph_logic)
content = content.replace('<NetworkGraph />', '<NetworkGraph data={graphData} />')

with open('src/app/entities/[id]/page.tsx', 'w') as f:
    f.write(content)
