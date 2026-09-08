import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "status";

    if (action === "sources") {
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/sources");
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "keywords") {
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/keywords");
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "discovery") {
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/discovery");
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "persisted_leads") {
      // Query existing database for latest Telegram OSINT evidence & alerts
      const evidences = await prisma.evidence.findMany({
        where: { type: "TELEGRAM_OSINT_MESSAGE" },
        take: 15,
        orderBy: { createdAt: "desc" },
      });

      const alerts = await prisma.alert.findMany({
        where: { type: "OSINT_THREAT_DETECTION" },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ evidences, alerts });
    }

    // Default: Fetch status from backend
    const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/status");
    const statusData = await resp.json();
    return NextResponse.json(statusData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to connect to Telegram OSINT backend", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "command", command, source_id, mode = "MOCK", max_messages = 5, user_id = "admin", args = [], keywords, channel_username, status } = body;

    if (action === "discover") {
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, mode }),
      });
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "review") {
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/review_source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_username, status }),
      });
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "collect") {
      const ignore_checkpoint = body.ignore_checkpoint || false;
      const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id, mode, max_messages, ignore_checkpoint }),
      });
      const data = await resp.json();
      return NextResponse.json(data);
    }

    if (action === "wallet_analyze") {
      const wallet = body.wallet || "";
      const resp = await fetch("http://127.0.0.1:8000/api/financial/wallet-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const data = await resp.json();
      return NextResponse.json(data);
    }

    // Default: Execute bot command (/status, /mock, /discover, /sources, etc.)
    const resp = await fetch("http://127.0.0.1:8000/api/telegram_osint/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: command || "/status",
        user_id,
        args,
      }),
    });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Execution error in Telegram OSINT Bot pipeline", details: error.message },
      { status: 500 }
    );
  }
}
