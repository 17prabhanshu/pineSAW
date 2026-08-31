import { NextResponse } from "next/server";
import { DarknetNLPExtractor } from "@/lib/nlp/slangExtractor";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, autoIngest } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text payload" }, { status: 400 });
    }

    // Run Cambridge iCrime NLP Extraction
    const parsed = DarknetNLPExtractor.parse(text);

    // If autoIngest is requested, persist new entities/alerts to database
    let createdEntities: any[] = [];
    if (autoIngest && parsed.isIllicitListing) {
      for (const crypto of parsed.identifiers.cryptoAddresses) {
        const ent = await prisma.entity.upsert({
          where: { id: `WALLET-${crypto.address.substring(0, 12)}` },
          update: {},
          create: {
            id: `WALLET-${crypto.address.substring(0, 12)}`,
            type: "WALLET",
            label: `${crypto.address} (${crypto.network})`,
            confidence: 0.95,
            priorityScore: parsed.threatLevel === "CRITICAL" ? 85 : 70,
            riskFactors: JSON.stringify(["Extracted from live darknet feed", `${parsed.threatLevel} threat tier`])
          }
        });
        createdEntities.push(ent);
      }

      for (const comm of parsed.identifiers.communicationHandles) {
        const ent = await prisma.entity.upsert({
          where: { id: `HANDLE-${comm.handle}` },
          update: {},
          create: {
            id: `HANDLE-${comm.handle}`,
            type: "IDENTIFIER",
            label: `${comm.handle} (${comm.platform})`,
            confidence: 0.92,
            priorityScore: 65,
            riskFactors: JSON.stringify(["Unencrypted contact vector extracted from darknet listing"])
          }
        });
        createdEntities.push(ent);
      }

      // Create an alert
      if (parsed.narcotics.length > 0) {
        await prisma.alert.create({
          data: {
            type: "NEW_LISTING",
            severity: parsed.threatLevel,
            title: `High-Risk Drug Listing Intercepted: ${parsed.narcotics[0].standardizedName}`,
            description: `Extracted quantity: ${parsed.narcotics[0].extractedQuantity || "Unspecified bulk"} | Slang detected: "${parsed.narcotics[0].detectedSlang}"`,
            status: "UNREAD"
          }
        });
      }
    }

    return NextResponse.json({
      parsed,
      autoIngested: autoIngest ? createdEntities.length : 0,
      createdEntities
    });
  } catch (err: any) {
    console.error("NLP Parse API error:", err);
    return NextResponse.json({ error: err.message || "Failed to process text" }, { status: 500 });
  }
}
