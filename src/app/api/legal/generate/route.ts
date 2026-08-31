import { NextResponse } from "next/server";
import { IndianLegalDossierGenerator, LegalNoticeRequest } from "@/lib/legal/legalDossier";

export async function POST(request: Request) {
  try {
    const body: LegalNoticeRequest = await request.json();
    if (!body.caseId || !body.targetEntityLabel || !body.bankOrOrgName) {
      return NextResponse.json({ error: "Missing required legal notice fields (caseId, targetEntityLabel, bankOrOrgName)" }, { status: 400 });
    }

    const document = IndianLegalDossierGenerator.generateNotice(body);
    return NextResponse.json(document);
  } catch (err: any) {
    console.error("Legal generation API error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate legal notice" }, { status: 500 });
  }
}
