import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function GET() {
  const actions = await prisma.actionItem.findMany({
    include: { Entity: true, Investigation: true },
    orderBy: { priority: "desc" }
  });
  return NextResponse.json(actions);
}
