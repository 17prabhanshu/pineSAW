import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
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
