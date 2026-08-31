import fs from 'fs'
import path from 'path'

const apis = {
  'dashboard': `import { NextResponse } from 'next/server';
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
`,
  'investigations': `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const investigations = await prisma.investigation.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(investigations);
}
`,
  'entities': `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q');
  
  let where = {};
  if (search) {
    where = {
      label: { contains: search }
    };
  }

  const entities = await prisma.entity.findMany({
    where,
    take: 50,
    orderBy: { priorityScore: 'desc' }
  });
  
  return NextResponse.json(entities);
}
`,
  'entities/[id]': `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  const id = params.id;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      sourceRelations: { include: { target: true } },
      targetRelations: { include: { source: true } },
      events: { orderBy: { timestamp: 'desc' }, take: 20 },
      investigations: { include: { investigation: true } }
    }
  });
  
  if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(entity);
}
`,
  'graph': `import { NextResponse } from 'next/server';
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
`,
  'alerts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return NextResponse.json(alerts);
}
`,
  'search': `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json({ results: [] });

  const entities = await prisma.entity.findMany({
    where: { label: { contains: q } },
    take: 20
  });
  
  const investigations = await prisma.investigation.findMany({
    where: { title: { contains: q } },
    take: 10
  });

  return NextResponse.json({ entities, investigations });
}
`
}

for (const [route, code] of Object.entries(apis)) {
  const filepath = path.join(process.cwd(), 'src/app/api', route, 'route.ts');
  fs.writeFileSync(filepath, code);
}
console.log('API routes generated');
