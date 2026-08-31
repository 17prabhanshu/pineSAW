import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const entities = await prisma.entity.findMany({ take: 300 });
  const entityIds = entities.map(e => e.id);
  
  const relationships = await prisma.relationship.findMany({
    where: {
      sourceId: { in: entityIds },
      targetId: { in: entityIds }
    }
  });

  const nodes = entities.map(e => ({
    id: e.id,
    label: e.label,
    group: e.type,
    val: e.priorityScore > 0 ? (e.priorityScore / 10) : 1
  }));
  
  const links = relationships.map(r => ({
    source: r.sourceId,
    target: r.targetId,
    label: r.type,
    color: 'rgba(255,255,255,0.2)'
  }));

  return NextResponse.json({ nodes, links });
}
