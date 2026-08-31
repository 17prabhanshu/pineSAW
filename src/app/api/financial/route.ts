import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function GET() {
  const accounts = await prisma.entity.findMany({
    where: { type: { in: ["BANK_ACCOUNT", "WALLET", "ACCOUNT"] } },
    include: { sourceRelations: { include: { source: true, target: true } }, targetRelations: { include: { source: true, target: true } } },
    orderBy: { priorityScore: "desc" }
  });
  return NextResponse.json(accounts);
}
