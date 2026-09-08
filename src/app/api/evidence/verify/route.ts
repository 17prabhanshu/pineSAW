import { NextResponse } from "next/server";
import { DigitalAdmissibilityEngine } from "@/lib/legal/admissibilityEngine";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      exhibitId = "EXHIBIT-NDPS-2026-001",
      caseId = "FIR-NDPS-2026-088",
      rawPayload = "Telegram raw message intercept #8812 payload data",
      expectedSha256,
      generateCertificate = true
    } = body;

    const { sha256, md5 } = DigitalAdmissibilityEngine.computeDigests(rawPayload);
    const targetHash = expectedSha256 || sha256;
    const verification = DigitalAdmissibilityEngine.verifyIntegrity(rawPayload, targetHash);

    // Audit log this evidentiary verification in database
    let auditLogId = `EV-AUDIT-${Date.now().toString(36).toUpperCase()}`;
    try {
      const log = await prisma.auditEvent.create({
        data: {
          action: "EVIDENCE_CRYPTOGRAPHIC_VERIFICATION",
          actor: "DARKINT_FORENSICS_OP7492",
          objectId: exhibitId,
          metadata: JSON.stringify({
            exhibitId,
            caseId,
            sha256,
            md5,
            isValid: verification.isValid,
            timestamp: new Date().toISOString()
          })
        }
      });
      auditLogId = log.id;
    } catch (e) {
      console.warn("Could not write auditEvent for evidence verify:", e);
    }

    let certificate = null;
    if (generateCertificate) {
      certificate = DigitalAdmissibilityEngine.generateCertificate({
        exhibitId,
        caseId,
        sourceType: "TELEGRAM_INTERCEPT",
        sourceIdentifier: "t.me/ice_chd",
        captureTimestamp: new Date().toISOString(),
        rawPayload,
        sha256Hash: sha256,
        md5Hash: md5,
        custodianBadge: "OP-7492",
        custodianName: "P. Shekhar",
        jurisdiction: "Cyber Crime Police Station, Sector 17, Chandigarh",
        acquisitionDevice: "CHDPOL-DARKINT-NODE-04",
        acquisitionTool: "DARKINT Intercept Core v2.4 (Lacus / FAISS 1.10.0)"
      });
    }

    return NextResponse.json({
      success: true,
      verified: verification.isValid,
      tamperDetected: verification.tamperDetected,
      calculatedSha256: sha256,
      calculatedMd5: md5,
      expectedSha256: targetHash,
      auditLogId,
      timestamp: new Date().toISOString(),
      statutoryStandard: "Section 63 BSA 2023 / Section 65B IEA 1872",
      certificate
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Evidence verification failed", details: error?.message },
      { status: 500 }
    );
  }
}
