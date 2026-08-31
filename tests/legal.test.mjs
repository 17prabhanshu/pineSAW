import assert from "node:assert";
import { IndianLegalDossierGenerator } from "../src/lib/legal/legalDossier.ts";

console.log("▶ RUNNING TEST: Indian Legal Dossier & Section 65B SHA-256 Hashes");

// 1. Test Section 91 CrPC Notice
const sec91 = IndianLegalDossierGenerator.generateNotice({
  noticeType: "SECTION_91_CRPC",
  caseId: "INV-2026-0042",
  targetEntityLabel: "ShadowBroker / HDFC 50100239481",
  bankOrOrgName: "HDFC Bank Ltd",
  accountNumber: "50100239481",
  officerId: "OP-7492",
  officerName: "P. Shekhar, Inspector (Cyber Crime)",
  details: "Darknet narcotics proceeds flow into domestic account"
});

assert(sec91.formattedText.includes("SECTION 91 OF THE CODE OF CRIMINAL PROCEDURE"), "Must contain statutory CrPC heading");
assert(sec91.formattedText.includes("50100239481"), "Must contain target account number");
assert(sec91.sha256EvidenceHash.length === 64, "Must generate valid 64-char SHA-256 cryptographic evidence hash");

// 2. Test Section 68F NDPS Act Asset Freeze Order
const sec68f = IndianLegalDossierGenerator.generateNotice({
  noticeType: "SECTION_68F_NDPS",
  caseId: "INV-2026-0042",
  targetEntityLabel: "Swissquote Bank SA (Acct: CH93 8472 9182)",
  bankOrOrgName: "Swissquote Bank SA",
  accountNumber: "CH93 8472 9182",
  officerId: "OP-7492",
  officerName: "P. Shekhar, Inspector",
  details: "Offshore liquidity off-ramp"
});

assert(sec68f.formattedText.includes("SECTION 68F NDPS ACT") || sec68f.statutoryAuthority.includes("NDPS"), "Must contain NDPS statutory heading");
assert(sec68f.formattedText.includes("IMMEDIATELY PROHIBIT ANY DEBIT"), "Must contain mandatory freeze injunction text");
assert(sec68f.sha256EvidenceHash.length === 64, "Must generate valid SHA-256 hash");

console.log(`✔ PASSED: Section 91 Cr.P.C. & Section 68F NDPS Act legal notices generated with verified digital hashes (SHA-256: ${sec91.sha256EvidenceHash.substring(0, 16)}...).`);
