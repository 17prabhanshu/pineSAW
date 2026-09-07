"use client";

import { useState } from "react";
import { UploadSimple, FileText, CheckCircle, Spinner, Network, Database, Brain, ArrowRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function IngestionPanel() {
  const [status, setStatus] = useState<"IDLE" | "ANALYZING" | "COMPLETE">("IDLE");
  const [extractedEntities, setExtractedEntities] = useState<any[]>([]);

  const handleDrop = (e: any) => {
    e.preventDefault();
    startAnalysis();
  };

  const startAnalysis = () => {
    setStatus("ANALYZING");
    setTimeout(() => {
      setExtractedEntities([
        { type: "CRYPTO WALLET", value: "bc1qar0srrr7xfkvy5l643...", risk: "HIGH", engine: "Regex Parser" },
        { type: "DARKNET VENDOR", value: "ShadowBroker_99", risk: "CRITICAL", engine: "SpaCy NER" },
        { type: "NARCOTICS", value: "Fentanyl (M30)", risk: "CRITICAL", engine: "Cambridge Lexicon" },
        { type: "IP ADDRESS", value: "192.168.1.45 (Tor Exit)", risk: "MEDIUM", engine: "AIL Framework" }
      ]);
      setStatus("COMPLETE");
    }, 2500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col relative z-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Intelligence Ingestion</h1>
        <p className="text-zinc-400 font-mono text-xs mt-2 uppercase tracking-widest">
          AIL ZeroMQ Stream & Manual Payload Analysis
        </p>
      </header>

      {status === "IDLE" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 bg-zinc-900/50 rounded-3xl cursor-pointer hover:border-white/50 hover:bg-zinc-800/50 transition-all group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={startAnalysis}
        >
          <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
            <UploadSimple size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display tracking-wide">Drop Raw Intelligence Data</h2>
          <p className="text-zinc-400 font-mono text-sm max-w-md text-center">
            Upload text, JSON, or PCAP files. The ML Pipeline will automatically extract entities, classify risks, and index via FAISS.
          </p>
        </motion.div>
      )}

      {status === "ANALYZING" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mb-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 border border-white/20 rounded-full w-48 h-48 -m-12"
              style={{ borderTopColor: 'white' }}
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 border border-white/20 rounded-full w-32 h-32 -m-4"
              style={{ borderLeftColor: 'white' }}
            />
            <Brain size={64} className="text-white animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-4 font-mono uppercase tracking-widest text-center">
            Executing Semantic Extraction
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="text-white animate-pulse">GLiNER NER</span> <ArrowRight size={12} />
            <span className="text-white animate-pulse" style={{ animationDelay: '0.2s' }}>BM25 Hash</span> <ArrowRight size={12} />
            <span className="text-white animate-pulse" style={{ animationDelay: '0.4s' }}>FAISS Index</span>
          </div>
        </div>
      )}

      {status === "COMPLETE" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                <CheckCircle size={24} weight="fill" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Extraction Complete</h2>
                <p className="text-xs text-zinc-400 font-mono">Payload processed in 2.41s</p>
              </div>
            </div>
            <button onClick={() => setStatus("IDLE")} className="btn-secondary">New Upload</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                <FileText size={16} /> Extracted Entities
              </h3>
              <div className="space-y-3">
                {extractedEntities.map((ent, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex justify-between items-center p-3 border border-white/5 bg-zinc-900/50 rounded-xl"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{ent.type}</div>
                      <div className="text-sm font-bold text-white">{ent.value}</div>
                    </div>
                    <div className="text-right">
                      <div className={clsx("text-[10px] font-bold uppercase tracking-widest", ent.risk === "CRITICAL" ? "text-red-500" : "text-amber-500")}>
                        {ent.risk} RISK
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">{ent.engine}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <Network size={48} className="text-white/50 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Knowledge Graph Updated</h3>
              <p className="text-sm text-zinc-400 max-w-xs mb-6">
                4 new nodes generated. Link prediction models (GNN) have mapped 2 direct structural connections.
              </p>
              <button className="btn-gov w-full max-w-xs">View Graph Clusters</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
