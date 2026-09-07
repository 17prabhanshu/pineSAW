"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WarningOctagon, Folder, CheckSquareOffset, FileText, MagnifyingGlass, Funnel, Clock, CaretRight, X, Lightning } from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { NewCaseModal } from "@/components/NewCaseModal";
import { motion, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence, useSpring } from "motion/react";
import { CyberText } from "@/components/CyberText";
import { motionTokens } from "@/lib/motionTokens";

function AnimatedKPI({ label, value, color }: { label: string, value: string | number, color: string }) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(numericValue);
    } else {
      const controls = animate(count, numericValue, { duration: 1.5, ...motionTokens.springSmooth });
      return () => controls.stop();
    }
  }, [numericValue, shouldReduceMotion, count]);

  const displayValue = useTransform(rounded, (latest) => latest.toString().padStart(2, '0'));

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, motionTokens.awwwardsSpring);
  const mouseYSpring = useSpring(y, motionTokens.awwwardsSpring);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      className="flex-1 p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-zinc-300">{label}</div>
      <motion.div 
        className={clsx("text-2xl font-display font-semibold", color)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.span>{shouldReduceMotion ? (numericValue).toString().padStart(2, '0') : displayValue}</motion.span>
      </motion.div>
    </motion.div>
  );
}

function AlertFeed({ alerts }: { alerts: any[] }) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleAlerts, setVisibleAlerts] = useState<any[]>([]);

  useEffect(() => {
    let timeoutIds: any[] = [];
    if (alerts && alerts.length > 0) {
      alerts.forEach((alert, idx) => {
        const tid = setTimeout(() => {
          setVisibleAlerts(prev => {
            if (prev.find(a => a.id === alert.id)) return prev;
            return [alert, ...prev].slice(0, 10);
          });
        }, idx * 1200 + 500);
        timeoutIds.push(tid);
      });
    }
    return () => timeoutIds.forEach(clearTimeout);
  }, [alerts]);

  return (
    <motion.div 
      className="space-y-3"
      variants={shouldReduceMotion ? undefined : motionTokens.listContainer}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            variants={shouldReduceMotion ? undefined : motionTokens.listItem}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95 }}
            layout={!shouldReduceMotion}
            className="p-3 bg-zinc-900/60 border border-white/5 shadow-sm rounded-xl"
          >
            <div className="flex justify-between items-start mb-1">
              <span className={clsx("text-[10px] font-mono px-1.5 py-0.5 rounded-sm", 
                alert.severity === 'CRITICAL' ? 'bg-nexus-red/10 text-nexus-red' : 
                alert.severity === 'WARNING' ? 'bg-nexus-amber/10 text-nexus-amber' : 
                ' text-zinc-400')}>
                {alert.severity}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">just now</span>
            </div>
            <div className="text-sm text-zinc-200 font-medium">{alert.title || alert.type}</div>
            <div className="text-xs text-zinc-400 mt-1 truncate">{alert.description || "System flagged anomalous behavior."}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}


function TopoGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20 z-0 flex items-center justify-center overflow-hidden">
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M0 200 Q 250 100, 500 250 T 1000 200 M0 300 Q 250 200, 500 350 T 1000 300 M0 400 Q 250 300, 500 450 T 1000 400 M0 500 Q 250 400, 500 550 T 1000 500 M0 600 Q 250 500, 500 650 T 1000 600 M0 700 Q 250 600, 500 750 T 1000 700 M0 800 Q 250 700, 500 850 T 1000 800"
          fill="transparent"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M200 0 Q 100 250, 250 500 T 200 1000 M300 0 Q 200 250, 350 500 T 300 1000 M400 0 Q 300 250, 450 500 T 400 1000 M500 0 Q 400 250, 550 500 T 500 1000 M600 0 Q 500 250, 650 500 T 600 1000 M700 0 Q 600 250, 750 500 T 700 1000 M800 0 Q 700 250, 850 500 T 800 1000"
          fill="transparent"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
}

export default function CommandCenter() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm font-mono text-zinc-400">INITIALIZING SECURE TERMINAL...</div>;

  return (
    <div className="flex h-full overflow-hidden relative">
      
      <TopoGrid />
      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
      />
      <div className={clsx("flex-1 overflow-auto flex flex-col p-8 transition-all duration-150", selectedIncident ? "mr-[400px]" : "")}>
        
        
        {/* Breadcrumb */}

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
          <span>DARKINT</span> <CaretRight /> <span className="text-zinc-300">Command Center</span>
        </div>

        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white tracking-tight"><CyberText text="Command Center" /></h1>
          </div>
          <div className="flex gap-2">
            <Link href="/actions" className="btn-gov">
              <CheckSquareOffset size={16} /> Action Center
            </Link>
            <button 
              onClick={() => setIsNewCaseOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Folder size={16} /> New Case
            </button>
          </div>
        </header>

        
        {/* Sleek ML Ticker */}
        <div className="mb-6 bg-black border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>
              <span>AIL / ZMQ STREAMING</span>
            </div>
            <div className="w-px h-3 bg-white/20"></div>
            <span className="text-zinc-500">FAISS + BM25: <span className="text-zinc-300">NOMINAL</span></span>
            <div className="w-px h-3 bg-white/20"></div>
            <span className="text-zinc-500">PYTORCH GNN: <span className="text-zinc-300">SYNCED</span></span>
            <div className="w-px h-3 bg-white/20"></div>
            <span className="text-zinc-500">SHAP: <span className="text-zinc-300">ACTIVE</span></span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-2">
            <span>System State</span> <span className="text-white bg-white/10 px-2 py-0.5 rounded">SECURE</span>
          </div>
        </div>

        {/* Operational Status KPI Strip */}

        <div className=" glass nexus-border rounded-[2rem] flex divide-x divide-zinc-300 mb-8 overflow-hidden shadow-sm">
          {[
            { label: "Active Investigations", value: data.metrics?.investigationCount || data.activeInvestigations || "06", color: "text-white" },
            { label: "Critical Alerts", value: data.recentAlerts?.filter((a:any)=>a.severity==='CRITICAL').length || "03", color: "text-nexus-red" },
            { label: "Pending Actions", value: "11", color: "text-nexus-amber" },
            { label: "Entities Under Review", value: data.metrics?.entityCount || data.totalEntities || "42", color: "text-white" },
            { label: "Reports Pending", value: "04", color: "text-white" },
            { label: "Escalations Drafted", value: "02", color: "text-gov-blue" }
          ].map((kpi, i) => (
            <AnimatedKPI key={i} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Priority Incidents Table */}
          <div className="flex-[2] flex flex-col min-h-0 glass nexus-border rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-4 nexus-border-b  flex justify-between items-center">
              <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <WarningOctagon className="text-nexus-red" size={16} /> <CyberText text="Priority Incidents" />
              </h2>
              <div className="flex gap-2">
                <button onClick={() => toast.info("Filter Menu", { description: "Advanced filtering modal will open here." })} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"><Funnel size={14}/> Filter</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black sticky top-0 z-10 border-b border-white/10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-400">
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Primary Reason</th>
                    <th className="px-4 py-3 font-semibold">Case</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {data.topEntities?.slice(0,8).map((ent: any) => (
                    <tr 
                      key={ent.id} 
                      onClick={() => setSelectedIncident(ent)}
                      className={clsx(
                        "transition-colors cursor-pointer group",
                        selectedIncident?.id === ent.id ? "bg-gov-blue/10 border-l-2 border-l-gov-blue" : "hover:bg-zinc-800/30 border-l-2 border-l-transparent"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className={ent.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                          {ent.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200 group-hover:text-white">{ent.label}</td>
                      <td className="px-4 py-3 font-mono text-xs">{ent.priorityScore}</td>
                      <td className="px-4 py-3 text-zinc-400 truncate max-w-[200px] text-xs">
                        {ent.riskFactors ? JSON.parse(ent.riskFactors)[0] : "Multiple indicators"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gov-blue">INV-2026-0042</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toast.success("Loading Case File", { description: "Establishing secure connection to dossier..." })} className="text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-white border border-white px-3 py-1.5 rounded-full hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all">Investigate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Real-time Alert Feed */}
          <div className="flex-1 flex flex-col min-h-0 glass nexus-border rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-4 nexus-border-b  flex justify-between items-center">
              <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Lightning className="text-nexus-amber" size={16} /> <CyberText text="Live Alert Feed" />
              </h2>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-zinc-800/20">
              <AlertFeed alerts={data.recentAlerts || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {selectedIncident && (
        <div className="absolute top-0 right-0 bottom-0 w-[400px] glass rounded-l-[2.5rem] border-l border-white/10 shadow-md flex flex-col drawer-animate z-30">
          <div className="p-5 border-b border-white/10  relative">
            <button onClick={() => setSelectedIncident(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={16}/></button>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">ENTITY INCIDENT</div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">{selectedIncident.label}</h2>
            <div className="flex gap-2">
              <span className={selectedIncident.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                RISK: {selectedIncident.priorityScore}
              </span>
              <span className="badge-neutral">
                {selectedIncident.type}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-5 space-y-6">
            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Why Flagged</h3>
              <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/20 border border-white/5 p-3 rounded-[2rem]">
                Activity spike and cross-platform overlapping identifiers strongly suggest evasion tactics.
              </div>
            </section>
            
            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Risk Contribution</h3>
              <div className="space-y-1">
                {(selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors) : ["Suspicious Activity"]).map((risk: string, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs  px-2 py-1.5 rounded-[2rem] border border-white/5">
                    <span className="text-zinc-300">{risk}</span>
                    <span className="text-nexus-amber font-mono">+{(selectedIncident.priorityScore / (selectedIncident.riskFactors ? JSON.parse(selectedIncident.riskFactors).length : 1)).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <section>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Pending Actions</h3>
              <div className="bg-zinc-800/20 border border-white/5 p-3 rounded-[2rem] space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-zinc-200">Prepare Bank Request</div>
                  <span className="badge-warning">DRAFT</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-sm text-zinc-200">Review Financial Links</div>
                  <span className="badge-critical">PENDING</span>
                </div>
              </div>
            </section>
          </div>
          
          <div className="p-5 border-t border-white/10  flex gap-2">
            <button onClick={() => router.push(`/entities/${selectedIncident.id}`)} className="btn-gov flex-1 text-center">
              Open Investigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
