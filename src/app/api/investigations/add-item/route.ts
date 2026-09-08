import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { kafkaService, KAFKA_TOPICS } from '@/lib/kafka/kafkaClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      investigationId, 
      createNewCase, 
      caseId: customCaseId, 
      title, 
      priority = "HIGH", 
      investigator = "OP-7492 (Cyber Crime Unit)", 
      category = "Digital Intercept / OSINT", 
      noteContent, 
      item 
    } = body;

    if (!item || (!item.text && !item.source && !item.url)) {
      return NextResponse.json({ error: "Missing required intercept item data" }, { status: 400 });
    }

    // 1. Generate SHA-256 Cryptographic Digest (Sec 63 BSA / 65B IEA Admissibility)
    const rawPayloadToHash = `${item.text || ""}|${item.url || item.source || ""}|${item.timestamp || new Date().toISOString()}`;
    const sha256 = crypto.createHash('sha256').update(rawPayloadToHash).digest('hex');

    let targetInvestigation: any = null;

    // 2. Either find existing case or create a new case
    if (investigationId && !createNewCase) {
      targetInvestigation = await prisma.investigation.findUnique({
        where: { id: investigationId },
        include: { entities: true }
      });
      if (!targetInvestigation) {
        // Try finding by caseId if UUID not matched
        targetInvestigation = await prisma.investigation.findUnique({
          where: { caseId: investigationId },
          include: { entities: true }
        });
      }
    }

    if (!targetInvestigation) {
      // Create new investigation case
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedCaseId = customCaseId?.trim() 
        ? customCaseId.trim().toUpperCase() 
        : `INV-2026-${randomNum}`;

      const generatedTitle = title?.trim() 
        ? title.trim() 
        : item.sender 
        ? `${item.sender} Intelligence Intercept` 
        : item.source?.includes("reddit") 
        ? "Reddit Narcotics & Illicit Chatter Case" 
        : "Digital Intercept & Intelligence Lead";

      targetInvestigation = await prisma.investigation.create({
        data: {
          caseId: generatedCaseId,
          title: generatedTitle,
          status: "OPEN",
          priority: (priority as any) || "HIGH",
          investigator: investigator || "OP-7492",
          confidence: Math.min(0.98, Math.max(0.75, (item.priorityScore || 80) / 100)),
        },
        include: { entities: true }
      });
    }

    // 3. Find or Create Entity from Intercept (Platform, Actor, or Channel)
    let linkedEntityId: string | null = null;
    const entityLabel = (item.sender || item.channel || (item.source?.includes("reddit") ? "Reddit r/interesting" : "Harvester Stream Intercept")).trim();
    
    if (entityLabel) {
      try {
        let entity = await prisma.entity.findFirst({
          where: { label: entityLabel }
        });

        if (!entity) {
          const entityType = entityLabel.startsWith("@") 
            ? "ACCOUNT" 
            : item.source?.includes("reddit") || item.source?.includes("pastebin") 
            ? "PLATFORM" 
            : "ACTOR";

          entity = await prisma.entity.create({
            data: {
              label: entityLabel,
              type: entityType,
              confidence: 0.90,
              priorityScore: Math.min(100, Math.max(50, item.priorityScore || 75)),
              riskFactors: JSON.stringify([
                `Ingested via live intelligence harvester`,
                `Threat Tier: ${item.threatLevel || "MEDIUM"}`,
                `Source: ${item.source || item.url || "Web"}`
              ])
            }
          });
        }

        linkedEntityId = entity.id;

        // Associate Entity with Investigation
        const existingLink = await prisma.investigationEntity.findUnique({
          where: {
            investigationId_entityId: {
              investigationId: targetInvestigation.id,
              entityId: entity.id
            }
          }
        });

        if (!existingLink) {
          await prisma.investigationEntity.create({
            data: {
              investigationId: targetInvestigation.id,
              entityId: entity.id
            }
          });
        }
      } catch (e) {
        console.warn("Entity link warning (handled):", e);
      }
    }

    // 4. Create Forensic Evidence Record
    const evidenceDescription = `[${(item.threatLevel || "INFORMATIONAL").toUpperCase()} THREAT] Intercepted from ${item.source || item.url || "Clearweb / Darknet Source"}:\n\n"${item.text || item.title || "No body content"}"\n\n[SHA-256 EVIDENCE DIGEST]: ${sha256}\n[STATUTORY ADMISSIBILITY]: Section 63 Bharatiya Sakshya Adhiniyam / Section 65B Indian Evidence Act`;

    const evidence = await prisma.evidence.create({
      data: {
        type: "DIGITAL_INTERCEPT",
        source: item.url || item.source || item.channel || "Intelligence Harvester",
        description: evidenceDescription,
        confidence: Math.min(0.99, Math.max(0.70, (item.priorityScore || 85) / 100)),
        investigationId: targetInvestigation.id,
        entityId: linkedEntityId || undefined
      }
    });

    // 5. Create Investigator Case Note
    const defaultNote = `Forensic intercept packet dispatched to Case ${targetInvestigation.caseId} from ${item.source || "Ingestion Harvester"}. Threat rating: ${item.threatLevel || "MEDIUM"} (Priority ${item.priorityScore || 70}/100). Cryptographic hash ${sha256.substring(0, 16)}... registered into chain of custody.`;
    
    const note = await prisma.note.create({
      data: {
        content: (noteContent && noteContent.trim()) ? noteContent.trim() : defaultNote,
        author: investigator || "OP-7492",
        investigationId: targetInvestigation.id,
        entityId: linkedEntityId || undefined
      }
    });

    // 6. Update Investigation timestamp
    await prisma.investigation.update({
      where: { id: targetInvestigation.id },
      data: { updatedAt: new Date() }
    });

    // 7. Audit Event
    try {
      await prisma.auditEvent.create({
        data: {
          action: "INTERCEPT_ATTACHED_TO_INVESTIGATION",
          actor: investigator || "OP-7492",
          objectId: targetInvestigation.caseId,
          metadata: JSON.stringify({
            evidenceId: evidence.id,
            sha256,
            source: item.source || item.url,
            threatLevel: item.threatLevel
          })
        }
      });
    } catch (e) {
      console.warn("Audit logging warning:", e);
    }

    // 8. Publish Chain of Custody to Apache Kafka
    try {
      await kafkaService.publish(
        KAFKA_TOPICS.CHAIN_OF_CUSTODY,
        {
          action: "EVIDENCE_ATTACHED_TO_CASE",
          caseId: targetInvestigation.caseId,
          investigationId: targetInvestigation.id,
          evidenceId: evidence.id,
          sha256,
          source: item.source || item.url,
          timestamp: new Date().toISOString(),
          examiner: investigator || "OP-7492",
          statutoryProvision: "Section 63 BSA / Section 65B IEA"
        },
        "pineSAW Ingestion Harvester"
      );
    } catch (e) {
      console.warn("Kafka event bus publication warning:", e);
    }

    // Return the enriched investigation
    const fullInvestigation = await prisma.investigation.findUnique({
      where: { id: targetInvestigation.id },
      include: {
        entities: { include: { entity: true } },
        evidence: true,
        notes: true,
        actionItems: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added to Case ${targetInvestigation.caseId}`,
      investigation: fullInvestigation,
      evidence,
      note,
      sha256
    });

  } catch (err: any) {
    console.error("Failed to add intercept to investigation:", err);
    return NextResponse.json({ error: err.message || "Failed to add intercept to investigation" }, { status: 500 });
  }
}
