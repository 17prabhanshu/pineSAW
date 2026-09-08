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

    // Run Python FastAPI Backend Extraction
    // Fallback to local NLP if backend is unreachable
    let parsed: any;
    try {
      const pyRes = await fetch("http://127.0.0.1:8000/api/parse_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "testkey123"
        },
        body: JSON.stringify({ text })
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        
        // Map Python output to Next.js expected format
        const isIllicit = pyData.classification.is_suspicious;
        const confidenceScore = pyData.classification.anomaly_score;
        let threatLevel = "LOW";
        if (confidenceScore > 0.8) threatLevel = "CRITICAL";
        else if (confidenceScore > 0.6) threatLevel = "HIGH";
        else if (confidenceScore > 0.4) threatLevel = "MEDIUM";

        // Map GLiNER entities
        const narcotics = pyData.entities
          .filter((e: any) => e.type === "product" || e.type === "substance" || pyData.classification.matches.includes(e.value.toLowerCase()))
          .map((e: any) => ({
            substanceClass: "UNKNOWN",
            detectedSlang: e.value,
            standardizedName: e.value,
            confidence: e.confidence
          }));
          
        // Add exact keyword matches from Python classifier if missed by GLiNER
        for (const match of pyData.classification.matches) {
           if (!narcotics.find((n: any) => n.detectedSlang.toLowerCase() === match)) {
             narcotics.push({
               substanceClass: "UNKNOWN",
               detectedSlang: match,
               standardizedName: match.toUpperCase(),
               confidence: 0.9
             });
           }
        }

        const cryptoAddresses = pyData.entities
          .filter((e: any) => e.type === "wallet")
          .map((e: any) => ({ address: e.value, network: "UNKNOWN" }));
          
        const communicationHandles = pyData.entities
          .filter((e: any) => e.type === "contact_handle")
          .map((e: any) => ({ platform: "UNKNOWN", handle: e.value }));

        parsed = {
          textSnippet: text.substring(0, 100),
          isIllicitListing: isIllicit,
          threatLevel,
          narcotics,
          identifiers: {
            cryptoAddresses,
            pgpKeyBlocks: [],
            communicationHandles
          },
          confidenceScore,
          extractedAt: new Date().toISOString(),
          chainTraces: pyData.chain_traces // added chainalysis tracking!
        };
      } else {
        throw new Error("Python backend failed");
      }
    } catch (e) {
      console.warn("Falling back to local TS extractor:", e);
      parsed = DarknetNLPExtractor.parse(text);
    }

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
