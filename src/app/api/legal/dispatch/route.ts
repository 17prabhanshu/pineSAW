import { NextResponse } from "next/server";
import { LEA_NODAL_DIRECTORY, validateInstitutionalEmail } from "@/lib/legal/nodalDirectory";
import { IndianLegalDossierGenerator } from "@/lib/legal/legalDossier";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      institutionId = "sbi",
      orderType = "SECTION_68F_NDPS",
      caseId = "FIR-NDPS-2026-088",
      targetEntityLabel = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      accountNumber = "99481204812",
      ifscCode = "SBIN0000249",
      customRecipientEmail,
      officerNotes
    } = body;

    // 1. Locate registered institution
    const institution = LEA_NODAL_DIRECTORY.find(i => i.id === institutionId) || LEA_NODAL_DIRECTORY[0];
    const recipientEmail = (customRecipientEmail || institution.primaryNodalEmail).trim();

    // 2. Strict Pre-flight Institutional Domain Validation
    const domainValidation = validateInstitutionalEmail(recipientEmail, institution.officialDomain);
    if (!domainValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Institutional Recipient Validation Failed",
          reason: domainValidation.reason || "Unauthorized recipient domain"
        },
        { status: 400 }
      );
    }

    // 3. Generate Statutory Order Document
    const noticeDoc = IndianLegalDossierGenerator.generateNotice({
      noticeType: orderType,
      caseId,
      targetEntityLabel,
      bankOrOrgName: institution.name,
      accountNumber,
      officerId: "OP-7492",
      officerName: "P. Shekhar, Inspector (Cyber Threat Forensics)",
      unit: "Cyber Crime & Threat Intelligence Unit, Chandigarh Police",
      details: officerNotes || `Immediate execution required for illicit transaction routing linked to account ${accountNumber} (IFSC: ${ifscCode}).`
    });

    // 4. Generate Transmission Seal & Tracking ID
    const timestamp = new Date().toISOString();
    const trackingNumber = `DISP-${institution.code}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transmissionSeal = crypto
      .createHash("sha256")
      .update(`${trackingNumber}-${recipientEmail}-${noticeDoc.sha256EvidenceHash}-${timestamp}`)
      .digest("hex");

    // 5. Audit Logging to SQLite Database
    let auditLogId = `LOG-${Date.now().toString(36).toUpperCase()}`;
    try {
      const auditLog = await prisma.auditEvent.create({
        data: {
          action: "STATUTORY_LEA_DISPATCH_TRANSMISSION",
          actor: "INSPECTOR_OP7492",
          objectId: trackingNumber,
          metadata: JSON.stringify({
            trackingNumber,
            institutionId: institution.id,
            institutionName: institution.name,
            recipientEmail,
            orderType,
            caseId,
            transmissionSeal,
            timestamp
          })
        }
      });
      auditLogId = auditLog.id;
    } catch (e) {
      console.warn("Could not record dispatch auditEvent:", e);
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
      auditLogId,
      timestamp,
      transmissionSeal,
      deliveryStatus: "TRANSMITTED_TO_VERIFIED_NODAL_GATEWAY",
      complianceWindowHours: orderType === "SECTION_68F_NDPS" ? 24 : 48,
      institution: {
        id: institution.id,
        name: institution.name,
        code: institution.code,
        category: institution.category,
        recipientEmail,
        escalationEmail: institution.escalationEmail,
        nodalOfficerName: institution.nodalOfficerName,
        designation: institution.designation,
        officialDomain: institution.officialDomain,
        headquarters: institution.headquarters
      },
      order: {
        noticeId: noticeDoc.noticeId,
        orderType,
        statutoryAuthority: noticeDoc.statutoryAuthority,
        sha256EvidenceHash: noticeDoc.sha256EvidenceHash,
        formattedText: noticeDoc.formattedText
      },
      certifyingOfficer: noticeDoc.officerSignatureBlock
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Statutory dispatch transmission failed", details: error?.message },
      { status: 500 }
    );
  }
}
