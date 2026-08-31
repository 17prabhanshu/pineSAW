"use client";

import { useState } from "react";
import { Database, Play, CheckCircle, WarningOctagon, Clock, MagnifyingGlass, Sparkle, ShieldCheck, ArrowRight, Terminal } from "@phosphor-icons/react";
import clsx from "clsx";

export default function IngestionSimulator() {
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "COMPLETE">("IDLE");
  const [logs, setLogs] = useState<{msg: string, type: 'info'|'success'|'warning'}[]>([]);

  // Live Cambridge NLP Inspector State
  const [inputText, setInputText] = useState(
    `NEW BATCH: Pure pharma grade 500 pills of dirty 30s (m30 fent) and 100g of ice crystal available now. Dead drops active across Chandigarh Sector 17 and Tri-City region.\nPayment strictly via Bitcoin: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq or Ethereum: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e\nContact vendor on Telegram @shadow_broker_t or protonmail shadow99@proton.me`
  );
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [autoIngestedCount, setAutoIngestedCount] = useState<number | null>(null);

  const runIngestion = () => {
    setStatus("RUNNING");
    setLogs([]);
    
    const steps = [
      { msg: "Connecting to synthetic Tor (.onion) observation nodes...", delay: 400, type: "info" },
      { msg: "Receiving 42 records from GenesisMarket & Telegram channels...", delay: 1200, type: "info" },
      { msg: "Validating schemas: 40 accepted, 2 rejected (malformed).", delay: 1800, type: "warning" },
      { msg: "Running Cambridge iCrime Lexicon parsing on post bodies...", delay: 2600, type: "info" },
      { msg: "Executing Stanford SNAP Co-Spend Address Clustering heuristics...", delay: 3400, type: "info" },
      { msg: "Resolved 3 aliases to known entity 'ShadowBroker' (Confidence: 0.95)", delay: 4200, type: "success" },
      { msg: "Constructed 12 new CONTROLS / TRANSACTS_WITH edges in Property Graph.", delay: 5000, type: "success" },
      { msg: "Recalculating Deterministic Risk Scores (Velocity Burst: +35 pts)...", delay: 5800, type: "info" },
      { msg: "Generated CRITICAL Alert for Investigation INV-2026-0042", delay: 6600, type: "warning" },
      { msg: "Pipeline execution complete. Property graph updated.", delay: 7200, type: "success" },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { msg: step.msg, type: step.type as any }]);
        if (step === steps[steps.length - 1]) {
          setStatus("COMPLETE");
        }
      }, step.delay);
    });
  };

  const handleNlpParse = async (autoIngest: boolean) => {
    if (!inputText.trim()) return;
    setNlpLoading(true);
    setAutoIngestedCount(null);
    try {
      const res = await fetch("/api/ingest/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, autoIngest })
      });
      const data = await res.json();
      setNlpResult(data.parsed);
      if (autoIngest) {
        setAutoIngestedCount(data.autoIngested);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNlpLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col overflow-y-auto space-y-8">
      <header className="flex justify-between items-end border-b border-zinc-300 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900 tracking-tight mb-1">Ingestion & NLP Pipeline</h1>
          <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
            Cambridge Cybercrime Lexicon & Stanford SNAP Graph Ingestion Layer
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runIngestion}
            disabled={status === "RUNNING"}
            className="btn-gov flex items-center gap-2"
          >
            {status === "RUNNING" ? <Clock className="animate-spin" size={16} /> : <Play weight="fill" size={16} />}
            {status === "RUNNING" ? "PROCESSING OBSERVER FEED..." : "TRIGGER TOR INGESTION SIMULATOR"}
          </button>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4 bg-white nexus-border p-4 shadow-sm">
        <div className="border-r border-zinc-200 pr-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Tor Nodes Active</div>
          <div className="text-2xl font-display font-semibold text-zinc-900">08 Crawlers</div>
        </div>
        <div className="border-r border-zinc-200 pr-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Records Ingested</div>
          <div className="text-2xl font-display font-semibold text-gov-blue">{status === "COMPLETE" ? "128" : "42"}</div>
        </div>
        <div className="border-r border-zinc-200 pr-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Entities Clustered</div>
          <div className="text-2xl font-display font-semibold text-zinc-900">{status === "COMPLETE" ? "31" : "14"}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">High-Risk Alerts</div>
          <div className="text-2xl font-display font-semibold text-red-600">{status === "COMPLETE" ? "04" : "01"}</div>
        </div>
      </div>

      {/* SECTION 2: LIVE CAMBRIDGE iCRIME NLP TEXT INSPECTOR */}
      <div className="bg-white nexus-border shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-300 flex justify-between items-center">
          <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkle size={16} className="text-gov-blue" /> Cambridge iCrime NLP Live Inspector & Entity Parser
          </h2>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Interactive Forensic Tool</span>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">
              Raw Intercepted Text (Darknet Marketplace / Telegram Post / Encrypted Chatter)
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 p-3 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-gov-blue resize-none"
              placeholder="Paste raw unformatted text to extract narcotics slang, crypto addresses, and handles..."
            ></textarea>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleNlpParse(false)}
              disabled={nlpLoading}
              className="btn-gov text-xs py-2 px-4 flex items-center gap-2"
            >
              <MagnifyingGlass size={14} />
              {nlpLoading ? "Parsing Entities..." : "Extract Entities (NLP Only)"}
            </button>
            <button
              onClick={() => handleNlpParse(true)}
              disabled={nlpLoading}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 border-gov-blue text-gov-blue hover:bg-blue-50"
            >
              <Database size={14} />
              Extract & Auto-Ingest to Graph
            </button>
            {autoIngestedCount !== null && (
              <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1 border border-green-200 flex items-center gap-1">
                <CheckCircle size={14} /> Successfully committed {autoIngestedCount} new entities to graph
              </span>
            )}
          </div>

          {/* Render Parsed Results */}
          {nlpResult && (
            <div className="mt-4 p-4 bg-zinc-50 border border-zinc-300 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Classification Result:</span>
                  <span className={clsx("text-[10px] font-mono font-bold px-2 py-0.5 border", 
                    nlpResult.threatLevel === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" :
                    nlpResult.threatLevel === "HIGH" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {nlpResult.threatLevel} THREAT
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Confidence: {(nlpResult.confidenceScore * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Narcotics */}
                <div className="bg-white p-3 border border-zinc-200">
                  <div className="font-mono text-[10px] font-semibold text-zinc-500 uppercase mb-2">
                    Detected Narcotics ({nlpResult.narcotics.length})
                  </div>
                  {nlpResult.narcotics.length > 0 ? (
                    <div className="space-y-2">
                      {nlpResult.narcotics.map((n: any, i: number) => (
                        <div key={i} className="bg-red-50/50 p-2 border border-red-100">
                          <div className="font-bold text-red-800">{n.standardizedName}</div>
                          <div className="text-[10px] text-zinc-600 font-mono">Slang: "{n.detectedSlang}" {n.extractedQuantity ? `| Qty: ${n.extractedQuantity}` : ""}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-400 italic">No illicit slang matched</div>
                  )}
                </div>

                {/* Crypto Addresses */}
                <div className="bg-white p-3 border border-zinc-200">
                  <div className="font-mono text-[10px] font-semibold text-zinc-500 uppercase mb-2">
                    Cryptocurrency Addresses ({nlpResult.identifiers.cryptoAddresses.length})
                  </div>
                  {nlpResult.identifiers.cryptoAddresses.length > 0 ? (
                    <div className="space-y-1.5">
                      {nlpResult.identifiers.cryptoAddresses.map((c: any, i: number) => (
                        <div key={i} className="p-1.5 bg-zinc-100 font-mono text-[11px] break-all border border-zinc-200">
                          <span className="text-[9px] font-bold text-gov-blue uppercase block">{c.network}</span>
                          {c.address}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-400 italic">No on-chain addresses found</div>
                  )}
                </div>

                {/* Communication Vectors */}
                <div className="bg-white p-3 border border-zinc-200">
                  <div className="font-mono text-[10px] font-semibold text-zinc-500 uppercase mb-2">
                    Contact Vectors ({nlpResult.identifiers.communicationHandles.length})
                  </div>
                  {nlpResult.identifiers.communicationHandles.length > 0 ? (
                    <div className="space-y-1.5">
                      {nlpResult.identifiers.communicationHandles.map((h: any, i: number) => (
                        <div key={i} className="p-1.5 bg-zinc-100 font-mono text-[11px] border border-zinc-200">
                          <span className="text-[9px] font-bold text-amber-700 uppercase block">{h.platform}</span>
                          {h.handle}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-400 italic">No contact vectors found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PIPELINE AUDIT LOG STREAM */}
      <div className="bg-white nexus-border shadow-sm flex flex-col min-h-[260px]">
        <div className="p-4 bg-zinc-50 border-b border-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 uppercase tracking-wider">
            <Terminal size={16} /> Real-Time Ingestion Engine Stream
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">SHA-256 Validated</span>
        </div>
        <div className="p-4 font-mono text-xs bg-[#090D16] text-zinc-300 flex-1 overflow-auto leading-relaxed space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 transition-colors">
              <span className="text-zinc-600 select-none">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
              <span className={clsx(
                log.type === 'info' && "text-zinc-300",
                log.type === 'warning' && "text-amber-400",
                log.type === 'success' && "text-emerald-400 font-semibold"
              )}>
                {log.msg}
              </span>
            </div>
          ))}
          {status === "IDLE" && (
            <div className="text-zinc-600 italic px-2">Click "TRIGGER TOR INGESTION SIMULATOR" to run synthetic stream test...</div>
          )}
          {status === "RUNNING" && (
            <div className="flex gap-2 text-blue-400 animate-pulse px-2">
              <span>● Executing Stanford graph clustering heuristic...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
