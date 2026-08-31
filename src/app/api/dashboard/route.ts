import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const entityCount = await prisma.entity.count();
  const alertCount = await prisma.alert.count({ where: { status: 'UNREAD' }});
  const investigationCount = await prisma.investigation.count({ where: { status: 'OPEN' }});
  const recentAlerts = await prisma.alert.findMany({ take: 5, orderBy: { createdAt: 'desc' }});
  const topEntities = await prisma.entity.findMany({ take: 5, orderBy: { priorityScore: 'desc' }});

  return NextResponse.json({
    metrics: { entityCount, alertCount, investigationCount },
    recentAlerts,
    topEntities
  });
}
