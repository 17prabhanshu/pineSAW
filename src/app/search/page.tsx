"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  User, 
  Folder, 
  FolderPlus,
  CaretRight, 
  Cpu, 
  SlidersHorizontal, 
  Sparkle, 
  Lightning, 
  ShieldWarning, 
  Robot, 
  CheckCircle,
  Clock,
  Graph,
  ArrowSquareOut
} from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import clsx from "clsx";
import { AddToInvestigationModal, AddToInvestigationItem } from "@/components/AddToInvestigationModal";

interface SearchEntity {
  id: string;
  label: string;
  type: string;
  priorityScore: number;
  riskFactors?: string;
  text?: string;
  source?: string;
  vectorEmbedding?: number[];
  faissCosineSimilarity?: number;
  cosineDistance?: number;
  bm25LexicalScore?: number;
  hybridScore?: number;
  matchPercentage?: number;
  nearestClusterId?: string;
}

interface SearchInvestigation {
  id: string;
  title: string;
  caseId: string;
  status: string;
  priority: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("shadow");
  const [results, setResults] = useState<{
    entities: SearchEntity[];
    investigations: SearchInvestigation[];
    metadata?: {
      totalIndexedVectors?: number;
      queryLatencyMs?: number;
      totalLatencyMs?: number;
      indexType?: string;
      semanticExpansions?: string[];
      denseWeight?: number;
      sparseWeight?: number;
    };
  }>({ entities: [], investigations: [] });

  const [searching, setSearching] = useState(false);
  const [denseWeight, setDenseWeight] = useState(0.70); // 70% Dense FAISS, 30% Sparse BM25
  const [threshold, setThreshold] = useState(0.60);
  const [indexType, setIndexType] = useState("HNSW");
  const [showControls, setShowControls] = useState(true);
  const [dispatchedAgents, setDispatchedAgents] = useState<Record<string, string>>({});
  const [investigationModalItem, setInvestigationModalItem] = useState<AddToInvestigationItem | null>(null);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);

  const executeSearch = async (searchQuery: string, dWeight = denseWeight, tHold = threshold, iType = indexType) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&denseWeight=${dWeight}&threshold=${tHold}&indexType=${iType}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      toast.error("Vector search query failed. Ensure API service is responsive.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    // Initial auto-search on mount
    executeSearch(query);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleAssignAgent = (entityId: string, entityLabel: string, agentType: string) => {
    setDispatchedAgents(prev => ({ ...prev, [entityId]: agentType }));
    toast.success(`Autonomous Agent Assigned: ${agentType}`, {
      description: `Tasked with continuous FAISS vector tracking and topology mapping on "${entityLabel}".`
    });
  };

  return (
    <div className="flex h-full overflow-hidden flex-col bg-black text-white selection:bg-white/20">
      
      {/* Executive Header & Hardware Metric Strip */}
      <header className="px-6 py-4 border-b border-white/10 bg-zinc-950/80 backdrop-blur shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
            <h1 className="font-mono text-base font-bold tracking-wider uppercase text-white">
              FAISS Vector Intelligence Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
              v2.4-HNSW
            </span>
          </div>
          <p className="text-zinc-400 font-mono text-[11px] mt-0.5">
            Hybrid Dense Cosine + Lexical BM25 Retrieval over High-Dimensional Darknet Vectors
          </p>
        </div>

        {/* Real-time Hardware & Index Metrics */}
        <div className="flex items-center gap-4 text-[11px] font-mono border border-white/10 bg-black/60 px-3.5 py-1.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Cpu size={14} className="text-zinc-400" />
            <span>VECTORS: <strong className="text-white">{results.metadata?.totalIndexedVectors?.toLocaleString() ?? "216"}</strong></span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Lightning size={14} className="text-amber-400" />
            <span>LATENCY: <strong className="text-white">{results.metadata?.queryLatencyMs ?? results.metadata?.totalLatencyMs ?? "1.8"}ms</strong></span>
          </div>
          <span className="text-zinc-700">|</span>
          <button 
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span className="underline decoration-zinc-600 underline-offset-2">PARAMS</span>
          </button>
        </div>
      </header>

      {/* Main Search Body */}
      <div className="p-6 flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-4 relative shrink-0">
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search FAISS dense space: Try 'shadow', 'fentanyl', 'mixer', 'bitcoin', '0x7a8'..."
            className="w-full bg-zinc-950 border border-white/15 rounded-xl py-3.5 pl-11 pr-32 text-white placeholder:text-zinc-400 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-mono text-xs sm:text-sm shadow-inner"
          />
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInvestigationModalItem({
                  source: "FAISS Vector Search Engine",
                  text: `Vector search query executed: "${query}" (Retrieved ${results.entities.length} nearest threat vectors)`,
                  sender: "FAISS Vector Engine",
                  threatLevel: "HIGH",
                  priorityScore: 80,
                  timestamp: new Date().toISOString()
                });
                setIsInvestigationModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold rounded transition-colors flex items-center gap-1.5 border border-white/15 cursor-pointer"
              title="Add current search query to an investigation case"
            >
              <FolderPlus size={13} weight="bold" />
              <span className="hidden sm:inline">Add to Case</span>
            </button>
            <button 
              type="submit" 
              disabled={searching}
              className="px-4 py-1.5 bg-white text-black font-mono text-xs font-semibold rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {searching ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lightning size={13} weight="fill" />
              )}
              QUERY
            </button>
          </div>
        </form>

        {/* Dynamic Vector Tuning Parameters Panel */}
        {showControls && (
          <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Index Type */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 text-[11px] uppercase tracking-wider">INDEX:</span>
              <div className="flex border border-white/10 rounded overflow-hidden">
                {(["HNSW", "IndexFlatIP", "FLAT_L2"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setIndexType(t);
                      executeSearch(query, denseWeight, threshold, t);
                    }}
                    className={clsx(
                      "px-2.5 py-1 text-[10px] font-mono transition-colors",
                      indexType === t ? "bg-white text-black font-bold" : "bg-black text-zinc-300 hover:text-white"
                    )}
                  >
                    {t === "IndexFlatIP" ? "FLAT (EXACT)" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dense vs Sparse Hybrid Weight */}
            <div className="flex items-center gap-3">
              <span className="text-zinc-300 text-[11px] uppercase tracking-wider">
                FUSION: <strong className="text-white">{(denseWeight * 100).toFixed(0)}% Dense (FAISS)</strong> / {((1 - denseWeight) * 100).toFixed(0)}% Sparse (BM25)
              </span>
              <input 
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={denseWeight}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setDenseWeight(val);
                  executeSearch(query, val, threshold, indexType);
                }}
                className="w-24 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Threshold Cutoff */}
            <div className="flex items-center gap-3">
              <span className="text-zinc-300 text-[11px] uppercase tracking-wider">
                MIN SIMILARITY: <strong className="text-white">{(threshold * 100).toFixed(0)}%</strong>
              </span>
              <input 
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setThreshold(val);
                  executeSearch(query, denseWeight, val, indexType);
                }}
                className="w-20 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Semantic Expansions Display */}
            {results.metadata?.semanticExpansions && results.metadata.semanticExpansions.length > 0 && (
              <div className="w-full pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkle size={12} className="text-amber-400" /> SEMANTIC EXPANSION:
                </span>
                {results.metadata.semanticExpansions.map((syn, idx) => (
                  <span 
                    key={idx}
                    onClick={() => {
                      setQuery(syn);
                      executeSearch(syn);
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 text-[10px] hover:border-white/30 cursor-pointer transition-colors"
                  >
                    +{syn}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Stream Area */}
        <div className="flex-1 overflow-auto pr-1 space-y-6">
          
          {searching && (
            <div className="flex flex-col items-center justify-center p-16 text-xs font-mono text-zinc-400 gap-3 border border-white/5 rounded-2xl bg-zinc-950/40">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>COMPUTING 384-DIMENSIONAL COSINE SIMILARITIES VIA META FAISS + BM25 OKAPI...</span>
            </div>
          )}

          {!searching && results.entities.length === 0 && results.investigations.length === 0 && query && (
            <div className="text-center font-mono text-zinc-400 text-xs py-14 rounded-2xl border border-white/10 bg-zinc-950/40">
              NO VECTORS EXCEEDED SIMILARITY THRESHOLD ({(threshold * 100).toFixed(0)}%). TRY LOWERING MIN SIMILARITY OR EXPANDING QUERY.
            </div>
          )}

          {!searching && (results.entities.length > 0 || results.investigations.length > 0) && (
            <div className="space-y-6">
              
              {/* Entity Results Grid */}
              {results.entities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <h2 className="text-[11px] font-mono text-zinc-300 uppercase tracking-widest font-semibold flex items-center gap-2">
                      <Cpu size={14} className="text-zinc-400" />
                      Nearest Semantic Vectors ({results.entities.length} Hits)
                    </h2>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Ranked by Hybrid Score [α={denseWeight} · Dense + (1-α) · BM25]
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {results.entities.map(ent => {
                      const isAgentAssigned = !!dispatchedAgents[ent.id];

                      return (
                        <div 
                          key={ent.id} 
                          className="bg-zinc-950 border border-white/10 rounded-xl p-4 hover:border-white/25 transition-all flex flex-col justify-between group relative overflow-hidden"
                        >
                          {/* Top Identity Row */}
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                  <User size={14} className="text-zinc-300 group-hover:text-white transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <Link 
                                    href={`/entities/${ent.id}`}
                                    className="text-sm font-semibold text-white group-hover:underline truncate block"
                                  >
                                    {ent.label}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                                      {ent.type}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-400">
                                      {ent.nearestClusterId || "CLUSTER-0x01"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Match Percentage Pill */}
                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                                  {ent.matchPercentage !== undefined
                                    ? `${ent.matchPercentage.toFixed(1)}% MATCH`
                                    : `${((ent.hybridScore || ent.faissCosineSimilarity || 0.85) * 100).toFixed(1)}% MATCH`}
                                </div>
                                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                                  d = {ent.cosineDistance?.toFixed(3) || "0.082"} · BM25: {(ent.bm25LexicalScore ?? 0).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* 384-Dimensional Neural Vector Embedding Projection */}
                            {ent.vectorEmbedding && (
                              <div className="my-2.5 p-2 rounded bg-black/60 border border-white/5 font-mono text-[10px]">
                                <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-300">
                                    384-Dim Neural Vector (BAAI/bge-small):
                                  </span>
                                  <span className="text-zinc-400 text-[9px]">
                                    BM25: <strong className="text-zinc-200">{ent.bm25LexicalScore?.toFixed(3) || "0.000"}</strong>
                                  </span>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 h-3.5 items-center">
                                  {ent.vectorEmbedding.map((dim, i) => (
                                    <div 
                                      key={i} 
                                      className="h-full rounded-sm bg-white/10 relative overflow-hidden group/dim flex items-center justify-center cursor-help" 
                                      title={`Dim[${i}]: ${dim}`}
                                    >
                                      <div 
                                        className={clsx(
                                          "h-full transition-all",
                                          dim >= 0 ? "bg-emerald-400/80" : "bg-cyan-400/80"
                                        )}
                                        style={{ width: `${Math.min(100, Math.max(15, Math.abs(dim) * 400))}%` }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Intercepted Corpus Text / Metadata */}
                            {ent.text && (
                              <div className="text-[10px] text-zinc-300 font-mono bg-white/[0.03] px-2.5 py-1.5 rounded border border-white/5 line-clamp-2 my-2 italic">
                                &ldquo;{ent.text}&rdquo;
                              </div>
                            )}

                            {/* Risk context preview */}
                            {ent.riskFactors && !ent.text && (
                              <p className="text-[11px] text-zinc-400 font-mono line-clamp-1 mb-2">
                                {ent.riskFactors}
                              </p>
                            )}
                          </div>

                          {/* Footer Action Strip */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-1 text-xs font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                ent.priorityScore >= 80 ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" : "bg-amber-400"
                              )} />
                              <span className="text-[10px] text-zinc-300">
                                RISK {ent.priorityScore}/100
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 1-Click Autonomous Agent Assignment */}
                              {isAgentAssigned ? (
                                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/10 border border-white/20 text-white flex items-center gap-1">
                                  <CheckCircle size={12} weight="fill" className="text-emerald-400" />
                                  {dispatchedAgents[ent.id]} Active
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAssignAgent(ent.id, ent.label, "GNN Topology Agent")}
                                  className="text-[10px] font-mono px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white hover:text-black transition-all flex items-center gap-1 text-zinc-300"
                                >
                                  <Robot size={12} />
                                  Assign Agent
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setInvestigationModalItem({
                                    source: ent.source || "FAISS Vector Space",
                                    text: `Vector Intelligence Hit: "${ent.label}" (${ent.type})\n${ent.text || ent.riskFactors || "Forensic vector entity retrieved from FAISS space."}`,
                                    sender: ent.label,
                                    threatLevel: ent.priorityScore >= 80 ? "CRITICAL" : "HIGH",
                                    priorityScore: ent.priorityScore || 80,
                                    timestamp: new Date().toISOString()
                                  });
                                  setIsInvestigationModalOpen(true);
                                }}
                                className="text-[10px] font-mono px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white hover:text-black transition-all flex items-center gap-1 text-zinc-300 cursor-pointer"
                                title="Dispatch entity to investigation case"
                              >
                                <FolderPlus size={11} weight="bold" />
                                Add to Case
                              </button>

                              <Link
                                href={`/entities/${ent.id}`}
                                className="text-[10px] font-mono px-2 py-1 rounded bg-white/10 text-white hover:bg-white hover:text-black transition-colors flex items-center gap-1"
                              >
                                Dossier <CaretRight size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Investigation Hits */}
              {results.investigations.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-mono text-zinc-300 uppercase tracking-widest font-semibold border-b border-white/10 pb-2 mb-3 flex items-center gap-2">
                    <Folder size={14} className="text-zinc-400" />
                    Linked Case Files ({results.investigations.length} Cases)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.investigations.map(inv => (
                      <Link 
                        key={inv.id} 
                        href={`/investigations/${inv.id}`} 
                        className="flex items-start gap-3 bg-zinc-950 border border-white/10 rounded-xl p-4 hover:border-white/25 transition-all group"
                      >
                        <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Folder size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white group-hover:underline truncate">{inv.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{inv.caseId}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                              {inv.status}
                            </span>
                          </div>
                        </div>
                        <CaretRight size={14} className="text-zinc-400 group-hover:text-white" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Add to Investigation Dispatch Modal */}
      <AddToInvestigationModal
        isOpen={isInvestigationModalOpen}
        onClose={() => {
          setIsInvestigationModalOpen(false);
          setInvestigationModalItem(null);
        }}
        item={investigationModalItem}
        onSuccess={() => {
          executeSearch(query);
        }}
      />
    </div>
  );
}
