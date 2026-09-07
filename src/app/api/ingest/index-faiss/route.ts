import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entities } = body;

    if (!Array.isArray(entities) || entities.length === 0) {
      return NextResponse.json({ error: "Missing or empty entities array" }, { status: 400 });
    }

    let indexedCount = 0;
    const errors: string[] = [];

    for (const ent of entities.slice(0, 30)) {
      try {
        const payload = {
          id: `EXTRACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          label: ent.value || ent.label || "Unknown Entity",
          type: ent.type || ent.category || "LISTING",
          text: `${ent.value} [${ent.category || "THREAT"}] ${ent.meta || ""}`,
          riskFactors: `Risk Tier: ${ent.risk || "HIGH"} · Engine: ${ent.engine || "NER"}`,
          priorityScore: ent.risk === "CRITICAL" ? 90 : ent.risk === "HIGH" ? 75 : 55
        };

        // 1. Send to live FAISS daemon
        try {
          const faissRes = await fetch("http://127.0.0.1:5055/index", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (faissRes.ok) {
            indexedCount++;
          }
        } catch {
          // Daemon might be offline; continue database record
        }

        // 2. Persist to SQLite Entity table
        await prisma.entity.upsert({
          where: { id: payload.id },
          update: {},
          create: {
            id: payload.id,
            type: payload.type === "DARKNET VENDOR" ? "ACTOR" : payload.type === "TOR HIDDEN SERVICE" ? "PLATFORM" : "IDENTIFIER",
            label: payload.label,
            confidence: 0.94,
            priorityScore: payload.priorityScore,
            riskFactors: JSON.stringify([payload.riskFactors])
          }
        });
      } catch (e: any) {
        errors.push(e.message);
      }
    }

    return NextResponse.json({
      success: true,
      indexedCount,
      totalSubmitted: entities.length,
      errors: errors.length > 0 ? errors.slice(0, 3) : undefined
    });
  } catch (err: any) {
    console.error("FAISS Ingest API error:", err);
    return NextResponse.json({ error: err.message || "Failed to index entities" }, { status: 500 });
  }
}
