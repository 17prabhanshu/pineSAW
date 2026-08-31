import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      entities: { include: { entity: true } },
      evidence: true,
      notes: true,
      actionItems: true
    }
  });
  
  if (!investigation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json(investigation);
}
