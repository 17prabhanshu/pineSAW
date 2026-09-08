import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const investigations = await prisma.investigation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      entities: { include: { entity: true } },
      actionItems: true,
      notes: true,
      evidence: true
    }
  });
  return NextResponse.json(investigations);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, priority, investigator, primaryEntityId, initialNote, category } = body;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = body.caseId?.trim() ? body.caseId.trim().toUpperCase() : `INV-2026-${randomNum}`;

    const newCase = await prisma.investigation.create({
      data: {
        caseId,
        title: title || "Untitled Narcotics Syndicate Investigation",
        priority: priority || "HIGH",
        status: "OPEN",
        investigator: investigator || "OP-7492",
        confidence: 0.88,
        entities: primaryEntityId ? {
          create: [{ entityId: primaryEntityId }]
        } : undefined,
        notes: initialNote ? {
          create: [{
            content: initialNote,
            author: investigator || "OP-7492"
          }]
        } : undefined,
        evidence: {
          create: [{
            type: "INTELLIGENCE_DISPATCH",
            source: category || "Darknet Ingestion Node",
            description: `Initial intelligence dossier generated for case ${caseId}. Preliminary lead flagged by automated ingestion pipeline.`,
            confidence: 0.85
          }]
        }
      },
      include: {
        entities: { include: { entity: true } }
      }
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create investigation:", err);
    return NextResponse.json({ error: err.message || "Failed to create investigation" }, { status: 500 });
  }
}
