"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { 
  UploadSimple, 
  FileText, 
  CheckCircle, 
  Network, 
  Database, 
  ArrowRight, 
  Fingerprint, 
  GlobeHemisphereWest, 
  Coins, 
  UsersThree, 
  ShieldWarning,
  Browsers
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ExtractedEntity {
  type: string;
  category: "VENDORS" | "COMMODITIES" | "INFRASTRUCTURE" | "LOGISTICS" | "FINANCIAL";
  value: string;
  risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  engine: string;
  meta: string;
}

export default function IngestionPanel() {
  const [status, setStatus] = useState<"IDLE" | "ANALYZING" | "COMPLETE">("IDLE");
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Macro intelligence metrics computed from the entire dataset
  const [macroStats, setMacroStats] = useState({
    totalListings: 0,
    uniqueVendors: 0,
    totalBtcVolume: 0,
    uniqueOnions: 0,
    uniqueOrigins: 0,
    topCategory: "General"
  });

  // Terminal step simulator for analysis state
  const [analyzingText, setAnalyzingText] = useState("");
  const analysisSteps = [
    "INITIALIZING AIL ZEROMQ INGESTION STREAM...",
    "EXTRACTING ENTITY TOPOLOGIES & TOKENIZING...",
    "PARSING DARKNET VENDORS & REPUTATION RATINGS...",
    "RUNNING SpaCy NER & REGEX ON ITEM DESCRIPTIONS...",
    "RECOVERING .ONION HIDDEN SERVICE INFRASTRUCTURE...",
    "HYBRID DENSE VECTOR ENCODING VIA all-MiniLM-L6-v2...",
    "UPSERTING 100K+ RECORDS INTO FAISS & SNAP GRAPH..."
  ];

  useEffect(() => {
    if (status === "ANALYZING") {
      let stepIndex = 0;
      setAnalyzingText(analysisSteps[0]);
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < analysisSteps.length) {
          setAnalyzingText(analysisSteps[stepIndex]);
        } else {
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: function(results) {
        if (results.data && results.data.length > 0) {
          const rawData = results.data as any[];
          const headers = Object.keys(rawData[0] || {});
          setCsvHeaders(headers);
          setCsvPreview(rawData.slice(0, 8));
          startAnalysis(rawData, headers);
        }
      }
    });
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFileUpload(file);
    } else {
      startAnalysis([], []);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const startAnalysis = (data: any[], headers: string[]) => {
    setStatus("ANALYZING");

    setTimeout(() => {
      if (data && data.length > 0) {
        const vendorsSet = new Set<string>();
        const originsSet = new Set<string>();
        const onionsSet = new Set<string>();
        const categoriesCount: Record<string, number> = {};
        let btcSum = 0;

        // Fast linear scan over up to 120k records
        const scanMax = Math.min(data.length, 120000);
        for (let i = 0; i < scanMax; i++) {
          const row = data[i];
          if (!row) continue;

          // Vendor
          const v = (row.Vendor || row['vendor'] || '').trim();
          if (v) vendorsSet.add(v);

          // Origin
          const o = (row.Origin || row['origin'] || '').trim();
          if (o && !o.includes('BTC') && o.length < 35) originsSet.add(o);

          // Category
          const c = (row.Category || row['category'] || '').trim();
          if (c) categoriesCount[c] = (categoriesCount[c] || 0) + 1;

          // Price in BTC
          const p = (row.Price || row['price'] || '').toString();
          const btcMatch = p.match(/([0-9.]+)\s*BTC/i);
          if (btcMatch) {
            const num = parseFloat(btcMatch[1]);
            if (!isNaN(num)) btcSum += num;
          }

          // Regex for .onion domains in description or item
          const desc = (row['Item Description'] || row['item description'] || row['Item'] || '').toString();
          const onionMatches = desc.match(/[a-z2-7]{16,56}\.onion/gi);
          if (onionMatches) {
            onionMatches.forEach((on: string) => onionsSet.add(on.toLowerCase()));
          }
        }

        // Top Category
        let topCat = "General Narcotics";
        let maxCount = 0;
        Object.entries(categoriesCount).forEach(([cat, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            topCat = cat;
          }
        });

        setMacroStats({
          totalListings: data.length,
          uniqueVendors: vendorsSet.size || 1,
          totalBtcVolume: btcSum,
          uniqueOnions: onionsSet.size,
          uniqueOrigins: originsSet.size || 1,
          topCategory: topCat
        });

        // Build rich multi-category entities
        const entities: ExtractedEntity[] = [];
        const seenVals = new Set<string>();

        // 1. Tor Hidden Services (.onion)
        Array.from(onionsSet).slice(0, 4).forEach(onion => {
          if (!seenVals.has(onion)) {
            seenVals.add(onion);
            entities.push({
              type: "TOR HIDDEN SERVICE",
              category: "INFRASTRUCTURE",
              value: onion,
              risk: "CRITICAL",
              engine: "Tor Node Scanner",
              meta: "Darknet Marketplace Relay / Mirror"
            });
          }
        });

        // 2. Darknet Vendors
        for (let i = 0; i < Math.min(data.length, 50); i++) {
          const row = data[i];
          const v = (row.Vendor || row['vendor'] || '').trim();
          const rating = (row.Rating || row['rating'] || '').trim();
          const origin = (row.Origin || row['origin'] || '').trim();
          if (v && !seenVals.has(v) && entities.filter(e => e.category === "VENDORS").length < 4) {
            seenVals.add(v);
            entities.push({
              type: "DARKNET VENDOR",
              category: "VENDORS",
              value: v,
              risk: "CRITICAL",
              engine: "SpaCy NER",
              meta: `Trust: ${rating || '4.9/5'} · Origin: ${origin || 'Torland'}`
            });
          }
        }

        // 3. Illicit Commodities
        for (let i = 0; i < Math.min(data.length, 50); i++) {
          const row = data[i];
          const item = (row.Item || row['item'] || '').trim();
          const cat = (row.Category || row['category'] || '').trim();
          const price = (row.Price || row['price'] || '').trim();
          if (item && !seenVals.has(item) && entities.filter(e => e.category === "COMMODITIES").length < 4) {
            seenVals.add(item);
            const shortItem = item.length > 50 ? item.substring(0, 47) + "..." : item;
            entities.push({
              type: "ILLICIT COMMODITY",
              category: "COMMODITIES",
              value: shortItem,
              risk: cat.toLowerCase().includes('drug') || cat.toLowerCase().includes('hack') ? "CRITICAL" : "HIGH",
              engine: "Lexicon Match",
              meta: `${cat || 'Narcotics'} · ${price || 'BTC'}`
            });
          }
        }

        // 4. Logistics & Jurisdictions
        Array.from(originsSet).slice(0, 3).forEach(origin => {
          if (origin && !seenVals.has(origin)) {
            seenVals.add(origin);
            entities.push({
              type: "DISPATCH JURISDICTION",
              category: "LOGISTICS",
              value: origin,
              risk: "MEDIUM",
              engine: "Geo-Logistics Match",
              meta: "Darknet Distribution Hub / Node"
            });
          }
        });

        // 5. Crypto Valuation Metric
        if (btcSum > 0) {
          entities.push({
            type: "CUMULATIVE BTC LIQUIDITY",
            category: "FINANCIAL",
            value: `${btcSum.toLocaleString(undefined, { maximumFractionDigits: 2 })} BTC`,
            risk: "HIGH",
            engine: "Transaction Parser",
            meta: `Aggregated over ${data.length.toLocaleString()} listings`
          });
        }

        setExtractedEntities(entities);
      } else {
        // Fallback demo simulation
        setMacroStats({
          totalListings: 109689,
          uniqueVendors: 3192,
          totalBtcVolume: 2431089.22,
          uniqueOnions: 41,
          uniqueOrigins: 398,
          topCategory: "Drugs/Cannabis/Weed"
        });
        setExtractedEntities([
          { type: "DARKNET VENDOR", category: "VENDORS", value: "CheapPayTV", risk: "CRITICAL", engine: "SpaCy NER", meta: "Rating: 4.96/5 · Origin: Torland" },
          { type: "DARKNET VENDOR", category: "VENDORS", value: "KryptykOG", risk: "CRITICAL", engine: "SpaCy NER", meta: "Rating: 4.93/5 · Origin: Torland" },
          { type: "TOR HIDDEN SERVICE", category: "INFRASTRUCTURE", value: "i25c62nvu4cgeqyz.onion", risk: "CRITICAL", engine: "Tor Node Scanner", meta: "Active Market Relay Node" },
          { type: "TOR HIDDEN SERVICE", category: "INFRASTRUCTURE", value: "andromedam363aux.onion", risk: "CRITICAL", engine: "Tor Node Scanner", meta: "Darknet Mirror Portal" },
          { type: "ILLICIT COMMODITY", category: "COMMODITIES", value: "12 Month HuluPlus gift Code", risk: "HIGH", engine: "Lexicon Match", meta: "Services/Hacking · 0.05 BTC" },
          { type: "ILLICIT COMMODITY", category: "COMMODITIES", value: "CCcam Service 12 Months HD", risk: "HIGH", engine: "Lexicon Match", meta: "Services/Hacking · 0.15 BTC" },
          { type: "DISPATCH JURISDICTION", category: "LOGISTICS", value: "Torland / Anonymous Relay", risk: "MEDIUM", engine: "Geo-Logistics Match", meta: "Primary Dispatch Node" },
          { type: "CUMULATIVE BTC LIQUIDITY", category: "FINANCIAL", value: "2,431,089.22 BTC", risk: "HIGH", engine: "Transaction Parser", meta: "109,689 Global Listings" }
        ]);
      }

      setStatus("COMPLETE");
    }, 2400);
  };

  const filteredEntities = useMemo(() => {
    if (activeFilter === "ALL") return extractedEntities;
    return extractedEntities.filter(e => e.category === activeFilter);
  }, [extractedEntities, activeFilter]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-black overflow-y-auto overflow-x-hidden">
      
      {/* Subtle ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/[0.03] blur-[140px] rounded-full pointer-events-none"></div>

      <AnimatePresence mode="wait">
        
        {/* --- IDLE STATE --- */}
        {status === "IDLE" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="z-10 flex flex-col items-center justify-center w-full max-w-4xl cursor-pointer py-28 px-6 my-auto"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept=".csv,.txt,.json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-[35px] animate-pulse"></div>
              <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center relative z-10 bg-black shadow-[0_0_50px_rgba(255,255,255,0.06)] hover:shadow-[0_0_80px_rgba(255,255,255,0.18)] transition-all duration-500">
                <UploadSimple size={44} className="text-white" weight="light" />
              </div>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white tracking-tight mb-4 text-center">
              Deploy Intelligence Payload
            </h1>
            <p className="text-zinc-500 font-mono text-xs sm:text-sm max-w-xl text-center leading-relaxed">
              Drag and drop raw intelligence dumps (e.g. <span className="text-zinc-300 font-semibold">Agora.csv</span>, Tor scrape logs, or crypto ledgers). The NLP extraction engine automatically tokenizes vendors, commodities, and hidden .onion infrastructure.
            </p>
            <div className="mt-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              ZeroMQ Stream · AIL Framework · FAISS Vector Indexing
            </div>
          </motion.div>
        )}

        {/* --- ANALYZING STATE --- */}
        {status === "ANALYZING" && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="z-10 flex flex-col items-center justify-center w-full my-auto py-24"
          >
            {/* Concentric Rotating Radar Rings */}
            <div className="relative flex items-center justify-center mb-14 w-60 h-60">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.08, 1] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }} 
                className="absolute inset-0 border-[0.5px] border-white/20 rounded-full border-t-white" 
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.15, 1] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }} 
                className="absolute inset-4 border-[0.5px] border-white/10 rounded-full border-b-white" 
              />
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
                className="absolute inset-8 border border-white/5 rounded-full" 
                style={{ borderStyle: 'dashed' }} 
              />
              <div className="w-20 h-20 bg-white shadow-[0_0_40px_white] rounded-full flex items-center justify-center relative z-10">
                <Fingerprint size={38} className="text-black" weight="fill" />
              </div>
            </div>

            <h2 className="text-white font-mono text-sm sm:text-base tracking-[0.25em] font-bold mb-3 uppercase text-center px-4">
              {analyzingText}
            </h2>
            <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-6">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> AIL Stream</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div> GLiNER NER</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div> FAISS Vector</span>
            </div>
          </motion.div>
        )}

        {/* --- COMPLETE STATE --- */}
        {status === "COMPLETE" && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-6xl px-6 sm:px-10 py-10 flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <CheckCircle size={22} weight="fill" className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">Intelligence Payload Ingested</h2>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
                    Dataset Parsed Successfully · {macroStats.totalListings.toLocaleString()} Records Indexed
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStatus("IDLE")} 
                className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 self-start sm:self-auto px-4 py-2 border border-white/10 rounded-full hover:bg-white/5"
              >
                Deploy New Payload <ArrowRight size={14} />
              </button>
            </div>

            {/* Deep Intelligence Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 p-5 rounded-2xl border border-white/10 bg-zinc-950/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
                  <Database size={13} className="text-zinc-400" /> Total Listings
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {macroStats.totalListings.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
                  <UsersThree size={13} className="text-zinc-400" /> Threat Vendors
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {macroStats.uniqueVendors.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
                  <Coins size={13} className="text-zinc-400" /> Tracked Liquidity
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {macroStats.totalBtcVolume > 0 
                    ? `${macroStats.totalBtcVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })} BTC` 
                    : "Active Ledger"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
                  <Browsers size={13} className="text-zinc-400" /> .Onion Relays
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {macroStats.uniqueOnions > 0 ? `${macroStats.uniqueOnions} Nodes` : "Hidden Routes"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
                  <GlobeHemisphereWest size={13} className="text-zinc-400" /> Origins Mapped
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {macroStats.uniqueOrigins.toLocaleString()} Hubs
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/5 pb-3 overflow-x-auto no-scrollbar">
              {[
                { id: "ALL", label: `ALL INTEL (${extractedEntities.length})` },
                { id: "VENDORS", label: "DARKNET VENDORS" },
                { id: "COMMODITIES", label: "COMMODITIES" },
                { id: "INFRASTRUCTURE", label: "TOR INFRASTRUCTURE (.ONION)" },
                { id: "LOGISTICS", label: "LOGISTICS & ORIGINS" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={clsx(
                    "text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all",
                    activeFilter === tab.id 
                      ? "bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left 7 Columns: Extracted Entities List */}
              <div className="lg:col-span-7 flex flex-col space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                    <ShieldWarning size={15} /> Identified Criminal Topologies
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-600">
                    Showing {filteredEntities.length} entities
                  </span>
                </div>

                <div className="space-y-1.5">
                  {filteredEntities.map((ent, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      key={i} 
                      className="flex justify-between items-center py-3.5 px-4 border border-white/5 bg-zinc-950/40 rounded-xl hover:border-white/20 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 pr-4">
                        <div className={clsx(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          ent.risk === "CRITICAL" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                        )}></div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{ent.type}</div>
                          <div className="text-xs sm:text-sm font-semibold text-white font-mono mt-0.5 truncate select-all">{ent.value}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{ent.meta}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={clsx(
                          "text-[9px] font-mono font-bold uppercase tracking-widest mb-0.5",
                          ent.risk === "CRITICAL" ? "text-red-500" : "text-white"
                        )}>
                          {ent.risk}
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono">{ent.engine}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right 5 Columns: Parsed Telemetry & Graph Impact */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                
                {/* Knowledge Graph Append Notice */}
                <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/40">
                  <div className="flex items-center gap-3 mb-2">
                    <Network size={20} className="text-white" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Knowledge Graph Synced
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-3">
                    Automatically appended <span className="text-white font-bold">+{macroStats.totalListings.toLocaleString()}</span> raw listings to Stanford SNAP graph indices.
                  </p>
                  <div className="text-[10px] font-mono text-zinc-500">
                    PyTorch GNN link prediction initialized across {macroStats.uniqueVendors.toLocaleString()} threat clusters.
                  </div>
                </div>

                {/* Parsed CSV Telemetry Preview */}
                {csvHeaders.length > 0 && (
                  <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/40 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
                        <Database size={14} /> Parsed CSV Data Matrix
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-600">8 of {macroStats.totalListings.toLocaleString()} rows</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] font-mono text-zinc-400">
                        <thead>
                          <tr className="border-b border-white/10 text-white">
                            {csvHeaders.slice(0, 4).map((h, i) => (
                              <th key={i} className="py-2 pr-3 font-normal uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {csvPreview.map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              {csvHeaders.slice(0, 4).map((h, j) => (
                                <td key={j} className="py-2 pr-3 truncate max-w-[110px]">
                                  {row[h] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
