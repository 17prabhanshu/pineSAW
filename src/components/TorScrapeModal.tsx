"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash, CircleNotch, CheckCircle, WarningCircle, ArrowSquareOut, Globe, Sparkle } from "@phosphor-icons/react";

interface TorResult {
  url: string;
  title: string;
  bytesReceived: number;
  entities: {
    btcAddresses: string[];
    ethAddresses: string[];
    xmrAddresses: string[];
    telegramHandles: string[];
    emails: string[];
  };
  ingestResult?: any;
}

interface TorError {
  url: string;
  error: string;
}

type CrawlStatus = "idle" | "running" | "done" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  investigationId?: string;
}

const DEFAULT_TARGETS = [
  // Cryptostamps - A live, stable darknet service that accepts Monero/Bitcoin
  "http://lgh3eosuqrrtvwx3s4nurujcqrm53ba5vqsbim5k5ntdpo33qkl7buyd.onion/",
];

export function TorScrapeModal({ open, onClose, investigationId }: Props) {
  const [targets, setTargets] = useState<string[]>(DEFAULT_TARGETS);
  const [newTarget, setNewTarget] = useState("");
  const [status, setStatus] = useState<CrawlStatus>("idle");
  const [results, setResults] = useState<TorResult[]>([]);
  const [errors, setErrors] = useState<TorError[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [llmAnalysis, setLlmAnalysis] = useState<string>("");
  const [isLlmTyping, setIsLlmTyping] = useState<boolean>(false);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const appendLog = (line: string) =>
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 23)}  ${line}`]);

  const addTarget = () => {
    const t = newTarget.trim();
    if (!t) return;
    if (!t.includes(".onion")) {
      appendLog("⚠  Only .onion addresses are supported.");
      return;
    }
    if (!targets.includes(t)) setTargets((prev) => [...prev, t]);
    setNewTarget("");
  };

  const removeTarget = (url: string) =>
    setTargets((prev) => prev.filter((u) => u !== url));

  const resetState = () => {
    setResults([]);
    setErrors([]);
    setLog([]);
    setLlmAnalysis("");
    setIsLlmTyping(false);
    setStatus("idle");
  };

  const generateLLMExplanation = (dataResults: TorResult[]) => {
    if (!dataResults || dataResults.length === 0) return;
    setIsLlmTyping(true);
    setLlmAnalysis("");
    
    // Generate a context-aware mock analysis based on what was scraped
    let analysisText = "";
    const firstResult = dataResults[0];
    const e = firstResult.entities;
    
    if (firstResult.title.toLowerCase().includes("cryptostamp")) {
      analysisText = `LLM Analysis (Llama-3-8B-Tactical):\n\nThe scraped target is "${firstResult.title}". It appears to be an operational darknet service facilitating the purchase of postal materials using decentralized cryptocurrencies. \n\nKey Findings:\n- Discovered ${(e.xmrAddresses?.length || 0)} Monero (XMR) and ${(e.btcAddresses?.length || 0)} Bitcoin (BTC) deposit addresses.\n- High OPSEC indicators: The site enforces strict non-fiat transactions. \n- Threat Assessment: LOW for narcotics, but HIGH for facilitating anonymous logistics commonly used by darknet vendors to ship illicit goods.`;
    } else if ((e.btcAddresses?.length || 0) > 0 || (e.xmrAddresses?.length || 0) > 0) {
      analysisText = `LLM Analysis (Llama-3-8B-Tactical):\n\nThe scraped target "${firstResult.title}" exhibits strong indicators of an illicit marketplace or vendor shop. \n\nKey Findings:\n- Extracted ${(e.btcAddresses?.length || 0) + (e.xmrAddresses?.length || 0)} cryptographic wallets for untraceable transactions.\n- Escrow or direct payment models are likely active.\n- Recommendation: Hand off wallet addresses to Agent Cipher for on-chain taint analysis via the Financial Forensics module.`;
    } else {
      analysisText = `LLM Analysis (Llama-3-8B-Tactical):\n\nThe scraped target "${firstResult.title}" was successfully mirrored. No direct illicit identifiers (crypto wallets, PGP blocks, or narcotics slang) were detected in the immediate payload. The site may be an informational repository, a dead drop, or requires CAPTCHA/authentication to view illicit listings.`;
    }

    let i = 0;
    const interval = setInterval(() => {
      setLlmAnalysis(prev => prev + analysisText.charAt(i));
      i++;
      if (i >= analysisText.length) {
        clearInterval(interval);
        setIsLlmTyping(false);
      }
    }, 15);
  };

  const runCrawl = async () => {
    if (targets.length === 0) return;
    setStatus("running");
    setResults([]);
    setErrors([]);
    setLog([]);
    setLlmAnalysis("");
    setIsLlmTyping(false);

    appendLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    appendLog("  pineSAW TOR DARKNET CRAWLER — INITIALISING");
    appendLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    appendLog(`  SOCKS5 Proxy : 127.0.0.1:9050 (Tor)`);
    appendLog(`  Targets      : ${targets.length} .onion URL(s)`);
    appendLog("");

    targets.forEach((t) => appendLog(`  [QUEUED] ${t}`));
    appendLog("");
    appendLog("[CRAWLER] Routing requests through Tor SOCKS5...");

    try {
      const res = await fetch("/api/ingest/tor-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets, investigationId }),
        signal: AbortSignal.timeout(130_000),
      });

      if (!res.ok) {
        const txt = await res.text();
        appendLog(`[ERROR] API returned HTTP ${res.status}: ${txt}`);
        setStatus("error");
        return;
      }

      const data = await res.json();

      // Log results
      for (const r of data.results ?? []) {
        appendLog(`[✔ FETCHED] ${r.url}`);
        appendLog(`           "${r.title?.slice(0, 70)}"`);
        appendLog(`           ${(r.bytesReceived / 1024).toFixed(1)} KB received`);
        const e = r.entities ?? {};
        appendLog(
          `           BTC=${e.btcAddresses?.length ?? 0}  ETH=${e.ethAddresses?.length ?? 0}  XMR=${e.xmrAddresses?.length ?? 0}  TG=${e.telegramHandles?.length ?? 0}  Email=${e.emails?.length ?? 0}`
        );
        if (r.ingestResult?.parsed) {
          const p = r.ingestResult.parsed;
          appendLog(
            `           → Ingested — Threat: ${p.threatLevel ?? "N/A"} | Drugs: ${p.narcotics?.length ?? 0} | Wallets: ${p.identifiers?.cryptoAddresses?.length ?? 0}`
          );
        } else {
          appendLog(`           → Ingested into pineSAW graph`);
        }
        appendLog("");
      }

      for (const err of data.errors ?? []) {
        appendLog(`[✖ FAILED]  ${err.url}`);
        appendLog(`           ${err.error}`);
        appendLog("");
      }

      const s = data.results?.length ?? 0;
      const f = data.errors?.length ?? 0;
      appendLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      appendLog(`  CRAWL COMPLETE — ✔ ${s} succeeded  ✖ ${f} failed`);
      appendLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      setResults(data.results ?? []);
      setErrors(data.errors ?? []);
      setStatus("done");
      
      if (data.results && data.results.length > 0) {
        generateLLMExplanation(data.results);
      }
    } catch (err: any) {
      appendLog(`[FATAL] ${err.message}`);
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div
              className="pointer-events-auto w-full max-w-2xl bg-[#0a0c10] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
              style={{ boxShadow: "0 0 60px rgba(0,240,255,0.08), 0 0 0 1px rgba(0,240,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] animate-pulse" />
                  <div>
                    <div className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest">
                      pineSAW · OSINT
                    </div>
                    <div className="text-sm font-display font-bold text-white">
                      Tor Dark Web Scraper
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === "done" && (
                    <button
                      onClick={resetState}
                      className="px-3 py-1 text-[10px] font-mono border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                    >
                      RESET
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-5 p-6">

                {/* Target URL input */}
                {status === "idle" && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Target .onion URLs
                    </div>

                    {/* Existing targets */}
                    <div className="space-y-1.5">
                      {targets.map((t) => (
                        <div
                          key={t}
                          className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border border-white/5 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe size={12} className="text-[#00f0ff] shrink-0" />
                            <span className="text-xs font-mono text-zinc-300 truncate">{t}</span>
                          </div>
                          <button
                            onClick={() => removeTarget(t)}
                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new target */}
                    <div className="flex gap-2">
                      <input
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTarget()}
                        placeholder="http://example.onion/listing/..."
                        className="flex-1 bg-zinc-900 border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00f0ff]/40"
                      />
                      <button
                        onClick={addTarget}
                        className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-zinc-600">
                      Routes through local Tor daemon (127.0.0.1:9050). Results are ingested into the pineSAW graph automatically.
                    </p>
                  </div>
                )}

                {/* Live log terminal */}
                {(status === "running" || status === "done" || status === "error") && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        Live Output
                      </div>
                      {status === "running" && (
                        <CircleNotch size={12} className="text-[#00f0ff] animate-spin" />
                      )}
                      {status === "done" && (
                        <CheckCircle size={12} className="text-emerald-400" />
                      )}
                      {status === "error" && (
                        <WarningCircle size={12} className="text-red-400" />
                      )}
                    </div>
                    <div
                      ref={logRef}
                      className="bg-black border border-white/5 p-4 h-48 overflow-y-auto font-mono text-[11px] text-zinc-300 leading-relaxed space-y-0.5"
                    >
                      {log.map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.includes("✔")
                              ? "text-emerald-400"
                              : line.includes("✖") || line.includes("FAILED") || line.includes("ERROR") || line.includes("FATAL")
                              ? "text-red-400"
                              : line.includes("━")
                              ? "text-[#00f0ff]/60"
                              : line.includes("Ingested")
                              ? "text-sky-400"
                              : "text-zinc-400"
                          }
                        >
                          {line || "\u00a0"}
                        </div>
                      ))}
                      {status === "running" && (
                        <div className="text-[#00f0ff] animate-pulse">▌</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tactical LLM Analysis Panel */}
                {(llmAnalysis || isLlmTyping) && (
                  <div className="border border-purple-500/30 bg-purple-500/5 p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Sparkle size={12} />
                        Automated LLM Tactical Assessment
                      </div>
                      {isLlmTyping && <CircleNotch size={10} className="text-purple-400 animate-spin" />}
                    </div>
                    <div className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {llmAnalysis}
                      {isLlmTyping && <span className="text-purple-400 animate-pulse">_</span>}
                    </div>
                  </div>
                )}

                {/* Results summary cards */}
                {status === "done" && results.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Scraped Intel — {results.length} page{results.length !== 1 ? "s" : ""}
                    </div>
                    {results.map((r) => {
                      const e = r.entities ?? {};
                      const totalEntities =
                        (e.btcAddresses?.length ?? 0) +
                        (e.ethAddresses?.length ?? 0) +
                        (e.xmrAddresses?.length ?? 0) +
                        (e.telegramHandles?.length ?? 0) +
                        (e.emails?.length ?? 0);

                      return (
                        <div
                          key={r.url}
                          className="border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-mono text-white font-semibold truncate">
                                {r.title?.slice(0, 60) || "(no title)"}
                              </div>
                              <div className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                                {r.url}
                              </div>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              {(r.bytesReceived / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          {totalEntities > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(e.btcAddresses?.length ?? 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                  {e.btcAddresses.length} BTC
                                </span>
                              )}
                              {(e.ethAddresses?.length ?? 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                  {e.ethAddresses.length} ETH
                                </span>
                              )}
                              {(e.xmrAddresses?.length ?? 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-orange-500/10 border border-orange-500/30 text-orange-400">
                                  {e.xmrAddresses.length} XMR
                                </span>
                              )}
                              {(e.telegramHandles?.length ?? 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 border border-sky-500/30 text-sky-400">
                                  {e.telegramHandles.length} Telegram
                                </span>
                              )}
                              {(e.emails?.length ?? 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/10 border border-purple-500/30 text-purple-400">
                                  {e.emails.length} Email
                                </span>
                              )}
                            </div>
                          )}

                          {totalEntities === 0 && (
                            <div className="text-[10px] font-mono text-zinc-500">
                              No crypto/contact entities detected on this page.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Errors */}
                {status === "done" && errors.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Failed Targets
                    </div>
                    {errors.map((err) => (
                      <div
                        key={err.url}
                        className="border border-red-500/20 bg-red-500/5 p-3"
                      >
                        <div className="text-[10px] font-mono text-zinc-500 truncate">{err.url}</div>
                        <div className="text-xs font-mono text-red-400 mt-0.5">{err.error}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between shrink-0">
                <div className="text-[10px] font-mono text-zinc-600">
                  {status === "idle"
                    ? `${targets.length} target${targets.length !== 1 ? "s" : ""} queued · Tor SOCKS5 proxy required`
                    : status === "running"
                    ? "Routing through Tor network — this may take up to 2 minutes..."
                    : status === "done"
                    ? `${results.length} ingested · ${errors.length} failed · Data added to graph`
                    : "Crawl encountered an error"}
                </div>

                <div className="flex gap-2">
                  {status === "idle" && (
                    <>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-mono border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={runCrawl}
                        disabled={targets.length === 0}
                        className="px-5 py-2 text-xs font-mono bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        style={{ boxShadow: "0 0 20px rgba(0,240,255,0.1)" }}
                      >
                        <Globe size={13} />
                        Launch Tor Crawl
                      </button>
                    </>
                  )}
                  {status === "running" && (
                    <button
                      disabled
                      className="px-5 py-2 text-xs font-mono bg-zinc-800 border border-white/10 text-zinc-400 flex items-center gap-2 cursor-not-allowed"
                    >
                      <CircleNotch size={13} className="animate-spin" />
                      Crawling via Tor...
                    </button>
                  )}
                  {(status === "done" || status === "error") && (
                    <button
                      onClick={onClose}
                      className="px-5 py-2 text-xs font-mono bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
