import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { id, label, type = "LISTING", text = "", priorityScore = 88, riskFactors = "Scraped via live harvester console" } = payload;

    if (!text && !label) {
      return NextResponse.json({ error: "Missing required text or label for vectorization" }, { status: 400 });
    }

    const docId = id || `SCRAPE-${Date.now()}`;
    const cleanLabel = label || `${text.substring(0, 40)}...`;

    const indexPayload = {
      id: docId,
      label: cleanLabel,
      type,
      text,
      priorityScore,
      riskFactors: typeof riskFactors === "string" ? riskFactors : JSON.stringify(riskFactors)
    };

    let resultData: any = null;

    // Attempt 1: Push directly to running FAISS daemon on port 5055
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const faissRes = await fetch("http://127.0.0.1:5055/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(indexPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (faissRes.ok) {
        resultData = await faissRes.json();
      }
    } catch {
      // Daemon might be restarting or offline
    }

    // Attempt 2: Direct Python CLI execution fallback
    if (!resultData) {
      try {
        const pythonScript = path.join(process.cwd(), "backend", "scripts", "faiss_engine.py");
        const { stdout } = await execFileAsync("python", [
          pythonScript,
          "--index-json",
          JSON.stringify(indexPayload)
        ], { timeout: 15000, maxBuffer: 10 * 1024 * 1024 });

        const parsed = JSON.parse(stdout.trim());
        if (parsed && parsed.status === "indexed") {
          resultData = parsed;
        }

        // Proactively ensure daemon is running in background
        try {
          const child = spawn("python", [pythonScript, "--daemon", "--port", "5055"], {
            detached: true,
            stdio: "ignore"
          });
          child.unref();
        } catch {}
      } catch (cliErr: any) {
        console.error("FAISS CLI index fallback error:", cliErr);
      }
    }

    // Persist/Sync to relational database Entity table
    try {
      await prisma.entity.upsert({
        where: { id: docId },
        update: {
          label: cleanLabel,
          priorityScore,
          riskFactors: typeof riskFactors === "string" ? JSON.stringify([riskFactors]) : JSON.stringify(riskFactors)
        },
        create: {
          id: docId,
          type: type === "ACTOR" ? "ACTOR" : type === "PLATFORM" ? "PLATFORM" : "LISTING",
          label: cleanLabel,
          confidence: 0.95,
          priorityScore,
          riskFactors: typeof riskFactors === "string" ? JSON.stringify([riskFactors]) : JSON.stringify(riskFactors)
        }
      });
    } catch (dbErr) {
      console.warn("Entity DB sync warning (non-fatal):", dbErr);
    }

    if (resultData && resultData.status === "indexed") {
      return NextResponse.json({
        success: true,
        status: "indexed",
        total_vectors: resultData.total_vectors || 228,
        document: resultData.document || indexPayload
      });
    }

    return NextResponse.json({
      error: "Failed to index into FAISS vector space"
    }, { status: 500 });
  } catch (err: any) {
    console.error("Vectorize route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
