"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  HandCoins, 
  ShieldWarning, 
  FileText, 
  CheckCircle, 
  Clock, 
  CaretRight, 
  ShieldChevron, 
  Export, 
  X, 
  MagnifyingGlass, 
  SlidersHorizontal,
  SquaresFour,
  Stack,
  GitCommit,
  ArrowSquareOut,
  Lightning,
  Check,
  WarningCircle
} from "@phosphor-icons/react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ActionCenter() {
  const [actions, setActions] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isStackHovered, setIsStackHovered] = useState(false);
  
  // Controls (Default MATRIX for clear unblocked visibility)
  const [viewMode, setViewMode] = useState<"3D" | "MATRIX" | "PIPELINE">("MATRIX");
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/actions")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActions(data);
        }
      })
      .catch(() => {
        toast.error("Failed to load actions from intelligence core.");
      });
  }, []);

  // Filtered action list
  const filteredActions = useMemo(() => {
    return actions.filter(act => {
      const matchesSearch = 
        act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.priority?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.Investigation?.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.Entity?.label?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "ALL") return true;
      if (filter === "CRITICAL") return act.priority === "CRITICAL";
      if (filter === "HIGH") return act.priority === "HIGH";
      if (filter === "PENDING") return act.status === "PENDING";
      if (filter === "READY") return act.status === "READY";
      if (filter === "DRAFT") return act.status === "DRAFT";
      return true;
    });
  }, [actions, filter, searchQuery]);

  // Executive KPI stats
  const stats = useMemo(() => {
    const total = actions.length;
    const critical = actions.filter(a => a.priority === "CRITICAL").length;
    const ready = actions.filter(a => a.status === "READY").length;
    const pending = actions.filter(a => a.status === "PENDING").length;
    return { total, critical, ready, pending };
  }, [actions]);

  return (
    <div className="flex h-full overflow-hidden relative select-none">
      <div className={clsx("flex-1 p-6 md:p-8 flex flex-col transition-all duration-300 overflow-y-auto", selectedAction ? "mr-0 lg:mr-[460px]" : "")}>
        
        {/* Breadcrumb & Live System Pulse */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span>DARKINT</span> <CaretRight size={10} /> <span className="text-zinc-300">Operations</span> <CaretRight size={10} /> <span className="text-white font-semibold">Action Center</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DIRECTIVE ENGINE ACTIVE</span>
          </div>
        </div>

        {/* Header Title & View Layout Switcher */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">Investigative Directives</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Operational interventions, statutory evidence preparation, and procedural off-ramps.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-white/10 p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => setViewMode("3D")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                viewMode === "3D" 
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Stack size={14} weight="bold" /> 3D Cascade
            </button>
            <button
              onClick={() => setViewMode("MATRIX")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                viewMode === "MATRIX" 
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <SquaresFour size={14} weight="bold" /> Matrix
            </button>
            <button
              onClick={() => setViewMode("PIPELINE")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                viewMode === "PIPELINE" 
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <GitCommit size={14} weight="bold" /> Pipeline
            </button>
          </div>
        </header>

        {/* Executive KPI Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Total Directives</span>
            <div className="text-2xl font-display font-light text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Urgent Critical</span>
            <div className="text-2xl font-display font-bold text-red-400 mt-1">{stats.critical}</div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Ready to Execute</span>
            <div className="text-2xl font-display font-semibold text-white mt-1">{stats.ready}</div>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/30 transition-colors">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Statutory Compliance</span>
            <div className="text-2xl font-display font-semibold text-emerald-400 mt-1">100%</div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { label: "All", id: "ALL", count: actions.length },
              { label: "Critical", id: "CRITICAL", count: actions.filter(a => a.priority === "CRITICAL").length },
              { label: "High", id: "HIGH", count: actions.filter(a => a.priority === "HIGH").length },
              { label: "Pending", id: "PENDING", count: actions.filter(a => a.status === "PENDING").length },
              { label: "Ready", id: "READY", count: actions.filter(a => a.status === "READY").length },
              { label: "Draft", id: "DRAFT", count: actions.filter(a => a.status === "DRAFT").length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap",
                  filter === tab.id
                    ? "bg-white/15 border-white text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                )}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search directive..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: ENHANCED 3D CASCADE HOLOGRAPHIC DECK                            */}
        {/* Clean, perfectly readable in idle state; fans out beautifully on hover   */}
        {/* ========================================================================= */}
        {viewMode === "3D" && (
          <div 
            className="relative w-full max-w-4xl mx-auto min-h-[620px] flex items-center justify-center py-10"
            style={{ perspective: 1800 }}
            onMouseEnter={() => setIsStackHovered(true)}
            onMouseLeave={() => {
              setIsStackHovered(false);
              setHoveredCardId(null);
            }}
          >
            {filteredActions.length === 0 ? (
              <div className="text-center text-zinc-500 font-mono text-sm py-16">
                No active directives matching filter.
              </div>
            ) : (
              filteredActions.map((act, idx) => {
                const isSelected = selectedAction?.id === act.id;
                const isThisHovered = hoveredCardId === act.id;
                const totalCards = filteredActions.length;
                const centerIndex = (totalCards - 1) / 2;

                return (
                  <motion.div
                    key={act.id}
                    custom={idx}
                    onMouseEnter={() => setHoveredCardId(act.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => setSelectedAction(act)}
                    variants={{
                      // 1. IDLE: Perfectly legible architectural cascade (clean, non-cluttered spacing)
                      idle: (i) => ({
                        rotateX: 8,
                        rotateY: -2,
                        rotateZ: (i % 2 === 0 ? 0.8 : -0.8),
                        y: (i - centerIndex) * 98,
                        z: i * 18,
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 280, damping: 24 }
                      }),
                      // 2. STACK HOVERED: Expands vertically and opens up breathing room
                      hovered: (i) => {
                        const isIndividualHover = hoveredCardId === act.id;
                        return {
                          rotateX: isIndividualHover ? 0 : 4,
                          rotateY: isIndividualHover ? 0 : -2,
                          rotateZ: 0,
                          y: (i - centerIndex) * 128 + (isIndividualHover ? -10 : 0),
                          z: isIndividualHover ? 160 : 30 + i * 12,
                          x: isIndividualHover ? 0 : (i % 2 === 0 ? 10 : -10),
                          scale: isIndividualHover ? 1.03 : 1,
                          opacity: 1,
                          transition: { type: "spring", stiffness: 380, damping: 26, delay: i * 0.02 }
                        };
                      },
                      // 3. SELECTED: Hero elevation forward
                      selected: () => ({
                        rotateX: 0,
                        rotateY: 0,
                        rotateZ: 0,
                        y: (idx - centerIndex) * 110,
                        z: 220,
                        x: -30,
                        scale: 1.04,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 380, damping: 30 }
                      }),
                      // 4. UNSELECTED: Soft ambient contextual backdrop
                      unselected: (i) => ({
                        rotateX: 12,
                        rotateY: 8,
                        rotateZ: 0,
                        y: (i - centerIndex) * 110,
                        z: -80,
                        x: 35,
                        scale: 0.94,
                        opacity: 0.35,
                        transition: { type: "spring", stiffness: 350, damping: 30 }
                      })
                    }}
                    initial="idle"
                    animate={
                      selectedAction
                        ? isSelected ? "selected" : "unselected"
                        : isStackHovered ? "hovered" : "idle"
                    }
                    className={clsx(
                      "absolute w-full max-w-2xl rounded-3xl p-5 md:p-6 cursor-pointer transition-colors shadow-2xl backdrop-blur-2xl",
                      isSelected
                        ? "bg-zinc-900 border-2 border-white shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,255,255,0.15)]"
                        : isThisHovered
                        ? "bg-zinc-900/95 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.08)]"
                        : "bg-zinc-950/90 border border-white/10 hover:border-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                    )}
                    style={{
                      transformStyle: "preserve-3d",
                      zIndex: isSelected ? 60 : isThisHovered ? 50 : totalCards - idx
                    }}
                  >
                    <div className="flex items-start gap-5">
                      
                      {/* Priority and Sequence Num */}
                      <div className="w-16 shrink-0 border-r border-white/10 pr-4 flex flex-col items-center justify-center pt-1">
                        <div className="text-xs font-mono font-bold text-zinc-500 mb-1.5">0{idx + 1}</div>
                        <span className={clsx(
                          "text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded",
                          act.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 
                          act.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-white/10 text-white border border-white/20'
                        )}>
                          {act.priority}
                        </span>
                      </div>

                      {/* Directive Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base md:text-lg font-display font-semibold text-white truncate group-hover:text-zinc-200">
                            {act.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                          {act.reason}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                          {act.Investigation && (
                            <span className="text-zinc-500 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                              CASE: <span className="text-white font-bold">{act.Investigation.caseId}</span>
                            </span>
                          )}
                          {act.Entity && (
                            <span className="text-zinc-500 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                              TARGET: <span className="text-zinc-200">{act.Entity.label}</span>
                            </span>
                          )}
                          <span className="text-zinc-600 uppercase text-[10px]">
                            TYPE: {act.type?.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Inline Quick Actions */}
                      <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider border",
                          act.status === 'READY' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                          act.status === 'PENDING' ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                          "bg-white/5 text-zinc-400 border-white/10"
                        )}>
                          {act.status}
                        </span>

                        <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setSelectedAction(act);
                              toast.info("Dossier Loaded", { description: `Inspecting ${act.title}` });
                            }} 
                            className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-zinc-300 hover:text-black border border-white/15 transition-all cursor-pointer"
                          >
                            Review
                          </button>
                          <button 
                            onClick={() => {
                              toast.success("Execution Scheduled", { description: `Directives dispatched for ${act.title}` });
                            }}
                            className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          >
                            Execute
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TACTICAL MATRIX (Clean, multi-column grid with stagger lift)     */}
        {/* ========================================================================= */}
        {viewMode === "MATRIX" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5"
          >
            {filteredActions.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                onClick={() => setSelectedAction(act)}
                className={clsx(
                  "bg-zinc-950 border rounded-xl p-4.5 cursor-pointer transition-all flex flex-col justify-between group",
                  selectedAction?.id === act.id
                    ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] bg-zinc-900"
                    : "border-white/10 hover:border-white/25 hover:bg-zinc-900/40"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={clsx(
                      "text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border",
                      act.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 
                      act.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-white/10 text-white border-white/20'
                    )}>
                      {act.priority} PRIORITY
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {act.status}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-zinc-200 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {act.reason}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between mt-auto">
                  <div className="text-[10px] font-mono text-zinc-500">
                    {act.Investigation?.caseId ? `CASE: ${act.Investigation.caseId}` : "DIRECT ACTION"}
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedAction(act);
                        toast.info("Dossier Opened", { description: act.title });
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-mono bg-white/10 hover:bg-white text-zinc-300 hover:text-black transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Action Executed", { description: act.title });
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-mono bg-white text-black font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PIPELINE STREAM (Sequential procedural timeline view)           */}
        {/* ========================================================================= */}
        {viewMode === "PIPELINE" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 max-w-3xl mx-auto w-full py-4"
          >
            {filteredActions.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedAction(act)}
                className={clsx(
                  "relative flex items-center gap-6 p-5 rounded-2xl border bg-zinc-950/80 cursor-pointer transition-all",
                  selectedAction?.id === act.id
                    ? "border-white shadow-[0_0_25px_rgba(255,255,255,0.12)] bg-zinc-900"
                    : "border-white/10 hover:border-white/30 hover:bg-zinc-900/60"
                )}
              >
                {/* Pipeline index node */}
                <div className="w-10 h-10 rounded-full border border-white/20 bg-black flex items-center justify-center font-mono text-xs font-bold text-white shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-base font-display font-medium text-white truncate">{act.title}</h4>
                    <span className={clsx(
                      "text-[9px] font-mono uppercase px-2 py-0.5 rounded border",
                      act.priority === 'CRITICAL' ? 'text-red-400 border-red-500/30' : 'text-zinc-300 border-white/15'
                    )}>
                      {act.priority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{act.reason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">{act.status}</span>
                  <span className="text-xs font-mono text-white underline hover:text-zinc-300 flex items-center gap-1 justify-end">
                    Details <CaretRight size={12} />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DETAIL DRAWER: SLIDE-IN ACTION DOSSIER                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-black/95 backdrop-blur-2xl border-l border-white/15 shadow-2xl flex flex-col z-50 pt-28"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 relative">
              <button 
                onClick={() => setSelectedAction(null)} 
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-semibold">
                DIRECTIVE DOSSIER · OP-7492
              </div>
              <h2 className="text-xl font-display font-semibold text-white leading-snug mb-3 pr-8">
                {selectedAction.title}
              </h2>
              
              <div className="flex items-center gap-2">
                <span className={clsx(
                  "px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border",
                  selectedAction.status === 'READY' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                  selectedAction.status === 'PENDING' ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                  "bg-white/5 text-zinc-400 border-white/10"
                )}>
                  {selectedAction.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-white/10 text-white border border-white/20">
                  PRIORITY: {selectedAction.priority}
                </span>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Tactical Reason */}
              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                  <Lightning size={14} className="text-white" /> Operational Basis
                </h3>
                <div className="text-xs text-zinc-300 leading-relaxed p-4 bg-zinc-950 border border-white/10 rounded-2xl">
                  {selectedAction.reason}
                </div>
              </section>

              {/* Linked Case / Target Entity */}
              {(selectedAction.Investigation || selectedAction.Entity) && (
                <section className="space-y-3">
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 font-semibold">
                    Linked Context
                  </h3>
                  {selectedAction.Investigation && (
                    <div className="flex justify-between items-center p-3.5 border border-white/10 bg-zinc-950 rounded-2xl">
                      <div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Case Reference</div>
                        <div className="text-xs text-white font-medium font-mono">{selectedAction.Investigation.caseId}</div>
                      </div>
                      <Link 
                        href={`/investigations/${selectedAction.Investigation.id}`} 
                        className="text-xs text-white underline font-mono flex items-center gap-1 hover:text-zinc-300"
                      >
                        Open Case <ArrowSquareOut size={14} />
                      </Link>
                    </div>
                  )}
                  {selectedAction.Entity && (
                    <div className="flex justify-between items-center p-3.5 border border-white/10 bg-zinc-950 rounded-2xl">
                      <div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Target Actor</div>
                        <div className="text-xs text-white font-medium">{selectedAction.Entity.label}</div>
                      </div>
                      <Link 
                        href={`/entities/${selectedAction.Entity.id}`} 
                        className="text-xs text-white underline font-mono flex items-center gap-1 hover:text-zinc-300"
                      >
                        Profile <ArrowSquareOut size={14} />
                      </Link>
                    </div>
                  )}
                </section>
              )}

              {/* Statutory Foundation */}
              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                  <ShieldWarning size={14} className="text-white" /> Statutory Grounding
                </h3>
                <div className="p-4 border border-white/10 bg-zinc-950 rounded-2xl">
                  <div className="text-[11px] font-mono text-zinc-200 uppercase tracking-wide mb-1">
                    Applicable: CrPC § 91 / PMLA § 17 / IT Act § 69
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Formal legal evidentiary requirements met. Ready for jurisdictional magistrate review or competent agency authorization.
                  </p>
                </div>
              </section>

              {/* Document Generation Suite */}
              <section className="p-4 rounded-2xl border border-white/10 bg-zinc-950 space-y-3">
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <FileText size={14} className="text-white" /> Automated Dossier Generation
                </h3>
                <p className="text-xs text-zinc-400">
                  Compile verified evidence, transaction hashes, and relationship topologies into statutory format.
                </p>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => {
                      toast.success("Draft Document Compiled", {
                        description: `Prepared legal requisition targeting ${selectedAction.title}`
                      });
                    }}
                    className="w-full py-2.5 px-4 bg-white text-black rounded-xl text-xs font-mono font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <FileText size={16} weight="bold" /> Generate Draft {selectedAction.type === 'BANK_REQUEST' ? 'Bank Requisition' : 'Directives Package'}
                  </button>
                  <button 
                    onClick={() => {
                      toast.info("PDF Export Dispatched", {
                        description: "Compiling cryptographic SHA-256 sealed document."
                      });
                    }}
                    className="w-full py-2.5 px-4 bg-white/10 border border-white/15 text-white rounded-xl text-xs font-mono hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Export size={16} /> Export Sealed PDF (Court Format)
                  </button>
                </div>
              </section>

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-6 border-t border-white/10 bg-black flex gap-3">
              <button 
                onClick={() => {
                  toast.success("Directive Acknowledged", {
                    description: `Assigned to Investigator OP-7492.`
                  });
                  setSelectedAction(null);
                }}
                className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Acknowledge Directive
              </button>
              <button 
                onClick={() => {
                  toast.info("Directive Deferred", {
                    description: "Status marked for secondary review."
                  });
                  setSelectedAction(null);
                }}
                className="px-4 py-2.5 bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-mono border border-white/10 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
