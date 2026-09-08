/**
 * pineSAW ZeroMQ Ingest Bridge
 *
 * Subscribes to the ZeroMQ PUB socket published by tor_scraper.mjs and
 * forwards each event to the pineSAW ingestion API (POST /api/ingest/parse).
 *
 * Architecture:
 *   tor_scraper.mjs  →  ZMQ PUB (tcp://*:5555)
 *                              ↓ topic: "darkweb"
 *   zmq_ingest_bridge.mjs  →  ZMQ SUB  →  POST /api/ingest/parse
 *
 * Run this in a separate terminal BEFORE starting tor_scraper.mjs:
 *   npm run crawl:bridge
 *
 * Environment Variables:
 *   ZMQ_SUB_ADDRESS      - ZeroMQ PUB endpoint to connect to (default: tcp://localhost:5555)
 *   PINESAW_API          - pineSAW ingestion API URL (default: http://localhost:3000/api/ingest/parse)
 *   ZMQ_TOPIC            - Topic filter to subscribe to (default: darkweb)
 */

import { Subscriber } from "zeromq";

const ZMQ_SUB_ADDRESS = process.env.ZMQ_SUB_ADDRESS || "tcp://localhost:5555";
const PINESAW_API_ENDPOINT = process.env.PINESAW_API || "http://localhost:3000/api/ingest/parse";
const ZMQ_TOPIC = process.env.ZMQ_TOPIC || "darkweb";

console.log("================================================================================");
console.log("  pineSAW ZeroMQ INGEST BRIDGE");
console.log(`  ZMQ SUB    : ${ZMQ_SUB_ADDRESS}  (topic: "${ZMQ_TOPIC}")`);
console.log(`  Ingest API : ${PINESAW_API_ENDPOINT}`);
console.log("================================================================================\n");

async function postToIngestApi(payload) {
  const body = {
    text: payload.text || "",
    source: payload.source || "tor_crawler",
    url: payload.url || "",
    title: payload.title || "",
    listings: payload.listings || [],
    entities: payload.entities || {},
    autoIngest: payload.autoIngest ?? true,
    crawledAt: payload.crawledAt || new Date().toISOString(),
  };

  const res = await fetch(PINESAW_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`API responded with HTTP ${res.status}`);
  }

  return res.json();
}

async function main() {
  const sock = new Subscriber();

  sock.connect(ZMQ_SUB_ADDRESS);
  sock.subscribe(ZMQ_TOPIC);

  console.log(`[ZMQ BRIDGE] Connected to ${ZMQ_SUB_ADDRESS}`);
  console.log(`[ZMQ BRIDGE] Subscribed to topic: "${ZMQ_TOPIC}"`);
  console.log(`[ZMQ BRIDGE] Waiting for events from tor_scraper.mjs...\n`);

  let totalReceived = 0;
  let totalIngested = 0;
  let totalFailed = 0;

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(`\n[ZMQ BRIDGE] Shutting down.`);
    console.log(`[ZMQ BRIDGE] Stats: ${totalReceived} received, ${totalIngested} ingested, ${totalFailed} failed.`);
    sock.close();
    process.exit(0);
  });

  for await (const [topicBuf, messageBuf] of sock) {
    const topic = topicBuf.toString();
    const rawMessage = messageBuf.toString();
    totalReceived++;

    console.log(`\n[ZMQ BRIDGE] ← Event received on topic "${topic}" (#${totalReceived})`);

    let payload;
    try {
      payload = JSON.parse(rawMessage);
    } catch {
      console.log(`[ZMQ BRIDGE]   ✖ Invalid JSON payload — skipping.`);
      totalFailed++;
      continue;
    }

    console.log(`[ZMQ BRIDGE]   Source URL : ${payload.url || "(unknown)"}`);
    console.log(`[ZMQ BRIDGE]   Title      : ${payload.title || "(no title)"}`);
    console.log(`[ZMQ BRIDGE]   Text length: ${(payload.text || "").length} chars`);

    if (payload.entities) {
      const e = payload.entities;
      console.log(`[ZMQ BRIDGE]   Entities   : BTC=${e.btcAddresses?.length || 0} ETH=${e.ethAddresses?.length || 0} XMR=${e.xmrAddresses?.length || 0} TG=${e.telegramHandles?.length || 0}`);
    }

    try {
      console.log(`[ZMQ BRIDGE]   → Forwarding to ${PINESAW_API_ENDPOINT}...`);
      const result = await postToIngestApi(payload);

      if (result?.parsed) {
        const p = result.parsed;
        console.log(`[ZMQ BRIDGE]   ✔ Ingested — Threat: ${p.threatLevel || "N/A"} | Drugs: ${p.narcotics?.length || 0} | Wallets: ${p.identifiers?.cryptoAddresses?.length || 0}`);
      } else {
        console.log(`[ZMQ BRIDGE]   ✔ Ingested (API response received)`);
      }
      totalIngested++;

    } catch (err) {
      console.log(`[ZMQ BRIDGE]   ✖ Ingest failed: ${err.message}`);
      totalFailed++;
    }
  }
}

main().catch((err) => {
  console.error("[FATAL]", err.message);
  process.exit(1);
});
