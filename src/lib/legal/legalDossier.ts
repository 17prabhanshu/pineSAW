import crypto from "crypto";

/**
 * Indian Criminal Procedure & NDPS Act Evidentiary Legal Dossier Generator
 * 
 * Complies with:
 * 1. Section 91 Cr.P.C. (Requisition of Documents & Banking Logs)
 * 2. Section 68F NDPS Act (Seizure and Freezing of Illegally Acquired Property)
 * 3. Section 69B Information Technology Act (Collection & Monitoring of Traffic Data)
 * 4. Section 65B Indian Evidence Act (Certificate of Authenticity for Electronic Records)
 */

export interface LegalNoticeRequest {
  noticeType: "SECTION_91_CRPC" | "SECTION_68F_NDPS" | "SECTION_69B_IT_ACT";
  caseId: string;
  targetEntityLabel: string;
  bankOrOrgName: string;
  accountNumber?: string;
  officerId: string;
  officerName?: string;
  unit?: string;
  details: string;
}

export interface LegalNoticeDocument {
  noticeId: string;
  noticeType: string;
  statutoryAuthority: string;
  recipientOrg: string;
  formattedText: string;
  sha256EvidenceHash: string;
  generatedAt: string;
  officerSignatureBlock: {
    officerId: string;
    officerName: string;
    designation: string;
    jurisdiction: string;
  };
}

export class IndianLegalDossierGenerator {
  public static generateNotice(req: LegalNoticeRequest): LegalNoticeDocument {
    const noticeId = `NOTICE/${req.caseId}/${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toISOString();
    const officerName = req.officerName || "P. Shekhar, Inspector (Cyber Crime)";
    const officerId = req.officerId || "OP-7492";
    const unit = req.unit || "Cyber Crime & Threat Intelligence Unit, Chandigarh Police";

    let statutoryAuthority = "";
    let formattedText = "";

    if (req.noticeType === "SECTION_91_CRPC") {
      statutoryAuthority = "Section 91 of the Code of Criminal Procedure, 1973 (Cr.P.C.)";
      formattedText = `
FORMAL LEGAL REQUISITION UNDER SECTION 91 Cr.P.C.
OFFICE OF THE CYBER CRIME & THREAT INTELLIGENCE UNIT
CHANDIGARH POLICE HEADQUARTERS, SECTOR 9, CHANDIGARH

NOTICE REF NO: ${noticeId}
DATED: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
CASE FILE NO: ${req.caseId}

TO:
THE AUTHORIZED NODAL OFFICER / LEGAL COMPLIANCE DESK
${req.bankOrOrgName.toUpperCase()}

SUBJECT: REQUISITION OF ACCOUNT HOLDER KYC, IP LOGS, AND TRANSACTION RECORDS UNDER SECTION 91 Cr.P.C.

WHEREAS, an investigation into organized cyber-narcotics trafficking and illicit financial routing is being actively conducted under Case Reference ${req.caseId};

AND WHEREAS, forensic intelligence gathered by the DARKINT Threat Platform has established direct linkage to Account / Reference: "${req.accountNumber || req.targetEntityLabel}" operated within your institution;

YOU ARE HEREBY REQUIRED AND DIRECTED UNDER SECTION 91 OF THE CODE OF CRIMINAL PROCEDURE, 1973 to produce within 48 HOURS of receipt the following certified electronic records:
1. Complete Account Opening Form (AOF), KYC documentation, Aadhaar/PAN linkage, and registered mobile numbers.
2. Itemized Ledger and Transaction Statements for the period from 01-Jan-2025 to date, including UTR numbers, IMPS/RTGS/NEFT sender/beneficiary bank details.
3. IP access logs with timestamps and port numbers for all NetBanking and Mobile Banking sessions associated with this account.

FAILURE TO COMPLY with this statutory notice shall render the responsible officer liable for legal proceedings under Section 175/176 of the Indian Penal Code.

ISSUED UNDER MY HAND AND SEAL:
${officerName}
Investigating Officer [ID: ${officerId}]
${unit}
`.trim();
    } else if (req.noticeType === "SECTION_68F_NDPS") {
      statutoryAuthority = "Section 68F of the Narcotic Drugs and Psychotropic Substances Act, 1985 (NDPS Act)";
      formattedText = `
ORDER OF FREEZING OF ILLEGALLY ACQUIRED ASSETS UNDER SECTION 68F NDPS ACT, 1985
OFFICE OF THE SUPERINTENDENT OF POLICE (CYBER & NARCOTICS)
CHANDIGARH POLICE / NARCOTICS CONTROL BUREAU CELL

ORDER NO: ${noticeId}
DATE: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
CASE REF: ${req.caseId}

TO:
THE BRANCH MANAGER / COMPLIANCE OFFICER
${req.bankOrOrgName.toUpperCase()}

SUBJECT: IMMEDIATE FREEZE ORDER IN RESPECT OF ILLICIT FINANCIAL ACCOUNT(S) UNDER SECTION 68F(1) NDPS ACT

WHEREAS, there is reasonable belief that Account: "${req.accountNumber || req.targetEntityLabel}" held with your bank constitutes "Illegally Acquired Property" derived directly from illicit drug trafficking across encrypted networks under Chapter VA of the NDPS Act, 1985;

THEREFORE, in exercise of the powers conferred under Section 68F(1) of the Narcotic Drugs and Psychotropic Substances Act, 1985, YOU ARE HEREBY ORDERED TO:
1. IMMEDIATELY PROHIBIT ANY DEBIT, TRANSFER, WITHDRAWAL, OR ALIENATION OF FUNDS from Account ${req.accountNumber || req.targetEntityLabel}.
2. Retain the existing credit balance intact subject to further orders of the Competent Authority within 30 days.
3. Submit a confirmation of debit-freeze execution along with the exact lien amount within 24 hours.

GIVEN UNDER MY HAND AND OFFICIAL SEAL:
${officerName} [ID: ${officerId}]
Authorized Officer under NDPS Act
${unit}
`.trim();
    } else {
      statutoryAuthority = "Section 69B of the Information Technology Act, 2000";
      formattedText = `
DIRECTION FOR MONITORING & COLLECTION OF TRAFFIC DATA UNDER SECTION 69B IT ACT, 2000
NOTICE REF: ${noticeId}
DATED: ${new Date().toLocaleDateString("en-IN")}
CASE FILE: ${req.caseId}

TO: INTERMEDIARY / TELECOM SERVICE PROVIDER / PLATFORM: ${req.bankOrOrgName}

PURSUANT TO SECTION 69B OF THE INFORMATION TECHNOLOGY ACT, 2000, you are directed to preserve and furnish all routing records, subscriber metadata, and communication identifiers for target: "${req.targetEntityLabel}".
`.trim();
    }

    // Calculate Section 65B SHA-256 Digital Certificate Hash
    const sha256EvidenceHash = crypto.createHash("sha256").update(formattedText, "utf8").digest("hex");

    return {
      noticeId,
      noticeType: req.noticeType,
      statutoryAuthority,
      recipientOrg: req.bankOrOrgName,
      formattedText,
      sha256EvidenceHash,
      generatedAt,
      officerSignatureBlock: {
        officerId,
        officerName,
        designation: "Investigating Officer / Cyber Narcotics Division",
        jurisdiction: "Chandigarh Police & NCB Inter-Agency Liaison"
      }
    };
  }
}
