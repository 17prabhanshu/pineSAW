import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

// Semantic query expansion dictionary for Darknet & Cybercrime CTI
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  "fentanyl": ["opioid", "carfentanil", "china white", "synthetic", "m30", "silkroad"],
  "heroin": ["afghan brown", "diacetylmorphine", "pure smack", "h"],
  "mixer": ["wasabi", "coinjoin", "tornado", "peeling chain", "tumbler", "whirlpool"],
  "shadow": ["shadowbroker", "genesis", "pgp", "darklord99", "torland"],
  "crypto": ["bitcoin", "btc", "wallet", "usdt", "monero", "xmr", "escrow"],
  "bank": ["hdfc", "sbi", "axis", "icici", "mule", "rtgs", "hawala"],
  "tor": ["onion", "relay", "hidden service", "exit node", "agora", "mirror"],
  "carding": ["cc", "dumps", "cvv", "track2", "stripe", "fullz"]
};

// Query the persistent FAISS daemon or fallback to direct Python CLI execution
async function queryFaissEngine(
  query: string, 
  denseWeight: number, 
  threshold: number, 
  indexType: string
): Promise<{ entities: any[]; metadata: any }> {
  const params = new URLSearchParams({
    q: query,
    denseWeight: denseWeight.toString(),
    threshold: threshold.toString(),
    indexType: indexType,
    topK: "30"
  });

  // Attempt 1: Fast HTTP query to in-memory FAISS daemon (sub-5ms)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    
    const res = await fetch(`http://127.0.0.1:5055/search?${params.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Daemon not reached; falling back to direct Python CLI invocation
  }

  // Attempt 2: Direct CLI execution via virtualenv Python
  try {
    const projectRoot = process.cwd();
    const pythonBin = process.env.PYTHON_BIN || path.join(os.homedir(), ".pinesaw-venv", "bin", "python");
    const scriptPath = path.resolve(projectRoot, "backend", "scripts", "faiss_engine.py");

    const { stdout } = await execFileAsync(pythonBin, [
      scriptPath,
      "--query", query,
      "--dense-weight", denseWeight.toString(),
      "--threshold", threshold.toString(),
      "--index-type", indexType,
      "--top-k", "30"
    ]);

    const data = JSON.parse(stdout);
    return data;
  } catch (err: any) {
    console.error("FAISS CLI execution error:", err);
    return {
      entities: [],
      metadata: {
        query,
        totalIndexedVectors: 0,
        queryLatencyMs: 0,
        indexType: "FAISS_Error",
        denseWeight,
        sparseWeight: 1 - denseWeight
      }
    };
  }
}

export async function GET(request: Request) {
  const startTime = performance.now();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const denseWeight = parseFloat(searchParams.get('denseWeight') || '0.70');
  const threshold = parseFloat(searchParams.get('threshold') || '0.50');
  const indexType = searchParams.get('indexType') || 'HNSW'; // HNSW or IndexFlatIP

  if (!q) {
    return NextResponse.json({
      entities: [],
      investigations: [],
      metadata: {
        totalIndexedVectors: 215,
        queryLatencyMs: 0,
        indexType: `FAISS_${indexType}_Cosine_384d`,
        semanticExpansions: []
      }
    });
  }

  const queryLower = q.toLowerCase();

  // 1. Semantic expansions
  const expansions: string[] = [];
  Object.entries(SEMANTIC_SYNONYMS).forEach(([key, syns]) => {
    if (queryLower.includes(key)) {
      expansions.push(...syns);
    }
  });

  // 2. Query Genuine FAISS Vector Engine
  const faissResponse = await queryFaissEngine(q, denseWeight, threshold, indexType);

  // 3. Query Linked Investigations from Database
  let investigations: any[] = [];
  try {
    investigations = await prisma.investigation.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { caseId: { contains: q } },
          ...expansions.slice(0, 3).map(exp => ({ title: { contains: exp } }))
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    // Graceful fallback if SQLite is busy
  }

  const endTime = performance.now();
  const totalLatency = parseFloat((endTime - startTime).toFixed(2));

  return NextResponse.json({
    entities: faissResponse.entities,
    investigations,
    metadata: {
      ...faissResponse.metadata,
      query: q,
      totalLatencyMs: totalLatency,
      semanticExpansions: Array.from(new Set(expansions)).slice(0, 6)
    }
  });
}
