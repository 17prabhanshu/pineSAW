import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
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
