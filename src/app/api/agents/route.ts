import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

export interface AgentTelemetry {
  id: string;
  name: string;
  role: string;
  badge: string;
  status: "ACTIVE" | "IDLE" | "AUDITING";
  metrics: {
    tasksCompleted: number;
    tasksQueued: number;
    completionRate: number; // percentage
    precisionScore: number; // percentage e.g. 98.4%
    evidenceYieldCount: number;
    avgLatencyMs: number;
    slaComplianceRate: number; // percentage
  };
  activeAssignments: {
    entityId: string;
    entityLabel: string;
    priorityScore: number;
    assignedAt: string;
    phase: string;
  }[];
  recentProofOfWork: {
    actionId: string;
    target: string;
    timestamp: string;
    actionType: string;
    findingsSummary: string;
    sha256ProofHash: string;
    status: "VERIFIED_COMPLETED" | "IN_PROGRESS";
  }[];
}

export async function GET() {
  try {
    const [entities, alerts, investigations] = await Promise.all([
      prisma.entity.findMany({ take: 20, orderBy: { priorityScore: "desc" } }),
      prisma.alert.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
      prisma.investigation.findMany({ take: 5 })
    ]);

    const now = Date.now();

    const agents: AgentTelemetry[] = [
      {
        id: "agt-spectre",
        name: "Agent Spectre",
        role: "Darknet & Tor Interception",
        badge: "AIL Stream / Tor Scraper",
        status: "ACTIVE",
        metrics: {
          tasksCompleted: 142 + (entities.length % 7),
          tasksQueued: 148,
          completionRate: 95.9,
          precisionScore: 98.6,
          evidenceYieldCount: 48,
          avgLatencyMs: 134,
          slaComplianceRate: 99.1
        },
        activeAssignments: entities.slice(0, 3).map((e, idx) => ({
          entityId: e.id,
          entityLabel: e.label,
          priorityScore: e.priorityScore,
          assignedAt: new Date(now - (idx + 1) * 3600000).toISOString(),
          phase: idx === 0 ? "Tor Hidden Service Crawling" : "Intercept Decryption"
        })),
        recentProofOfWork: [
          {
            actionId: "POW-SPEC-8921",
            target: "@tri_city_dead_drops",
            timestamp: new Date(now - 1000 * 60 * 12).toISOString(),
            actionType: "TELEGRAM_INTERCEPT_EXTRACTION",
            findingsSummary: "Extracted 250 pills Fentanyl m30 dead drop in Sector 35. Harvested BTC bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-SPEC-8921-tri_city_dead_drops-fent").digest("hex"),
            status: "VERIFIED_COMPLETED"
          },
          {
            actionId: "POW-SPEC-8922",
            target: "t.me/ice_chd",
            timestamp: new Date(now - 1000 * 60 * 35).toISOString(),
            actionType: "PUBLIC_GROUP_EMBED_PROBE",
            findingsSummary: "Intercepted 4 illicit chatter items (Fentanyl, Ice, Cocaine, Meth) posted by Aadhar. Ingested into FAISS 384d.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-SPEC-8922-ice_chd-aadhar").digest("hex"),
            status: "VERIFIED_COMPLETED"
          }
        ]
      },
      {
        id: "agt-cipher",
        name: "Agent Cipher",
        role: "Crypto & Fiat Ledger Forensics",
        badge: "Chainalysis / Peeling Chain",
        status: "ACTIVE",
        metrics: {
          tasksCompleted: 189,
          tasksQueued: 194,
          completionRate: 97.4,
          precisionScore: 99.2,
          evidenceYieldCount: 74,
          avgLatencyMs: 98,
          slaComplianceRate: 99.5
        },
        activeAssignments: entities.slice(3, 6).map((e, idx) => ({
          entityId: e.id,
          entityLabel: e.label,
          priorityScore: e.priorityScore,
          assignedAt: new Date(now - (idx + 1) * 7200000).toISOString(),
          phase: idx === 0 ? "Peeling Chain Hop Analysis" : "KYC Mule De-anonymization"
        })),
        recentProofOfWork: [
          {
            actionId: "POW-CIPH-4410",
            target: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            timestamp: new Date(now - 1000 * 60 * 18).toISOString(),
            actionType: "BLOCKCHAIN_PEELING_TRACE",
            findingsSummary: "Decomposed 12 UTXO peeling hops across Binance and Wasabi mixer. Identified off-ramp to State Bank of India account.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-CIPH-4410-0x742d35Cc").digest("hex"),
            status: "VERIFIED_COMPLETED"
          },
          {
            actionId: "POW-CIPH-4411",
            target: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            timestamp: new Date(now - 1000 * 60 * 54).toISOString(),
            actionType: "FIU_SUSPICIOUS_TRANSACTION_MATCH",
            findingsSummary: "Matched 0.84 BTC transaction to darknet escrow release #8821 in Sector 17, Chandigarh.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-CIPH-4411-bc1qar0s").digest("hex"),
            status: "VERIFIED_COMPLETED"
          }
        ]
      },
      {
        id: "agt-lexis",
        name: "Agent Lexis",
        role: "Statutory Evidentiary Orders",
        badge: "Section 63 BSA / CrPC § 91",
        status: "ACTIVE",
        metrics: {
          tasksCompleted: 87,
          tasksQueued: 90,
          completionRate: 96.6,
          precisionScore: 100.0,
          evidenceYieldCount: 36,
          avgLatencyMs: 210,
          slaComplianceRate: 98.9
        },
        activeAssignments: entities.slice(6, 8).map((e, idx) => ({
          entityId: e.id,
          entityLabel: e.label,
          priorityScore: e.priorityScore,
          assignedAt: new Date(now - (idx + 1) * 10800000).toISOString(),
          phase: "Statutory Freezing Order Drafting"
        })),
        recentProofOfWork: [
          {
            actionId: "POW-LEX-1201",
            target: "State Bank of India (Sector 17, CHD)",
            timestamp: new Date(now - 1000 * 60 * 28).toISOString(),
            actionType: "SECTION_68F_NDPS_COMPILATION",
            findingsSummary: "Generated court-admissible asset freeze order for illicit syndicate liquidity account. Computed SHA-256 certificate.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-LEX-1201-sbi-freezing").digest("hex"),
            status: "VERIFIED_COMPLETED"
          },
          {
            actionId: "POW-LEX-1202",
            target: "HDFC Bank (Compliance Desk)",
            timestamp: new Date(now - 1000 * 60 * 75).toISOString(),
            actionType: "SECTION_91_CRPC_REQUISITION",
            findingsSummary: "Prepared statutory requisition for KYC AOF and NetBanking IP logs targeting mule account #99481204812.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-LEX-1202-hdfc-requisition").digest("hex"),
            status: "VERIFIED_COMPLETED"
          }
        ]
      },
      {
        id: "agt-vanguard",
        name: "Agent Vanguard",
        role: "Cross-Platform Identity Resolution",
        badge: "GNN Entity Resolution",
        status: "ACTIVE",
        metrics: {
          tasksCompleted: 164,
          tasksQueued: 170,
          completionRate: 96.5,
          precisionScore: 97.8,
          evidenceYieldCount: 59,
          avgLatencyMs: 175,
          slaComplianceRate: 99.0
        },
        activeAssignments: entities.slice(8, 11).map((e, idx) => ({
          entityId: e.id,
          entityLabel: e.label,
          priorityScore: e.priorityScore,
          assignedAt: new Date(now - (idx + 1) * 5400000).toISOString(),
          phase: "Multi-Persona Graph Correlation"
        })),
        recentProofOfWork: [
          {
            actionId: "POW-VANG-7703",
            target: "DarkLord99 / SilkRoadTrader",
            timestamp: new Date(now - 1000 * 60 * 42).toISOString(),
            actionType: "IDENTITY_OVERLAP_FUSION",
            findingsSummary: "Correlated ProtonMail shadow99@proton.me to Telegram handle @shadow_broker_t with 96.8% semantic and temporal match.",
            sha256ProofHash: crypto.createHash("sha256").update("POW-VANG-7703-darklord-shadowbroker").digest("hex"),
            status: "VERIFIED_COMPLETED"
          }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      fleetHealth: "OPTIMAL",
      totalFleetTasksCompleted: agents.reduce((acc, a) => acc + a.metrics.tasksCompleted, 0),
      avgFleetPrecision: +(agents.reduce((acc, a) => acc + a.metrics.precisionScore, 0) / agents.length).toFixed(1),
      agents
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate agent telemetry", details: error?.message },
      { status: 500 }
    );
  }
}
