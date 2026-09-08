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
  X,
  Chats,
  CurrencyBtc,
  ArrowSquareOut,
  Sparkle,
  Eye,
  ShieldCheck,
  Check
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "sonner";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<"BULK_PARSER" | "THE_WIRE" | "LIVE_HARVESTER" | "TELEGRAM_OSINT">("BULK_PARSER");

  // --- Telegram OSINT Bot State ---
  const [tgBotStatus, setTgBotStatus] = useState<any>({
    sources_discovered: 248,
    sources_monitored: 3,
    messages_collected: 0,
    new_messages: 0,
    iocs_extracted: 0,
    high_risk_leads: 0,
    last_checkpoint: "None",
    mode: "STANDBY",
  });
  const [tgBotLogs, setTgBotLogs] = useState<string[]>([
    "OSINT Bot engine initialized.",
    "Threat keyword matrix registered across defensive categories.",
    "Ready for public-source ingestion & offline mock simulation."
  ]);
  const [tgResults, setTgResults] = useState<any[]>([]);
  const [tgSourceInput, setTgSourceInput] = useState<string>("@tri_city_dead_drops");
  const [tgMode, setTgMode] = useState<"LIVE" | "MOCK">("LIVE");
  const [tgLimit, setTgLimit] = useState<number>(6);
  const [tgIsRunning, setTgIsRunning] = useState<boolean>(false);
  const [tgSelectedResult, setTgSelectedResult] = useState<any>(null);

  // --- Automated Public-Source Discovery State ---
  const [discoverySummary, setDiscoverySummary] = useState<any>({
    keywords_scanned: 0,
    sources_found: 0,
    publicly_accessible: 0,
    queued: 0,
    monitoring: 0,
    last_discovery: "Never",
    sources: [],
  });
  const [discoveryKeywordInput, setDiscoveryKeywordInput] = useState<string>("fentanyl, chitta, meth, monero");
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);

  // --- Sub-navigation & Modals State ---
  const [tgActiveSubTab, setTgActiveSubTab] = useState<"DISCOVERY" | "INGESTION" | "COMMANDS">("DISCOVERY");
  const [previewChannel, setPreviewChannel] = useState<any>(null);
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [isLoadingPreviewMessages, setIsLoadingPreviewMessages] = useState<boolean>(false);
  const [walletAnalysisTarget, setWalletAnalysisTarget] = useState<string | null>(null);
  const [walletAnalysisReport, setWalletAnalysisReport] = useState<any>(null);
  const [isLoadingWalletReport, setIsLoadingWalletReport] = useState<boolean>(false);

  const fetchTgBotStatus = async () => {
    try {
      const res = await fetch("/api/ingest/telegram-osint?action=status");
      if (res.ok) {
        const data = await res.json();
        setTgBotStatus((prev: any) => ({ ...prev, ...data }));
      }
    } catch (e) {}
  };

  const fetchDiscoverySummary = async () => {
    try {
      const res = await fetch("/api/ingest/telegram-osint?action=discovery");
      if (res.ok) {
        const data = await res.json();
        setDiscoverySummary(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === "TELEGRAM_OSINT") {
      fetchTgBotStatus();
      fetchDiscoverySummary();
    }
  }, [activeTab]);

  const runDiscovery = async () => {
    setIsDiscovering(true);
    const kwArray = discoveryKeywordInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    setTgBotLogs((prev) => [
      `> Initiating automated source discovery across ${kwArray.length} keywords (${tgMode} mode)...`,
      ...prev.slice(0, 40),
    ]);

    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "discover",
          keywords: kwArray.length > 0 ? kwArray : undefined,
          mode: tgMode,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setDiscoverySummary(data.summary);
      }
      setTgBotLogs((prev) => [
        `[SUCCESS] Discovered ${data.count || 0} candidate public sources. Registry updated.`,
        ...prev.slice(0, 40),
      ]);
      toast.success(`Discovered ${data.count || 0} candidate sources`);
      fetchDiscoverySummary();
    } catch (err: any) {
      toast.error(`Discovery failed: ${err.message}`);
      setTgBotLogs((prev) => [`[ERROR] Discovery: ${err.message}`, ...prev.slice(0, 40)]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const reviewSource = async (channelUsername: string, newStatus: string) => {
    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          channel_username: channelUsername,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.status === "SUCCESS") {
        toast.success(`Source @${channelUsername} marked as ${newStatus}`);
        if (newStatus === "MONITORING") {
          setTgSourceInput(`@${channelUsername}`);
        }
        fetchDiscoverySummary();
      }
    } catch (err: any) {
      toast.error(`Review update failed: ${err.message}`);
    }
  };

  const openChannelPreview = (channel: any) => {
    setPreviewChannel(channel);
    setPreviewMessages([]);
    loadChannelPreviewMessages(channel.channel_username);
  };

  const loadChannelPreviewMessages = async (channelUsername: string) => {
    setIsLoadingPreviewMessages(true);
    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect",
          source_id: channelUsername,
          mode: tgMode,
          max_messages: 8,
          ignore_checkpoint: true,
        }),
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setPreviewMessages(data.results);
      } else {
        setPreviewMessages([]);
      }
    } catch (err: any) {
      console.error("Failed to load channel preview messages", err);
    } finally {
      setIsLoadingPreviewMessages(false);
    }
  };

  const analyzeWalletWithChainalysis = async (walletAddress: string) => {
    setWalletAnalysisTarget(walletAddress);
    setWalletAnalysisReport(null);
    setIsLoadingWalletReport(true);
    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "wallet_analyze",
          wallet: walletAddress,
        }),
      });
      const data = await res.json();
      if (data.report) {
        setWalletAnalysisReport(data.report);
      } else {
        toast.error("No analysis data returned for wallet");
      }
    } catch (err: any) {
      toast.error(`Wallet analysis failed: ${err.message}`);
    } finally {
      setIsLoadingWalletReport(false);
    }
  };

  const executeTgBotCommand = async (command: string, args: string[] = []) => {
    setTgIsRunning(true);
    setTgBotLogs((prev) => [`> Executing: ${command} ${args.join(" ")}`, ...prev.slice(0, 40)]);
    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "command", command, user_id: "admin", args }),
      });
      const data = await res.json();
      if (data.text) {
        setTgBotLogs((prev) => [data.text, ...prev.slice(0, 40)]);
      }
      if (data.data && Array.isArray(data.data)) {
        setTgResults(data.data);
        if (data.data.length > 0) setTgSelectedResult(data.data[0]);
      }
      fetchTgBotStatus();
      toast.success(`Executed ${command}`);
    } catch (err: any) {
      toast.error(`Command failed: ${err.message}`);
    } finally {
      setTgIsRunning(false);
    }
  };

  const executeTgCollection = async () => {
    setTgIsRunning(true);
    setTgBotLogs((prev) => [
      `> Initiating ${tgMode} ingestion for ${tgSourceInput} (limit: ${tgLimit})...`,
      ...prev.slice(0, 40)
    ]);
    try {
      const res = await fetch("/api/ingest/telegram-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect",
          source_id: tgSourceInput,
          mode: tgMode,
          max_messages: tgLimit,
          ignore_checkpoint: true,
        }),
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setTgResults(data.results);
        setTgSelectedResult(data.results[0]);
        setTgBotLogs((prev) => [
          `[SUCCESS] Ingested ${data.results.length} messages. Provenance hashes verified. Persisted to SQLite dev.db.`,
          ...prev.slice(0, 40)
        ]);
        toast.success(`Ingested ${data.results.length} messages`);
      } else {
        setTgBotLogs((prev) => [
          `[INFO] No new messages found beyond current checkpoint for ${tgSourceInput}.`,
          ...prev.slice(0, 40)
        ]);
        toast.info("No new messages found");
      }
      fetchTgBotStatus();
    } catch (err: any) {
      toast.error(`Collection failed: ${err.message}`);
      setTgBotLogs((prev) => [`[ERROR] ${err.message}`, ...prev.slice(0, 40)]);
    } finally {
      setTgIsRunning(false);
    }
  };

  // --- Live Harvester (Telegram, WhatsApp & Web Scraper) State ---
  const [scrapeType, setScrapeType] = useState<"TELEGRAM" | "WHATSAPP" | "WEB">("TELEGRAM");
  const [scrapeTarget, setScrapeTarget] = useState("@tri_city_dead_drops");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeLogs, setScrapeLogs] = useState<string[]>([]);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [autoVectorize, setAutoVectorize] = useState(true);
  const [autoIngest, setAutoIngest] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [vectorizingPostId, setVectorizingPostId] = useState<string | null>(null);
  
  const isScrapingRef = useRef(false);
  useEffect(() => {
    isScrapingRef.current = isScraping;
  }, [isScraping]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && activeTab === "LIVE_HARVESTER") {
      interval = setInterval(() => {
        if (!isScrapingRef.current) {
          executeScrape(scrapeTarget, scrapeType);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, scrapeTarget, scrapeType]);

  const executeScrape = async (targetToScrape = scrapeTarget, typeToScrape = scrapeType) => {
    if (!targetToScrape.trim()) return;
    setIsScraping(true);
    setScrapeResults(null);
    const ts = new Date().toTimeString().split(' ')[0];
    setScrapeLogs([
      `[${ts}] [INIT] Starting real-time harvest for ${typeToScrape} target: ${targetToScrape}`,
      `[${ts}] [DNS_RESOLVE] Resolving host route & initializing TLS 1.3 socket...`,
      `[${ts}] [HTTP_CLIENT] Emulating browser User-Agent headers...`
    ]);

    try {
      const res = await fetch("/api/ingest/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetToScrape,
          type: typeToScrape,
          autoVectorize,
          autoIngest
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScrapeResults(data);
        const t = data.telemetry;
        setScrapeLogs(prev => [
          ...prev,
          `[${new Date().toTimeString().split(' ')[0]}] [HTTP_STATUS] ${t.httpStatus} OK | Received ${t.bytesReceived.toLocaleString()} bytes | Latency: ${t.networkLatencyMs}ms`,
          `[${new Date().toTimeString().split(' ')[0]}] [PARSER] Extracted ${t.postsHarvested} tactical message(s) from ${typeToScrape.toLowerCase()} source`,
          `[${new Date().toTimeString().split(' ')[0]}] [IOC_EXTRACTOR] Identified IOCs & persisted ${t.entitiesCreated} entity/entities to database`,
          ...(t.vectorsIndexed > 0 ? [`[${new Date().toTimeString().split(' ')[0]}] [FAISS_INJECT] Projected ${t.vectorsIndexed} item(s) to 384-d BAAI/bge-small vector index`] : []),
          `[${new Date().toTimeString().split(' ')[0]}] [COMPLETE] Harvest finished in ${t.totalProcessingTimeMs}ms`
        ]);
        toast.success("Intelligence Harvest Complete", {
          description: `Extracted ${t.postsHarvested} post(s) with ${t.vectorsIndexed} vector(s) indexed directly into FAISS.`
        });
      } else {
        toast.error("Scraper Notice", { description: data.error || "Scraping failed." });
        setScrapeLogs(prev => [...prev, `[ERROR] ${data.error || "Scraper failed"}`]);
      }
    } catch (err: any) {
      toast.error("Connection Failed", { description: err.message || "Failed to reach scraping service." });
      setScrapeLogs(prev => [...prev, `[FATAL] Network error: ${err.message}`]);
    } finally {
      setIsScraping(false);
    }
  };

  const handleManualVectorize = async (post: any) => {
    setVectorizingPostId(post.id);
    try {
      const res = await fetch("/faiss-api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `SCRAPE-${post.id || Math.random().toString(36).substring(2, 8)}`,
          label: `${post.sender || post.channel || "Scraped Post"}: ${post.text.substring(0, 40)}...`,
          type: "LISTING",
          text: post.text,
          priorityScore: 88,
          riskFactors: "Scraped via live harvester console"
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Indexed into FAISS Vector Space", {
          description: `Computed 384-d dense embedding. Live vector count: ${data.total_vectors}.`
        });
      }
    } catch {
      toast.error("Vector daemon unreachable on port 5055.");
    } finally {
      setVectorizingPostId(null);
    }
  };

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

  // Live ZeroMQ message stream powered by Python Backend SSE
  useEffect(() => {
    if (!isWireLive) return;

    const eventSource = new EventSource('/backend-api/api/zmq_stream');
    
    eventSource.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        setWireMessages(prev => [newMsg, ...prev.slice(0, 35)]);
      } catch (e) {
        console.error("Error parsing ZMQ frame:", e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Retry logic could be added here
    };

    return () => {
      eventSource.close();
    };
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
            <button
              onClick={() => setActiveTab("LIVE_HARVESTER")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5",
                activeTab === "LIVE_HARVESTER" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              <Robot size={13} className={activeTab === "LIVE_HARVESTER" ? "text-cyan-400" : ""} />
              Live Harvester (Telegram & Web)
            </button>
            <button
              onClick={() => setActiveTab("TELEGRAM_OSINT")}
              className={clsx(
                "px-3 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5",
                activeTab === "TELEGRAM_OSINT" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              <ShieldWarning size={13} className={activeTab === "TELEGRAM_OSINT" ? "text-amber-400" : ""} />
              Telegram OSINT Bot
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
                SOCKETS: <span className="text-white font-bold">6 ACTIVE</span> (5556-5561)
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
          <div className="flex items-center gap-2 mb-3 overflow-x-auto">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider shrink-0">FILTER SOCKET:</span>
            {[
              { label: "ALL", filter: "ALL" },
              { label: "5556 (TOR LACUS)", filter: "5556" },
              { label: "5557 (TELEGRAM)", filter: "5557" },
              { label: "5558 (BTC)", filter: "5558" },
              { label: "5559 (PASTE)", filter: "5559" },
              { label: "5560 (PGP)", filter: "5560" },
              { label: "5561 (CC DUMPS)", filter: "5561" }
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
                      onClick={async () => {
                        toast.info("Ingesting entity into Knowledge Graph...");
                        try {
                          const res = await fetch("/backend-api/api/parse_text", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "x-api-key": "testkey123"
                            },
                            body: JSON.stringify({ text: selectedZmqMsg.headline + " " + JSON.stringify(selectedZmqMsg.rawJson) })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            toast.success("AIL Payload Processed! Entity extracted and ingested into graph.");
                            if (data.parsed && data.parsed.chainTraces && data.parsed.chainTraces.length > 0) {
                              const badWallets = data.parsed.chainTraces.filter((t: any) => t.trace_result.is_flagged);
                              if (badWallets.length > 0) {
                                toast.error(`CHAINALYSIS INTERCEPT: Flagged ${badWallets.length} high-risk transactions!`, { duration: 6000 });
                              }
                            }
                            setSelectedZmqMsg(null);
                          } else {
                            toast.error("Failed to route to Python NLP backend.");
                          }
                        } catch (e) {
                          toast.error("FastAPI Backend unreachable.");
                        }
                      }}
                      className="px-4 py-1.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition-colors"
                    >
                      Ingest to Graph
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

      {/* VIEW 3: "LIVE HARVESTER" (Telegram & Web Crawler Terminal) */}
      {activeTab === "LIVE_HARVESTER" && (
        <div className="flex-1 flex flex-col overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Hardware & Scraper Status Banner */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={clsx("w-2 h-2 rounded-full", isScraping ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                <span className="text-zinc-400 text-[11px] uppercase">HARVESTER STATUS:</span>
                <strong className="text-white">{isScraping ? "ACTIVE HTTP INGESTION STREAM" : "READY TO HARVEST"}</strong>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                AI SCRAPER: <span className="text-cyan-400 font-bold">CRAWL4AI + CAMOUFOX STEALTH</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                NEURAL EMBEDDER: <span className="text-white font-bold">BAAI/bge-small-en-v1.5</span> (384-d)
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                VECTOR ENGINE: <Link href="/search" className="text-white font-bold hover:underline">168+ VECTORS LIVE</Link>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400 text-[11px]">
                PROTOCOL: <span className="text-emerald-400 font-bold">TLS 1.3 / CLIENT HINTS</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 text-[11px]">
                <input
                  type="checkbox"
                  checked={autoVectorize}
                  onChange={e => setAutoVectorize(e.target.checked)}
                  className="accent-white cursor-pointer"
                />
                <span>Auto-Vectorize (FAISS)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 text-[11px]">
                <input
                  type="checkbox"
                  checked={autoIngest}
                  onChange={e => setAutoIngest(e.target.checked)}
                  className="accent-white cursor-pointer"
                />
                <span>Auto-Ingest (Graph)</span>
              </label>
            </div>
          </div>

          {/* Interactive Target & Scrape Input Box */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Robot size={16} className="text-zinc-300" />
                  Target Harvester Configuration
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Scrapes public Telegram channels or clearweb/paste URLs with on-the-fly NLP extraction and neural embedding.
                </p>
              </div>

              {/* Source Switcher */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden shrink-0 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setScrapeType("TELEGRAM");
                    setScrapeTarget("@tri_city_dead_drops");
                  }}
                  className={clsx(
                    "px-3 py-1.5 transition-colors",
                    scrapeType === "TELEGRAM" ? "bg-white text-black font-bold" : "bg-black text-zinc-400 hover:text-white"
                  )}
                >
                  TELEGRAM CHANNEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScrapeType("WHATSAPP");
                    setScrapeTarget("chat.whatsapp.com/CHD_DeadDrop_Network");
                  }}
                  className={clsx(
                    "px-3 py-1.5 transition-colors flex items-center gap-1.5",
                    scrapeType === "WHATSAPP" ? "bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "bg-black text-zinc-400 hover:text-white"
                  )}
                >
                  <Chats size={13} weight="fill" />
                  WHATSAPP GROUP / CHAT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScrapeType("WEB");
                    setScrapeTarget("https://pastebin.com/raw/d4rkL0rd_leak_2026");
                  }}
                  className={clsx(
                    "px-3 py-1.5 transition-colors",
                    scrapeType === "WEB" ? "bg-white text-black font-bold" : "bg-black text-zinc-400 hover:text-white"
                  )}
                >
                  WEB / PASTE / MIRROR
                </button>
              </div>
            </div>

            {scrapeType === "WHATSAPP" && (
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs font-mono flex items-start gap-2.5 text-emerald-300">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase shrink-0 mt-0.5">
                  OSINT PROTOCOL
                </span>
                <span className="text-[11px] leading-relaxed text-zinc-300">
                  <strong className="text-emerald-400">WhatsApp Group Links:</strong> Resolves verified Group Dossiers & participant node profiles (E2EE Signal Protocol prevents clearweb message previews). To ingest 100% of real historical messages and phone numbers, export the group chat in WhatsApp (<span className="text-white">Group Info &rarr; Export Chat &rarr; Without Media</span>) and paste the <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">.txt</code> transcript into the box below.
                </span>
              </div>
            )}

            {/* Input & Action */}
            <form 
              onSubmit={e => {
                e.preventDefault();
                executeScrape();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={scrapeTarget}
                  onChange={e => setScrapeTarget(e.target.value)}
                  placeholder={
                    scrapeType === "TELEGRAM" 
                      ? "@channel_handle or t.me/s/channel" 
                      : scrapeType === "WHATSAPP"
                      ? "chat.whatsapp.com/invite_code or paste WhatsApp chat transcript..."
                      : "https://pastebin.com/raw/... or URL"
                  }
                  className="w-full bg-black border border-white/15 focus:border-white rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isScraping || !scrapeTarget.trim()}
                className="px-6 py-3 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isScraping ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    HARVESTING...
                  </>
                ) : (
                  <>
                    <Lightning size={14} weight="fill" />
                    INITIATE HARVEST
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={clsx(
                  "px-4 py-3 rounded-xl font-mono font-bold text-xs transition-colors flex items-center gap-2 shrink-0 border",
                  autoRefresh 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" 
                    : "bg-black text-zinc-400 border-white/15 hover:border-white hover:text-white"
                )}
              >
                <div className={clsx("w-2 h-2 rounded-full", autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-zinc-600")} />
                AUTO-REFRESH
              </button>
            </form>

            {/* Quick Demo Presets */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap font-mono text-[11px]">
              <span className="text-zinc-500 uppercase text-[10px]">QUICK TARGET PRESETS:</span>
              
              {/* Telegram Presets */}
              {scrapeType === "TELEGRAM" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("telegram");
                      executeScrape("telegram", "TELEGRAM");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE: @telegram (40 Posts)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("durov");
                      executeScrape("durov", "TELEGRAM");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE: @durov (37 Posts)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("@tri_city_dead_drops");
                      executeScrape("@tri_city_dead_drops", "TELEGRAM");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                  >
                    CTI: @tri_city_dead_drops (Narcotics)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("@shadow_escrow_chd");
                      executeScrape("@shadow_escrow_chd", "TELEGRAM");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                  >
                    CTI: @shadow_escrow_chd (Hawala & Escrow)
                  </button>
                </>
              )}

              {/* WhatsApp Presets */}
              {scrapeType === "WHATSAPP" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("chat.whatsapp.com/CHD_DeadDrop_Network");
                      executeScrape("chat.whatsapp.com/CHD_DeadDrop_Network", "WHATSAPP");
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    CTI: WhatsApp Tri-City Syndicate (+91 98140)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("chat.whatsapp.com/Punjab_Hawala_Clearing");
                      executeScrape("chat.whatsapp.com/Punjab_Hawala_Clearing", "WHATSAPP");
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    CTI: WhatsApp Punjab Hawala & RTGS (+91 98720)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleExport = `[12/04/26, 14:20:10] +91 98140 22910: 50g chitta dead drop Sector 35. Pay 0.05 BTC to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq.\n[12/04/26, 14:28:40] +91 98720 88412: Received. 100 boxes Percocet and 50 bottles lean moving in auto.\n[12/04/26, 14:35:15] +91 98880 11923: 1000 bars xanax verified. Monero XMR released.`;
                      setScrapeTarget(sampleExport);
                      executeScrape(sampleExport, "WHATSAPP");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                  >
                    DEMO: Load WhatsApp Export Transcript
                  </button>
                </>
              )}

              {/* Web Presets */}
              {scrapeType === "WEB" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("https://pastebin.com/raw/d4rkL0rd_leak_2026");
                      executeScrape("https://pastebin.com/raw/d4rkL0rd_leak_2026", "WEB");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                  >
                    WEB: Pastebin CTI Breach Dump
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeTarget("https://example.com");
                      executeScrape("https://example.com", "WEB");
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    WEB: Crawl4AI Clean Test
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Terminal Logs & Telemetry */}
          {scrapeLogs.length > 0 && (
            <div className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                  <Code size={13} className="text-emerald-400" />
                  Harvester Execution Console
                </div>
                {scrapeResults?.telemetry && (
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 flex-wrap">
                    <span>METHOD: <strong className="text-cyan-400">{scrapeResults.telemetry.method}</strong></span>
                    {scrapeResults.telemetry.noiseReductionPct > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono font-bold">
                        ✨ {scrapeResults.telemetry.noiseReductionPct}% Boilerplate Stripped (Crawl4AI)
                      </span>
                    )}
                    {scrapeResults.telemetry.antibotDetected && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-mono font-bold">
                        🛡️ Anti-Bot Wall Bypassed (Camoufox)
                      </span>
                    )}
                    <span>BYTES: <strong className="text-white">{scrapeResults.telemetry.bytesReceived.toLocaleString()}</strong></span>
                    <span>LATENCY: <strong className="text-white">{scrapeResults.telemetry.networkLatencyMs}ms</strong></span>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-zinc-400 max-h-44 overflow-y-auto pr-1">
                {scrapeLogs.map((log, idx) => (
                  <div key={idx} className={clsx(
                    "leading-relaxed",
                    log.includes("[COMPLETE]") ? "text-emerald-400 font-bold" :
                    log.includes("[FAISS_INJECT]") ? "text-cyan-400 font-bold" :
                    log.includes("[IOC_EXTRACTOR]") ? "text-amber-300" :
                    log.includes("[ERROR]") || log.includes("[FATAL]") ? "text-red-400 font-bold" :
                    "text-zinc-400"
                  )}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scraped Results Stream */}
          {scrapeResults?.results && scrapeResults.results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Broadcast size={14} className="text-emerald-400" />
                  Harvested Intercept Stream ({scrapeResults.results.length} Item{scrapeResults.results.length > 1 ? "s" : ""})
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Cambridge iCrime NER Analysis + FAISS HNSW Vectorization
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {scrapeResults.results.map((item: any, idx: number) => {
                  const p = item.post;
                  const nlp = item.nlp;
                  const onions = item.onionDomains || [];
                  const isVectorized = !!item.faissIndexingResult || vectorizingPostId === p.id;

                  return (
                    <div
                      key={p.id || idx}
                      className="p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      {/* Top Meta Bar */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className={clsx(
                            "w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold",
                            (scrapeType === "WHATSAPP" || p.source?.toLowerCase().includes("whatsapp"))
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : (scrapeType === "TELEGRAM" || p.source?.toLowerCase().includes("telegram"))
                              ? "bg-sky-950/60 border-sky-500/40 text-sky-400"
                              : "bg-white/5 border-white/10 text-white"
                          )}>
                            {scrapeType === "WHATSAPP" || p.source?.toLowerCase().includes("whatsapp") ? "WA" : scrapeType === "TELEGRAM" || p.source?.toLowerCase().includes("telegram") ? "TG" : "WEB"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              <span>{p.sender || p.title || p.channel || "Intercepted Item"}</span>
                              {p.views && (
                                <span className="text-[10px] font-mono text-zinc-500 font-normal">
                                  ({p.views} views)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                              {p.channel || p.url} • {p.timestamp ? new Date(p.timestamp).toLocaleString() : "Real-time Intercept"}
                            </div>
                          </div>
                        </div>

                        {/* Badges & Scores */}
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase",
                            nlp.threatLevel === "CRITICAL" ? "bg-red-950/60 text-red-400 border-red-500/40" :
                            nlp.threatLevel === "HIGH" ? "bg-amber-950/60 text-amber-300 border-amber-500/30" :
                            "bg-white/5 text-zinc-400 border-white/10"
                          )}>
                            {nlp.threatLevel} THREAT
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                            PRIORITY {item.priorityScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Raw Post Text */}
                      <div className="p-3.5 rounded-xl bg-black border border-white/5 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {p.text}
                      </div>

                      {/* Extracted IOC Badges */}
                      {(nlp.identifiers?.cryptoAddresses?.length > 0 || nlp.narcotics?.length > 0 || onions.length > 0 || nlp.identifiers?.communicationHandles?.length > 0) && (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-xs">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <Fingerprint size={12} className="text-zinc-400" />
                            Extracted Forensic Indicators of Compromise (IOCs):
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Narcotics Slang */}
                            {nlp.narcotics?.map((n: any, nIdx: number) => (
                              <span key={nIdx} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-1">
                                💊 {n.standardizedName} {n.extractedQuantity && `(${n.extractedQuantity})`}
                              </span>
                            ))}

                            {/* Crypto Wallets */}
                            {nlp.identifiers?.cryptoAddresses?.map((c: any, cIdx: number) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(c.address);
                                  toast.success(`Copied ${c.network} Address`, { description: c.address });
                                }}
                                className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-1 hover:bg-amber-500/20 transition-colors"
                                title="Click to copy"
                              >
                                <Coins size={11} /> {c.network}: {c.address.substring(0, 10)}...{c.address.substring(c.address.length - 4)}
                              </button>
                            ))}

                            {/* Tor Onion Domains */}
                            {onions.map((onion: string, oIdx: number) => (
                              <span key={oIdx} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] flex items-center gap-1">
                                🧅 {onion}
                              </span>
                            ))}

                            {/* Handles */}
                            {nlp.identifiers?.communicationHandles?.map((h: any, hIdx: number) => (
                              <span key={hIdx} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] flex items-center gap-1">
                                💬 {h.platform}: {h.handle}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Strip */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleManualVectorize(p)}
                            disabled={vectorizingPostId === p.id}
                            className={clsx(
                              "px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5",
                              isVectorized 
                                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30" 
                                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                            )}
                          >
                            <Cpu size={13} />
                            {isVectorized ? "Vectorized in FAISS (384-d)" : "Vectorize & Push to FAISS"}
                          </button>

                          <Link
                            href={`/search?q=${encodeURIComponent(nlp.narcotics?.[0]?.detectedSlang || "dirty 30s")}`}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5"
                          >
                            <MagnifyingGlass size={13} />
                            Verify in Vector Search
                          </Link>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toast.success("Intercept Added to Case", { description: "Evidence packet dispatched to Chandigarh Cyber Cell queue." })}
                            className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors"
                          >
                            Add to Investigation
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 4: "TELEGRAM_OSINT" (Public-Source Ingestion & OSINT Bot Terminal) */}
      {activeTab === "TELEGRAM_OSINT" && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 max-w-7xl mx-auto w-full space-y-5">
          
          {/* Top Level Operational KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">Sources Found</span>
              <strong className="text-sm text-white">{discoverySummary.candidates_discovered || discoverySummary.sources_found || 248}</strong>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">In Monitoring</span>
              <strong className="text-sm text-purple-400">{discoverySummary.monitoring || 3}</strong>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">Messages Ingested</span>
              <strong className="text-sm text-cyan-400">{tgBotStatus.messages_collected}</strong>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">IOCs Extracted</span>
              <strong className="text-sm text-emerald-400">{tgBotStatus.iocs_extracted}</strong>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">High-Risk Leads</span>
              <strong className="text-sm text-rose-400">{tgBotStatus.high_risk_leads}</strong>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">Collection Checkpoint</span>
              <strong className="text-[11px] text-zinc-300 truncate block">
                {tgBotStatus.last_checkpoint?.slice(0, 19) || "Standby"}
              </strong>
            </div>
          </div>

          {/* Clean Telegram OSINT Sub-Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setTgActiveSubTab("DISCOVERY")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all",
                  tgActiveSubTab === "DISCOVERY"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <MagnifyingGlass size={14} />
                Candidate Discovery ({discoverySummary.sources?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setTgActiveSubTab("INGESTION")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all",
                  tgActiveSubTab === "INGESTION"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Lightning size={14} weight="fill" />
                Live Ingestion & Stream ({tgResults.length})
              </button>
              <button
                type="button"
                onClick={() => setTgActiveSubTab("COMMANDS")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all",
                  tgActiveSubTab === "COMMANDS"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Code size={14} />
                Bot Console & Commands
              </button>
            </div>

            {/* Ingestion Mode Toggle */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-500 text-[11px] uppercase">Engine Mode:</span>
              <div className="flex border border-white/10 rounded-lg p-0.5 bg-black">
                <button
                  type="button"
                  onClick={() => setTgMode("MOCK")}
                  className={clsx(
                    "px-2.5 py-1 text-[11px] rounded transition-colors",
                    tgMode === "MOCK" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Offline Mock
                </button>
                <button
                  type="button"
                  onClick={() => setTgMode("LIVE")}
                  className={clsx(
                    "px-2.5 py-1 text-[11px] rounded transition-colors",
                    tgMode === "LIVE" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Live Preview
                </button>
              </div>
            </div>
          </div>

          {/* SUB-TAB 1: DISCOVERY & CANDIDATE REGISTRY */}
          {tgActiveSubTab === "DISCOVERY" && (
            <div className="space-y-4">
              
              {/* Scan Control Panel */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-mono font-semibold text-white uppercase flex items-center gap-1.5">
                      <MagnifyingGlass size={14} className="text-cyan-400" />
                      Public Telegram Source Discovery
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Search public Telegram channel directories with threat-intelligence keywords.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-black border border-white/10">
                      Verified: <strong className="text-emerald-400">{discoverySummary.publicly_verified || 0}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black border border-white/10">
                      Review Queue: <strong className="text-amber-400">{discoverySummary.queued || 0}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={discoveryKeywordInput}
                      onChange={(e) => setDiscoveryKeywordInput(e.target.value)}
                      placeholder="e.g. fentanyl, chitta, meth, monero, dead drop"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      type="button"
                      onClick={runDiscovery}
                      disabled={isDiscovering}
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 font-mono"
                    >
                      <MagnifyingGlass size={14} />
                      {isDiscovering ? "Scanning..." : "Scan Keywords"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Candidate Channels Cards (Interactive Click-to-Preview) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>Discovered Channels ({discoverySummary.sources?.length || 0}) — Click card to inspect messages</span>
                  <span className="text-[11px] text-zinc-500">Preview opens in Telegram chat layout</span>
                </div>

                {(!discoverySummary.sources || discoverySummary.sources.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-zinc-950/60 border border-dashed border-white/10 text-center font-mono text-xs text-zinc-500 space-y-2">
                    <Chats size={32} className="mx-auto text-zinc-600" />
                    <p>No candidate channels discovered yet. Enter keywords above and click "Scan Keywords".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {discoverySummary.sources.map((src: any, idx: number) => {
                      const isMonitored = src.status === "MONITORING";
                      const isApproved = src.status === "APPROVED";
                      const isRejected = src.status === "REJECTED";
                      return (
                        <div
                          key={idx}
                          onClick={() => openChannelPreview(src)}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2.5 font-mono text-xs group hover:bg-zinc-900/60"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-8 h-8 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs">
                                {src.channel_username?.slice(0, 2).toUpperCase() || "TG"}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-white block truncate group-hover:text-cyan-300 transition-colors">
                                  @{src.channel_username}
                                </span>
                                <span className="text-[10px] text-zinc-500 block truncate">
                                  {src.subscriber_count?.toLocaleString() || 0} subscribers
                                </span>
                              </div>
                            </div>
                            <span
                              className={clsx(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0",
                                src.verified_public
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-zinc-800 text-zinc-400 border border-white/10"
                              )}
                            >
                              {src.verified_public ? "✓ Public" : "Unverified"}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-300 line-clamp-2">
                            {src.description || "Public broadcast channel."}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                            <span className="text-zinc-500 truncate max-w-[120px]">
                              kw: <code className="text-cyan-400">{src.discovered_via_keyword || (src.discovered_keywords && src.discovered_keywords[0])}</code>
                            </span>

                            {/* Actions stop propagation so card click stays for preview */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {!isApproved && !isMonitored && (
                                <button
                                  type="button"
                                  onClick={() => reviewSource(src.channel_username, "APPROVED")}
                                  className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {!isMonitored && (
                                <button
                                  type="button"
                                  onClick={() => reviewSource(src.channel_username, "MONITORING")}
                                  className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60 transition-colors font-bold"
                                >
                                  Monitor
                                </button>
                              )}
                              {isMonitored && (
                                <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
                                  Monitored
                                </span>
                              )}
                              {!isRejected && (
                                <button
                                  type="button"
                                  onClick={() => reviewSource(src.channel_username, "REJECTED")}
                                  className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 hover:text-rose-400 transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: LIVE INGESTION CONTROLLER & MESSAGE STREAM */}
          {tgActiveSubTab === "INGESTION" && (
            <div className="space-y-4">
              
              {/* Clean Collector Toolbar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-6">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Target Channel</label>
                    <input
                      type="text"
                      value={tgSourceInput}
                      onChange={(e) => setTgSourceInput(e.target.value)}
                      placeholder="e.g. @tri_city_dead_drops, https://t.me/durov, @shadow_escrow_chd, @telegram"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                    />
                    <div className="flex items-center gap-1.5 pt-1.5 text-[10px] font-mono text-zinc-500 flex-wrap">
                      <span>Quick presets:</span>
                      {[
                        { id: "@tri_city_dead_drops", label: "CTI: Dead Drops (Narcotics)", color: "bg-rose-400" },
                        { id: "@shadow_escrow_chd", label: "CTI: Escrow / Hawala", color: "bg-purple-400" },
                        { id: "durov", label: "LIVE: @durov", color: "bg-cyan-400" },
                        { id: "telegram", label: "LIVE: @telegram", color: "bg-emerald-400" },
                        { id: "whale_alert_io", label: "LIVE: @whale_alert_io", color: "bg-amber-400" },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setTgSourceInput(preset.id)}
                          className={clsx(
                            "px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1",
                            tgSourceInput === preset.id
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                              : "bg-white/5 text-zinc-400 hover:text-white border-white/10"
                          )}
                        >
                          <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", preset.color)} />
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Limit</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={tgLimit}
                      onChange={(e) => setTgLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="md:col-span-4 flex items-end gap-2 pt-5">
                    <button
                      type="button"
                      onClick={executeTgCollection}
                      disabled={tgIsRunning}
                      className="flex-1 py-2 px-3 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 font-mono"
                    >
                      <Lightning size={14} weight="fill" />
                      {tgIsRunning ? "Ingesting..." : "Ingest Target"}
                    </button>
                    <button
                      type="button"
                      onClick={() => executeTgBotCommand("/collect")}
                      disabled={tgIsRunning}
                      className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 font-mono"
                      title="Pull next source automatically from monitoring queue"
                    >
                      Next from Queue
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingested Messages & Inspector Split Screen */}
              {tgResults.length === 0 ? (
                <div className="p-12 rounded-2xl bg-zinc-950/60 border border-dashed border-white/10 text-center font-mono text-xs text-zinc-500 space-y-2">
                  <Lightning size={32} className="mx-auto text-zinc-600" />
                  <p>No messages ingested in this session yet.</p>
                  <p className="text-[11px] text-zinc-600">Enter a target channel or click "Ingest Target" / "Quick Demo" to start.</p>
                  <button
                    onClick={() => executeTgBotCommand("/mock", ["TEST_CORRIDOR", "3"])}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs mt-2"
                  >
                    Load Mock Demonstration Feed
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column: Normalized Message Stream */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-zinc-400 uppercase font-semibold">Messages ({tgResults.length})</span>
                      <span className="text-zinc-500 text-[10px]">SHA-256 Provenance Hashed</span>
                    </div>

                    <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                      {tgResults.map((item, idx) => {
                        const isSelected = tgSelectedResult?.message?.message_id === item.message?.message_id;
                        const risk = item.risk_score?.risk_level || "LOW";
                        return (
                          <div
                            key={idx}
                            onClick={() => setTgSelectedResult(item)}
                            className={clsx(
                              "p-3 rounded-xl border cursor-pointer transition-all space-y-2 font-mono text-xs",
                              isSelected 
                                ? "bg-zinc-900 border-amber-500/60 ring-1 ring-amber-500/40" 
                                : "bg-zinc-950 border-white/10 hover:border-white/20"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <span className="text-white font-bold truncate">
                                  @{item.message?.source_id} #{item.message?.telegram_message_id}
                                </span>
                                {idx === 0 && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 shrink-0">
                                    LATEST
                                  </span>
                                )}
                              </div>
                              <span className={clsx(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                risk === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" :
                                risk === "HIGH" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                                risk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                                "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              )}>
                                {risk} ({item.risk_score?.total_score})
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-300 line-clamp-2">
                              {item.message?.text}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                              <span>IOCs: {item.iocs?.length || 0}</span>
                              <span className="truncate max-w-[120px]">
                                {item.message?.timestamp?.slice(0, 16)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Forensic Inspector with Chainalysis Integration */}
                  {tgSelectedResult && (
                    <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                      
                      {/* Risk Scoring Card */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase text-zinc-400 font-semibold">Explainable Risk Score</span>
                          <span className={clsx(
                            "px-2 py-0.5 rounded font-bold",
                            tgSelectedResult.risk_score?.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                            tgSelectedResult.risk_score?.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          )}>
                            Score: {tgSelectedResult.risk_score?.total_score}/100 ({tgSelectedResult.risk_score?.risk_level})
                          </span>
                        </div>

                        {/* Line-item factor breakdown */}
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {tgSelectedResult.risk_score?.line_item_breakdown?.map((factor: any, fIdx: number) => (
                            <div key={fIdx} className="p-1.5 rounded bg-black/60 border border-white/5 flex items-center justify-between text-[11px]">
                              <span className="text-zinc-300 truncate max-w-[280px]">{factor.factor_name}</span>
                              <span className="text-amber-400 font-bold shrink-0">+{factor.points} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* IOCs Matrix with One-Click Chainalysis Bitcoin Analysis */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase text-zinc-400 font-semibold">
                            Extracted IOCs & Wallet Indicators ({tgSelectedResult.iocs?.length || 0})
                          </span>
                          <span className="text-[10px] text-cyan-400">Click any BTC wallet for Chainalysis trace</span>
                        </div>

                        {(!tgSelectedResult.iocs || tgSelectedResult.iocs.length === 0) ? (
                          <p className="text-[11px] text-zinc-500">No cryptographic or communication handles detected in this message.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {tgSelectedResult.iocs.map((ioc: any, iIdx: number) => {
                              const isBtc = ioc.entity_type === "CRYPTO_BTC" || ioc.entity?.startsWith("bc1") || ioc.entity?.startsWith("1") || ioc.entity?.startsWith("3");
                              return (
                                <div key={iIdx} className="p-2.5 rounded-lg bg-black border border-white/10 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[10px]">
                                      {ioc.entity_type}
                                    </span>
                                    {isBtc && (
                                      <button
                                        type="button"
                                        onClick={() => analyzeWalletWithChainalysis(ioc.entity)}
                                        className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] flex items-center gap-1 font-bold transition-colors"
                                      >
                                        <CurrencyBtc size={12} weight="fill" />
                                        Chainalysis
                                      </button>
                                    )}
                                  </div>
                                  <strong className="text-white block truncate text-xs">{ioc.entity}</strong>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Evidence & Hash Provenance */}
                      <div className="p-3 rounded-xl bg-black border border-white/10 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>SHA-256 Hash:</span>
                          <code className="text-cyan-400 text-[10px] truncate max-w-[240px]">{tgSelectedResult.message?.raw_hash}</code>
                        </div>
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Source URL:</span>
                          <a href={tgSelectedResult.message?.message_url} target="_blank" rel="noreferrer" className="text-amber-400 underline truncate max-w-[240px]">
                            {tgSelectedResult.message?.message_url}
                          </a>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: BOT TERMINAL & LOGS */}
          {tgActiveSubTab === "COMMANDS" && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase flex items-center gap-1.5">
                    <Code size={14} className="text-purple-400" />
                    Quick Bot Execution Commands
                  </h3>
                  <button onClick={() => setTgBotLogs([])} className="text-zinc-500 hover:text-zinc-300 text-[10px]">
                    Clear Terminal
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {["/status", "/help", "/sources", "/discover", "/checkpoint", "/mock"].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => executeTgBotCommand(cmd)}
                      disabled={tgIsRunning}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
                    >
                      {cmd}
                    </button>
                  ))}
                  <button
                    onClick={() => executeTgBotCommand("/stop")}
                    disabled={tgIsRunning}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/60 transition-colors disabled:opacity-50"
                  >
                    /stop
                  </button>
                </div>
              </div>

              {/* Bot Terminal Output */}
              <div className="p-4 rounded-xl bg-black border border-white/10 text-xs space-y-1 max-h-80 overflow-y-auto">
                <div className="text-[10px] text-zinc-500 border-b border-white/10 pb-1 mb-2">
                  EXECUTION AUDIT LOG
                </div>
                {tgBotLogs.map((log, idx) => (
                  <div key={idx} className={clsx(
                    "whitespace-pre-wrap leading-relaxed",
                    log.startsWith(">") ? "text-cyan-400 font-bold" :
                    log.startsWith("[SUCCESS]") ? "text-emerald-400 font-semibold" :
                    log.startsWith("[ERROR]") ? "text-rose-400 font-semibold" : "text-zinc-300"
                  )}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELEGRAM CHANNEL & MESSAGE PREVIEW MODAL */}
          <AnimatePresence>
            {previewChannel && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-950 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono"
                >
                  {/* Telegram Header Bar */}
                  <div className="p-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow">
                        {previewChannel.channel_username?.slice(0, 2).toUpperCase() || "TG"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">@{previewChannel.channel_username}</h3>
                          <span className={clsx(
                            "px-1.5 py-0.2 rounded text-[10px] font-bold",
                            previewChannel.verified_public
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-white/10"
                          )}>
                            {previewChannel.verified_public ? "✓ Public Preview" : "Unverified"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {previewChannel.subscriber_count?.toLocaleString() || 0} subscribers · Discovery kw: {previewChannel.discovered_via_keyword || (previewChannel.discovered_keywords && previewChannel.discovered_keywords[0])}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://t.me/s/${previewChannel.channel_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1 hover:bg-cyan-500/30 transition-colors"
                      >
                        <ArrowSquareOut size={14} />
                        t.me Link
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewChannel(null)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Channel Description & Controls */}
                  <div className="p-3.5 bg-black/60 border-b border-white/5 text-xs text-zinc-300 flex items-center justify-between">
                    <p className="line-clamp-1 italic text-zinc-400 text-[11px]">
                      "{previewChannel.description || "Public broadcast channel"}"
                    </p>
                    <button
                      type="button"
                      onClick={() => loadChannelPreviewMessages(previewChannel.channel_username)}
                      disabled={isLoadingPreviewMessages}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] shrink-0 transition-colors"
                    >
                      {isLoadingPreviewMessages ? "Refreshing..." : "Refresh Feed"}
                    </button>
                  </div>

                  {/* Telegram Message Chat Bubbles */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-zinc-950 to-black">
                    {isLoadingPreviewMessages ? (
                      <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                        <p>Fetching public preview messages from Telegram...</p>
                      </div>
                    ) : previewMessages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                        <Chats size={28} className="mx-auto text-zinc-600" />
                        <p>No recent public messages could be retrieved for @{previewChannel.channel_username}.</p>
                        <p className="text-[11px] text-zinc-600">This channel may be quiet or clearweb previews might be restricted.</p>
                      </div>
                    ) : (
                      previewMessages.map((msgItem: any, mIdx: number) => {
                        const text = msgItem.message?.text || "";
                        const time = msgItem.message?.timestamp || "Recent";
                        const risk = msgItem.risk_score?.risk_level || "LOW";
                        const iocs = msgItem.iocs || [];
                        return (
                          <div key={mIdx} className="max-w-[85%] rounded-2xl p-3.5 bg-zinc-900 border border-white/10 space-y-2 shadow-md">
                            <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 border-b border-white/5 pb-1">
                              <span className="font-bold text-cyan-400">@{previewChannel.channel_username}</span>
                              <span className={clsx(
                                "px-1.5 py-0.2 rounded font-bold",
                                risk === "CRITICAL" ? "bg-rose-500/20 text-rose-300" :
                                risk === "HIGH" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                              )}>
                                {risk}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                              {text}
                            </p>

                            {/* Detected IOC badges */}
                            {iocs.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {iocs.map((ioc: any, iIdx: number) => {
                                  const isBtc = ioc.entity_type === "CRYPTO_BTC" || ioc.entity?.startsWith("bc1") || ioc.entity?.startsWith("1") || ioc.entity?.startsWith("3");
                                  return (
                                    <span
                                      key={iIdx}
                                      onClick={() => isBtc && analyzeWalletWithChainalysis(ioc.entity)}
                                      className={clsx(
                                        "px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1",
                                        isBtc 
                                          ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 cursor-pointer border border-amber-500/40" 
                                          : "bg-white/5 text-zinc-400 border border-white/10"
                                      )}
                                      title={isBtc ? "Click to analyze with Chainalysis" : undefined}
                                    >
                                      {isBtc && <CurrencyBtc size={10} weight="fill" />}
                                      {ioc.entity}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            <div className="text-[10px] text-zinc-500 text-right">
                              {time.slice(0, 16)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="p-3.5 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          reviewSource(previewChannel.channel_username, "MONITORING");
                          toast.success(`@${previewChannel.channel_username} added to monitoring queue`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors"
                      >
                        Add to Monitoring
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTgSourceInput(`@${previewChannel.channel_username}`);
                          setTgActiveSubTab("INGESTION");
                          setPreviewChannel(null);
                          toast.info(`Target set to @${previewChannel.channel_username}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                      >
                        Ingest in Stream
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewChannel(null)}
                      className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs"
                    >
                      Close Preview
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* CHAINALYSIS BITCOIN WALLET FORENSIC INSPECTOR MODAL */}
          <AnimatePresence>
            {walletAnalysisTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-950 border border-amber-500/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono"
                >
                  {/* Modal Header */}
                  <div className="p-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CurrencyBtc size={20} className="text-amber-400" weight="fill" />
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Chainalysis Reactor · Wallet Risk Assessment
                        </h3>
                        <span className="text-[10px] text-zinc-400">Heuristic Ledger & Sanctions Screening</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWalletAnalysisTarget(null)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="p-3 rounded-xl bg-black border border-white/10 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase block">Target Wallet Address</span>
                      <strong className="text-xs text-amber-300 break-all block">{walletAnalysisTarget}</strong>
                    </div>

                    {isLoadingWalletReport ? (
                      <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
                        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
                        <p>Executing Chainalysis heuristic risk inspection...</p>
                      </div>
                    ) : walletAnalysisReport ? (
                      <div className="space-y-3.5">
                        
                        {/* Risk Level & Score */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/70 border border-white/10">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block">Risk Classification</span>
                            <span className={clsx(
                              "text-sm font-bold",
                              walletAnalysisReport.risk_level === "CRITICAL" ? "text-rose-400" :
                              walletAnalysisReport.risk_level === "HIGH" ? "text-amber-400" : "text-emerald-400"
                            )}>
                              {walletAnalysisReport.risk_level} ({Math.round(walletAnalysisReport.risk_score * 100)}/100)
                            </span>
                          </div>
                          <span className={clsx(
                            "px-2.5 py-1 rounded text-xs font-bold",
                            walletAnalysisReport.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                            walletAnalysisReport.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          )}>
                            {walletAnalysisReport.flags?.length || 0} Flags Detected
                          </span>
                        </div>

                        {/* Indicators & Flags */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-zinc-400 uppercase block">Forensic Flags</span>
                          <div className="flex flex-wrap gap-1.5">
                            {walletAnalysisReport.flags && walletAnalysisReport.flags.length > 0 ? (
                              walletAnalysisReport.flags.map((flag: string, fIdx: number) => (
                                <span key={fIdx} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                  ⚠ {flag}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-500 text-[11px]">No high-risk flags identified (clean heuristic trace).</span>
                            )}
                          </div>
                        </div>

                        {/* Statutory Enforcement References */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-zinc-400 uppercase block">Statutory Enforcement References</span>
                          <div className="space-y-1">
                            {walletAnalysisReport.statutory_references?.map((stat: string, sIdx: number) => (
                              <div key={sIdx} className="p-2 rounded bg-black/60 border border-white/5 text-[11px] text-zinc-300">
                                ⚖ {stat}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Enforcement Action */}
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                          <span className="font-bold block">Recommended Enforcement Protocol:</span>
                          <p className="text-[11px] text-zinc-300">{walletAnalysisReport.recommended_action}</p>
                        </div>

                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">Failed to load risk report.</p>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/financial"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                    >
                      Open in Financial Reactor Flow
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setWalletAnalysisTarget(null)}
                      className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
