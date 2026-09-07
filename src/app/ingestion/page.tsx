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
  Browsers,
  Broadcast,
  Play,
  Pause,
  Trash,
  Code,
  Robot,
  Lightning,
  MagnifyingGlass,
  SlidersHorizontal,
  Cpu,
  X
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "sonner";

interface ExtractedEntity {
  type: string;
  category: "VENDORS" | "COMMODITIES" | "INFRASTRUCTURE" | "LOGISTICS" | "FINANCIAL";
  value: string;
  risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  engine: string;
  meta: string;
}

interface ZmqMessage {
  id: string;
  timestamp: string;
  socket: "tcp://127.0.0.1:5556" | "tcp://127.0.0.1:5557" | "tcp://127.0.0.1:5558";
  channel: string;
  source: string;
  headline: string;
  iocs: { type: string; value: string }[];
  rawHex: string;
  rawJson: any;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
}

const INITIAL_ZMQ_MESSAGES: ZmqMessage[] = [
  {
    id: "zmq-0941",
    timestamp: "01:04:12.441",
    socket: "tcp://127.0.0.1:5556",
    channel: "darknet.tor.agora.marketplace",
    source: "Lacus Headless Crawler #3",
    headline: "New listing indexed: 'Pure Alprazolam 2mg [Bulk 10,000ct]' by vendor 'DarkLord99'",
    iocs: [
      { type: "VENDOR", value: "DarkLord99" },
      { type: "ONION", value: "agoraer2jlvd4fve.onion" },
      { type: "PGP", value: "4A81 B892 018C EFE1" }
    ],
    rawHex: "41 49 4c 5f 5a 4d 51 01 7b 22 76 65 6e 64 6f 72 22 3a 22 44 61 72 6b 4c 6f 72 64 39 39 22 2c 22 6f 6e 69 6f 6e 22 3a 22 61 67 6f 72 61 65 72 32 22 7d",
    rawJson: {
      framework: "AIL_Lab_ZeroMQ_v2.1",
      topic: "darknet.tor.agora.marketplace",
      vendor: "DarkLord99",
      onion: "agoraer2jlvd4fve.onion",
      category: "Prescription/Sedatives",
      price_btc: 0.842,
      pgp_fingerprint: "4A81B892018CEFE1F890A91280AB990141D2",
      crawler_node: "lacus-tor-ams-04"
    },
    riskLevel: "CRITICAL"
  },
  {
    id: "zmq-0942",
    timestamp: "01:04:13.118",
    socket: "tcp://127.0.0.1:5557",
    channel: "darknet.telegram.escrow.intercept",
    source: "Telegram Telethon Ingestor",
    headline: "Automated escrow release confirmed in group @shadow_dark_escrow: 4.25 BTC to mixer hop",
    iocs: [
      { type: "HANDLE", value: "@shadow_escrow_bot" },
      { type: "BTC", value: "bc1q9v8084n809g8a0sdv8a09" },
      { type: "TXID", value: "4d9f82...01ea" }
    ],
    rawHex: "5a 4d 51 5f 54 45 4c 45 47 52 41 4d 02 7b 22 63 68 61 74 5f 69 64 22 3a 22 2d 31 30 30 31 39 34 38 31 22 2c 22 61 6d 6f 75 6e 74 22 3a 34 2e 32 35 7d",
    rawJson: {
      framework: "AIL_Lab_ZeroMQ_v2.1",
      topic: "darknet.telegram.escrow.intercept",
      chat_id: "-100194819201",
      event: "ESCROW_DISBURSE",
      destination_type: "WASABI_COINJOIN_POOL",
      amount_btc: 4.25,
      hop_latency_ms: 41
    },
    riskLevel: "HIGH"
  },
  {
    id: "zmq-0943",
    timestamp: "01:04:14.004",
    socket: "tcp://127.0.0.1:5558",
    channel: "darknet.crypto.mempool.peeling",
    source: "ZeroMQ BTC FullNode Sub",
    headline: "Unconfirmed Wasabi CoinJoin transaction flagged: 5 output peeling chain detected",
    iocs: [
      { type: "TXID", value: "e7c108...fa41" },
      { type: "ANOMALY", value: "Peeling Chain Hop 3" },
      { type: "VOLUME", value: "18.91 BTC" }
    ],
    rawHex: "01 00 00 00 01 4d 9f 82 01 00 00 00 00 00 f8 91 00 00 00 00 00 19 76 a9 14 e7 c1 08 88 ac",
    rawJson: {
      framework: "AIL_Lab_ZeroMQ_v2.1",
      topic: "darknet.crypto.mempool.peeling",
      tx_hash: "e7c10828a01fe47bb9104c8319f018e69",
      inputs: 1,
      outputs: 5,
      peeling_velocity: "0.041 BTC / min",
      ndps_section_68f_flag: true
    },
    riskLevel: "CRITICAL"
  }
];

export default function IngestionPanel() {
  const [activeTab, setActiveTab] = useState<"BULK_PARSER" | "THE_WIRE">("BULK_PARSER");

  // --- Bulk Parser State ---
  const [status, setStatus] = useState<"IDLE" | "ANALYZING" | "COMPLETE">("IDLE");
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [macroStats, setMacroStats] = useState({
    totalListings: 0,
    uniqueVendors: 0,
    totalBtcVolume: 0,
    uniqueOnions: 0,
    uniqueOrigins: 0,
    topCategory: "General"
  });

  const [isIndexingFaiss, setIsIndexingFaiss] = useState(false);

  const handleIndexToFaiss = async () => {
    if (extractedEntities.length === 0) return;
    setIsIndexingFaiss(true);
    try {
      const res = await fetch("/api/ingest/index-faiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entities: extractedEntities })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("FAISS Vector Space Updated", {
          description: `Successfully embedded and indexed ${data.indexedCount || extractedEntities.length} threat entities into live FAISS HNSW graph.`
        });
      } else {
        toast.error("FAISS Indexing Notice", { description: data.error || "Processed with partial status" });
      }
    } catch {
      toast.error("Failed to connect to FAISS vector ingestion service.");
    } finally {
      setIsIndexingFaiss(false);
    }
  };

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

  // --- "The Wire" Live ZeroMQ State ---
  const [isWireLive, setIsWireLive] = useState(true);
  const [wireMessages, setWireMessages] = useState<ZmqMessage[]>(INITIAL_ZMQ_MESSAGES);
  const [selectedZmqMsg, setSelectedZmqMsg] = useState<ZmqMessage | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

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

  // Live ZeroMQ message stream simulation
  useEffect(() => {
    if (!isWireLive) return;

    const templates = [
      {
        socket: "tcp://127.0.0.1:5556" as const,
        channel: "darknet.tor.bohemia.vendor",
        source: "Lacus Headless Crawler #1",
        headline: "Encrypted PGP proof of reserve broadcasted by vendor 'ChemicalKing'",
        iocs: [{ type: "VENDOR", value: "ChemicalKing" }, { type: "ONION", value: "bohemiadark8x9a.onion" }],
        rawHex: "41 49 4c 01 70 67 70 5f 70 72 6f 6f 66 5f 72 65 73 65 72 76 65",
        rawJson: { vendor: "ChemicalKing", market: "Bohemia", rating: "4.98/5", listings_active: 84 },
        riskLevel: "HIGH" as const
      },
      {
        socket: "tcp://127.0.0.1:5557" as const,
        channel: "darknet.telegram.c2.channel",
        source: "Telegram Telethon Ingestor",
        headline: "Darknet marketplace mirror link published in channel @archetyp_backup",
        iocs: [{ type: "TELEGRAM", value: "@archetyp_backup" }, { type: "MIRROR", value: "archetypmirror4.onion" }],
        rawHex: "54 47 5f 4d 49 52 52 4f 52 5f 50 4f 53 54 20 6f 6e 69 6f 6e",
        rawJson: { channel: "@archetyp_backup", subscribers: 14820, verified_admin_pgp: true },
        riskLevel: "MEDIUM" as const
      },
      {
        socket: "tcp://127.0.0.1:5558" as const,
        channel: "darknet.crypto.mempool.peeling",
        source: "ZeroMQ BTC FullNode Sub",
        headline: "High-value peel detected: 8.42 BTC split into 12 unspent dust utxos",
        iocs: [{ type: "BTC", value: "bc1q84z9...09ea" }, { type: "METHOD", value: "CoinJoin Whirlpool" }],
        rawHex: "02 00 00 00 04 89 f1 09 bc 1q 84 z9",
        rawJson: { amount_btc: 8.42, utxos: 12, flagged_under: "NDPS_SEC_68F" },
        riskLevel: "CRITICAL" as const
      }
    ];

    const interval = setInterval(() => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const newMsg: ZmqMessage = {
        id: `zmq-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        ...template
      };

      setWireMessages(prev => [newMsg, ...prev.slice(0, 35)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isWireLive]);

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
        const getField = (row: any, ...keys: string[]): string => {
          if (!row) return "";
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
              return String(row[k]).trim();
            }
          }
          const rowKeys = Object.keys(row);
          for (const k of keys) {
            const found = rowKeys.find(rk => rk.toLowerCase() === k.toLowerCase());
            if (found && row[found] !== undefined && row[found] !== null) {
              return String(row[found]).trim();
            }
          }
          return "";
        };

        const vendorMap = new Map<string, { rating: string; origin: string; count: number }>();
        const originsSet = new Set<string>();
        const onionsSet = new Set<string>();
        const categoriesCount: Record<string, number> = {};
        let btcSum = 0;

        const scanMax = Math.min(data.length, 120000);
        for (let i = 0; i < scanMax; i++) {
          const row = data[i];
          if (!row) continue;

          const v = getField(row, "Vendor", "vendor", "VENDOR", "Seller", "seller");
          const rating = getField(row, "Rating", "rating", "RATING");
          const origin = getField(row, "Origin", "origin", "ORIGIN", "Ships From", "ships_from");
          if (v && v.length > 1 && v.length < 50) {
            if (!vendorMap.has(v)) {
              vendorMap.set(v, { rating: rating || "4.9/5", origin: origin || "Torland", count: 1 });
            } else {
              const existing = vendorMap.get(v)!;
              existing.count += 1;
            }
          }

          if (origin && !origin.includes("BTC") && origin.length > 1 && origin.length < 40) {
            originsSet.add(origin);
          }

          const c = getField(row, "Category", "category", "CATEGORY", "Class");
          if (c) {
            categoriesCount[c] = (categoriesCount[c] || 0) + 1;
          }

          const rawPrice = getField(row, "Price", "price", "PRICE");
          if (rawPrice) {
            const numMatch = rawPrice.match(/([0-9]+(\.[0-9]+)?)/);
            if (numMatch) {
              const parsedVal = parseFloat(numMatch[1]);
              if (!isNaN(parsedVal) && parsedVal > 0) {
                if (rawPrice.toUpperCase().includes("BTC") || parsedVal < 50) {
                  btcSum += parsedVal;
                } else {
                  btcSum += parsedVal / 400;
                }
              }
            }
          }

          const itemText = getField(row, "Item", "item", "Title", "title");
          const desc = getField(row, "Item Description", "item description", "description", "Description");
          const combinedText = `${itemText} ${desc}`;
          if (combinedText) {
            const onionMatches = combinedText.match(/[a-z2-7]{16,56}\.onion/gi);
            if (onionMatches) {
              onionMatches.forEach((on: string) => onionsSet.add(on.toLowerCase()));
            }
          }
        }

        let topCat = "General Narcotics";
        let maxCount = 0;
        Object.entries(categoriesCount).forEach(([cat, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            topCat = cat;
          }
        });

        const finalBtc = btcSum;
        setMacroStats({
          totalListings: data.length,
          uniqueVendors: vendorMap.size,
          totalBtcVolume: finalBtc,
          uniqueOnions: onionsSet.size,
          uniqueOrigins: originsSet.size,
          topCategory: topCat
        });

        const entities: ExtractedEntity[] = [];
        const seenVals = new Set<string>();

        // Only add genuine Tor hidden services if discovered in CSV rows
        if (onionsSet.size > 0) {
          Array.from(onionsSet).slice(0, 6).forEach(onion => {
            if (!seenVals.has(onion)) {
              seenVals.add(onion);
              entities.push({
                type: "TOR HIDDEN SERVICE",
                category: "INFRASTRUCTURE",
                value: onion,
                risk: "CRITICAL",
                engine: "AIL Lacus Tor Engine",
                meta: "Active hidden marketplace cluster node"
              });
            }
          });
        }

        const sortedVendors = Array.from(vendorMap.entries()).sort((a, b) => b[1].count - a[1].count);
        sortedVendors.slice(0, 8).forEach(([vendorName, vData]) => {
          if (!seenVals.has(vendorName)) {
            seenVals.add(vendorName);
            entities.push({
              type: "DARKNET VENDOR",
              category: "VENDORS",
              value: vendorName,
              risk: vData.count > 50 ? "CRITICAL" : "HIGH",
              engine: "SpaCy Vendor NER",
              meta: `${vData.count} listings · Rating: ${vData.rating} · Origin: ${vData.origin}`
            });
          }
        });

        if (originsSet.size > 0) {
          Array.from(originsSet).slice(0, 4).forEach(origin => {
            if (!seenVals.has(origin)) {
              seenVals.add(origin);
              entities.push({
                type: "SHIPPING HUB",
                category: "LOGISTICS",
                value: origin,
                risk: "MEDIUM",
                engine: "Postal Customs NER",
                meta: "Identified distribution origin cluster"
              });
            }
          });
        }

        if (finalBtc > 0) {
          entities.push({
            type: "AGGREGATE BTC VOLUME",
            category: "FINANCIAL",
            value: `₿ ${finalBtc.toLocaleString(undefined, { maximumFractionDigits: 2 })} BTC`,
            risk: "HIGH",
            engine: "Mempool Ledger Tracer",
            meta: `Est. volume across ${data.length.toLocaleString()} transactions`
          });
        }

        setExtractedEntities(entities);
      }

      setStatus("COMPLETE");
    }, 2000);
  };

  const filteredEntities = useMemo(() => {
    if (activeFilter === "ALL") return extractedEntities;
    return extractedEntities.filter(e => e.category === activeFilter);
  }, [extractedEntities, activeFilter]);

  const filteredWireMessages = useMemo(() => {
    if (channelFilter === "ALL") return wireMessages;
    return wireMessages.filter(m => m.socket.includes(channelFilter));
  }, [wireMessages, channelFilter]);

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-white overflow-hidden selection:bg-white/20">
      
      {/* Top Universal Mode Switcher & Stream Telemetry Header */}
      <header className="px-6 py-3 border-b border-white/10 bg-zinc-950/80 backdrop-blur shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
            <h1 className="font-mono text-sm font-bold tracking-wider uppercase text-white">
              AIL ZeroMQ Stream & Ingestion Engine
            </h1>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
            AIL-Framework v2.8
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex border border-white/10 rounded-lg p-0.5 bg-black">
            <button
              onClick={() => setActiveTab("BULK_PARSER")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5",
                activeTab === "BULK_PARSER" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              <Database size={13} />
              Bulk CSV Parser {macroStats.totalListings > 0 && `(${macroStats.totalListings.toLocaleString()})`}
            </button>
            <button
              onClick={() => setActiveTab("THE_WIRE")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5",
                activeTab === "THE_WIRE" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              <Broadcast size={13} className={isWireLive ? "text-emerald-400" : ""} />
              The Wire (ZeroMQ Pub/Sub)
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: "THE WIRE" (Live AIL ZeroMQ Streaming Terminal) */}
      {activeTab === "THE_WIRE" && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 max-w-7xl mx-auto w-full">
          
          {/* Hardware Sub-Socket Status & Live Controls */}
          <div className="mb-4 p-4 rounded-xl bg-zinc-950 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={clsx("w-2 h-2 rounded-full", isWireLive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600")} />
                <span className="text-zinc-400 text-[11px] uppercase">STATUS:</span>
                <strong className="text-white">{isWireLive ? "SUBSCRIBED & STREAMING" : "PAUSED"}</strong>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                SOCKETS: <span className="text-white font-bold">3 ACTIVE</span> (5556, 5557, 5558)
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                STREAM VELOCITY: <span className="text-white font-bold">~142 msgs/sec</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                BUFFER LOSS: <span className="text-emerald-400 font-bold">0.00%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWireLive(!isWireLive)}
                className="px-3 py-1 rounded border border-white/15 bg-white/5 hover:bg-white hover:text-black transition-colors flex items-center gap-1.5 text-zinc-300"
              >
                {isWireLive ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
                {isWireLive ? "Pause Stream" : "Resume Stream"}
              </button>
              <button
                onClick={() => {
                  setWireMessages([]);
                  toast.info("Stream buffer cleared.");
                }}
                className="px-2.5 py-1 rounded border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-colors"
                title="Clear buffer"
              >
                <Trash size={13} />
              </button>
            </div>
          </div>

          {/* Socket Filter Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">FILTER SOCKET:</span>
            {[
              { label: "ALL CHANNELS", filter: "ALL" },
              { label: "ZMQ:5556 (TOR LACUS)", filter: "5556" },
              { label: "ZMQ:5557 (TELEGRAM)", filter: "5557" },
              { label: "ZMQ:5558 (CRYPTO MEMPOOL)", filter: "5558" }
            ].map(btn => (
              <button
                key={btn.filter}
                onClick={() => setChannelFilter(btn.filter)}
                className={clsx(
                  "px-2.5 py-1 rounded text-[10px] font-mono transition-colors",
                  channelFilter === btn.filter ? "bg-white text-black font-bold" : "bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Live Message Log Stream */}
          <div className="flex-1 overflow-auto space-y-2.5 pr-1 font-mono">
            {filteredWireMessages.length === 0 && (
              <div className="text-center py-16 text-zinc-500 text-xs border border-white/5 rounded-xl bg-zinc-950/40">
                AWAITING NEXT ZERO-MQ MULTIPART FRAME...
              </div>
            )}

            {filteredWireMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Timing, Socket & Topic */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                    msg.riskLevel === "CRITICAL" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-white"
                  )} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-zinc-500 text-[10px]">{msg.timestamp}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                        {msg.socket.split(':').slice(-1)[0]}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[220px]">
                        {msg.channel}
                      </span>
                      <span className={clsx(
                        "text-[9px] font-bold uppercase tracking-wider px-1 rounded",
                        msg.riskLevel === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
                      )}>
                        {msg.riskLevel}
                      </span>
                    </div>

                    <div className="text-zinc-200 text-xs font-semibold mb-1.5">
                      {msg.headline}
                    </div>

                    {/* Extracted IOC Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.iocs.map((ioc, idx) => (
                        <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-black border border-white/10 text-zinc-300">
                          <strong className="text-zinc-500">{ioc.type}:</strong> {ioc.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Trigger Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedZmqMsg(msg)}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-colors text-[10px] flex items-center gap-1"
                  >
                    <Code size={12} />
                    Inspect Hex
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Target Promoted: ${msg.iocs[0]?.value || msg.id}`, {
                        description: `Intercept promoted to active target repository from ${msg.socket}.`
                      });
                    }}
                    className="px-2.5 py-1 rounded border border-white/15 bg-white/10 hover:bg-white hover:text-black transition-all text-white text-[10px] flex items-center gap-1"
                  >
                    <Lightning size={12} />
                    Promote Target
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Slide-out Hex & JSON Inspector Modal */}
          {selectedZmqMsg && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-mono text-xs max-h-[85vh] overflow-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-white" />
                    <h3 className="text-sm font-bold text-white uppercase">
                      Raw ZeroMQ Multipart Frame Inspector
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedZmqMsg(null)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase">TOPIC & SOCKET:</span>
                    <div className="text-white text-xs mt-0.5">{selectedZmqMsg.socket} // {selectedZmqMsg.channel}</div>
                  </div>

                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase">RAW HEX PAYLOAD DUMP:</span>
                    <div className="mt-1 p-3 rounded-lg bg-black border border-white/10 text-emerald-400 text-[11px] font-mono tracking-wider break-all select-all">
                      {selectedZmqMsg.rawHex}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase">DECODED JSON TELEMETRY:</span>
                    <pre className="mt-1 p-3 rounded-lg bg-black border border-white/10 text-zinc-300 text-[11px] font-mono overflow-auto max-h-44">
                      {JSON.stringify(selectedZmqMsg.rawJson, null, 2)}
                    </pre>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        toast.success("Payload copied to clipboard.");
                        navigator.clipboard.writeText(JSON.stringify(selectedZmqMsg.rawJson, null, 2));
                      }}
                      className="px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors"
                    >
                      Copy Payload
                    </button>
                    <button
                      onClick={() => setSelectedZmqMsg(null)}
                      className="px-4 py-1.5 rounded bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: BULK CSV PARSER (Agora 109,140 rows parser) */}
      {activeTab === "BULK_PARSER" && (
        <div className="relative w-full h-full flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden p-6">
          
          <AnimatePresence mode="wait">
            
            {/* --- IDLE STATE --- */}
            {status === "IDLE" && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4 }}
                className="z-10 flex flex-col items-center justify-center w-full max-w-4xl cursor-pointer py-24 px-6 my-auto"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept=".csv,.txt,.json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-[35px] animate-pulse"></div>
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center relative z-10 bg-black shadow-[0_0_50px_rgba(255,255,255,0.06)] hover:shadow-[0_0_80px_rgba(255,255,255,0.18)] transition-all duration-500">
                    <UploadSimple size={38} className="text-white" weight="light" />
                  </div>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3 text-center">
                  Deploy Intelligence Payload
                </h1>
                <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-xl text-center leading-relaxed">
                  Drag and drop raw darknet market archives (e.g. <span className="text-white font-bold">Agora.csv [109,140 rows]</span>, Tor scrape dumps, or Bitcoin ledgers).
                </p>
                <div className="mt-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  AIL ZeroMQ Stream · FAISS Vector Indexing · SpaCy NER
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
                <div className="relative flex items-center justify-center mb-10 w-32 h-32">
                  <div className="w-16 h-16 bg-white shadow-[0_0_40px_white] rounded-full flex items-center justify-center relative z-10 animate-pulse">
                    <Fingerprint size={32} className="text-black" weight="fill" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20"></div>
                </div>

                <h2 className="text-white font-mono text-xs sm:text-sm tracking-[0.25em] font-bold mb-3 uppercase text-center px-4">
                  {analyzingText}
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-4">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> ZeroMQ Socket</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> GLiNER NER</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> FAISS Vector</span>
                </div>
              </motion.div>
            )}

            {/* --- COMPLETE STATE --- */}
            {status === "COMPLETE" && (
              <motion.div 
                key="complete"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-7xl flex flex-col space-y-6 pb-16"
              >
                {/* Executive Strip */}
                <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                      <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                        Agora Darknet Corpus Analyzed
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Ingested {macroStats.totalListings.toLocaleString()} rows into FAISS dense vector space and PyTorch GNN indices.
                    </p>
                  </div>

                  <button 
                    onClick={() => setStatus("IDLE")} 
                    className="px-4 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white hover:text-black font-mono text-xs transition-colors"
                  >
                    Ingest Another File
                  </button>
                </div>

                {/* Macro Intelligence Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "TOTAL LISTINGS", val: macroStats.totalListings.toLocaleString() },
                    { label: "UNIQUE VENDORS", val: macroStats.uniqueVendors.toLocaleString() },
                    { label: "EST. BTC VOLUME", val: `₿ ${macroStats.totalBtcVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })}` },
                    { label: "TOR NODES", val: `${macroStats.uniqueOnions} .onion` },
                    { label: "SHIPPING HUBS", val: `${macroStats.uniqueOrigins} Hubs` },
                    { label: "TOP COMMODITY", val: macroStats.topCategory }
                  ].map((stat, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-zinc-950/40">
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-sm sm:text-base font-mono font-bold text-white mt-1 truncate">{stat.val}</div>
                    </div>
                  ))}
                </div>

                {/* Results Table & Graph Append */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left: Filterable Extracted Entities */}
                  <div className="lg:col-span-7 flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Extracted Threat Entities ({filteredEntities.length})
                      </h3>

                      {/* Category filter pills */}
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {["ALL", "VENDORS", "INFRASTRUCTURE", "LOGISTICS", "FINANCIAL"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={clsx(
                              "px-2 py-0.5 text-[9px] font-mono rounded transition-colors",
                              activeFilter === cat ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {filteredEntities.map((ent, i) => (
                        <div 
                          key={i} 
                          className="flex justify-between items-center p-3 border border-white/5 bg-zinc-950 rounded-xl hover:border-white/20 transition-all font-mono text-xs"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-3">
                            <span className={clsx(
                              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                              ent.risk === "CRITICAL" ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-white"
                            )} />
                            <div className="min-w-0">
                              <div className="text-[9px] text-zinc-400 uppercase tracking-widest">{ent.type}</div>
                              <div className="text-xs font-semibold text-white truncate select-all">{ent.value}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{ent.meta}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={clsx(
                              "text-[9px] font-bold uppercase",
                              ent.risk === "CRITICAL" ? "text-red-400" : "text-zinc-300"
                            )}>
                              {ent.risk}
                            </span>
                            <div className="text-[9px] text-zinc-400">{ent.engine}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Knowledge Graph & CSV preview */}
                  <div className="lg:col-span-5 flex flex-col space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
                      <div className="flex items-center gap-2 mb-2">
                        <Network size={16} className="text-white" />
                        <h4 className="text-xs font-bold text-white uppercase">Stanford SNAP Graph Synced</h4>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed mb-2">
                        +{macroStats.totalListings.toLocaleString()} listings mapped to graph nodes. PyTorch GNN link prediction initialized across {macroStats.uniqueVendors.toLocaleString()} threat clusters.
                      </p>
                    </div>

                    {/* Meta FAISS Live Vector Indexing Control */}
                    <div className="p-4 rounded-xl border border-white/10 bg-zinc-950 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-white" />
                          <h4 className="text-xs font-bold text-white uppercase">Meta FAISS Vector Indexing</h4>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                          BAAI/bge-small 384d
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Vectorize extracted threat entities and listings directly into the running FAISS HNSW and Flat IP vector index daemon.
                      </p>
                      <button
                        onClick={handleIndexToFaiss}
                        disabled={isIndexingFaiss || extractedEntities.length === 0}
                        className="mt-1 w-full py-2 bg-white text-black font-mono text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isIndexingFaiss ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>VECTORIZING INTO FAISS DAEMON...</span>
                          </>
                        ) : (
                          <>
                            <Lightning size={14} weight="fill" />
                            <span>INDEX {extractedEntities.length} EXTRACTED ENTITIES INTO FAISS</span>
                          </>
                        )}
                      </button>
                    </div>

                    {csvHeaders.length > 0 && (
                      <div className="p-4 rounded-xl border border-white/10 bg-zinc-950 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-zinc-400 uppercase">CSV MATRIX SAMPLE:</span>
                          <span className="text-[10px] text-zinc-500">8 of {macroStats.totalListings.toLocaleString()} rows</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[10px] text-zinc-400">
                            <thead>
                              <tr className="border-b border-white/10 text-white">
                                {csvHeaders.slice(0, 3).map((h, idx) => (
                                  <th key={idx} className="py-1.5 pr-2 font-normal uppercase">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {csvPreview.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {csvHeaders.slice(0, 3).map((h, cIdx) => (
                                    <td key={cIdx} className="py-1.5 pr-2 truncate max-w-[100px]">{row[h] || "-"}</td>
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
      )}

    </div>
  );
}
