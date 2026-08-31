import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      sourceRelations: { include: { target: true } },
      targetRelations: { include: { source: true } },
      events: { orderBy: { timestamp: 'desc' }, take: 20 },
      investigations: { include: { investigation: true } },
      notes: { orderBy: { createdAt: 'desc' } },
      evidence: { orderBy: { createdAt: 'desc' } },
      legalReferences: true
    }
  });
  
  if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(entity);
}
