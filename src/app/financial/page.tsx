"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Bank, Users, MagnifyingGlass, Funnel, CaretRight, X, TrendUp, Link as LinkIcon, Printer, Copy, ShieldCheck, Check, GitCommit, Table, PaperPlaneTilt } from "@phosphor-icons/react";
import clsx from "clsx";
import { toast } from "sonner";
import { ChainalysisReactorFlow } from "@/components/ChainalysisReactorFlow";
import { StatutoryDispatchModal } from "@/components/StatutoryDispatchModal";

export default function FinancialPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"REACTOR" | "LEDGER">("REACTOR");
  const [assetFilter, setAssetFilter] = useState<"ALL" | "BANK" | "WALLET">("ALL");
  const [queryingFIU, setQueryingFIU] = useState(false);

  // Statutory Nodal Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Legal Notice Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalNoticeDoc, setLegalNoticeDoc] = useState<any>(null);
  const [legalLoading, setLegalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/financial").then(r => r.json()).then(setAccounts);
  }, []);

  const handleGenerateNotice = async (noticeType: "SECTION_91_CRPC" | "SECTION_68F_NDPS") => {
    if (!selectedAccount) return;
    setLegalLoading(true);
    setLegalModalOpen(true);
    setCopied(false);

    try {
      const res = await fetch("/api/legal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeType,
          caseId: "INV-2026-0042",
          targetEntityLabel: selectedAccount.label,
          bankOrOrgName: selectedAccount.label.split("(")[0].trim(),
          accountNumber: selectedAccount.label.includes("Acct:") ? selectedAccount.label.split("Acct:")[1].replace(")", "").trim() : selectedAccount.label,
          officerId: "OP-7492",
          officerName: "P. Shekhar, Inspector (Cyber Crime)",
          unit: "Cyber Crime & Threat Intelligence Unit, Chandigarh Police",
          details: "Forensic on-chain flow linked to darknet narcotics syndicate cash-out."
        })
      });

      const data = await res.json();
      setLegalNoticeDoc(data);
    } catch (err) {
      console.error("Failed to generate notice:", err);
    } finally {
      setLegalLoading(false);
    }
  };

  const handleCopy = () => {
    if (!legalNoticeDoc) return;
    navigator.clipboard.writeText(legalNoticeDoc.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQueryFIU = () => {
    setQueryingFIU(true);
    toast.info("Connecting to FIU-IND Gateway...", {
      description: "Dispatching STR/CTR batch scan on monitored banking endpoints."
    });
    setTimeout(() => {
      setQueryingFIU(false);
      toast.success("FIU-IND Telemetry Synced", {
        description: "6 nodal accounts verified. 0 flagged transactions found in last 24h."
      });
    }, 1200);
  };

  const filteredAccounts = useMemo(() => {
    if (assetFilter === "BANK") return accounts.filter(a => a.type?.includes("BANK"));
    if (assetFilter === "WALLET") return accounts.filter(a => a.type?.includes("WALLET"));
    return accounts;
  }, [accounts, assetFilter]);

  return (
    <div className="flex h-full flex-col">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6 shrink-0">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-white">Asset Review & Fiat Tracing</h1>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
            NDSS MFScope Bidirectional Backtracking & NDPS Act Sec 68F Freeze Engine
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Reactor Flow vs Ledger */}
          <div className="flex bg-zinc-950 border border-white/10 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => {
                setViewMode("REACTOR");
                toast.info("Switched to Chainalysis Reactor Flow");
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                viewMode === "REACTOR"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <GitCommit size={14} weight="bold" /> Reactor Flow
            </button>
            <button
              onClick={() => {
                setViewMode("LEDGER");
                toast.info("Switched to Asset Ledger View");
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer",
                viewMode === "LEDGER"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Table size={14} weight="bold" /> Ledger
            </button>
          </div>

          {viewMode === "LEDGER" && (
            <div className="flex bg-zinc-950 border border-white/10 rounded-lg p-0.5">
            {(["ALL", "BANK", "WALLET"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAssetFilter(f)}
                className={clsx(
                  "px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer",
                  assetFilter === f ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
            </div>
          )}

          <button 
            onClick={handleQueryFIU}
            disabled={queryingFIU}
            className="btn-gov flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <MagnifyingGlass size={14} /> 
            {queryingFIU ? "Pinging FIU-IND..." : "Query FIU-IND Gateway"}
          </button>
        </div>
      </header>

      {viewMode === "REACTOR" ? (
        <div className="flex-1 overflow-y-auto">
          <ChainalysisReactorFlow
            onSelectHopAction={(noticeType, hop) => {
              setSelectedAccount({
                label: `${hop.entityName} (${hop.amount})`,
                id: hop.id
              });
              handleGenerateNotice(noticeType);
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-auto">
          <div className="w-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
            <div className="p-4 bg-black/60 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Bank size={16} /> Tracked Financial Assets (Indian & Offshore Banks)
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {filteredAccounts.length} Assets Monitored
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-black/90 border-b border-white/10 sticky top-0 z-10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-400">
                    <th className="px-4 py-3 font-semibold">Asset ID / Label</th>
                    <th className="px-4 py-3 font-semibold">Asset Type</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Known Controllers</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredAccounts.map((acc: any) => {
                    const controllers = acc.targetRelations?.filter((r:any) => r.type === "CONTROLS").map((r:any) => r.source) || [];
                    const isSelected = selectedAccount?.id === acc.id;
                    
                    return (
                      <tr 
                        key={acc.id} 
                        onClick={() => setSelectedAccount(acc)}
                        className={clsx(
                          "transition-all cursor-pointer group",
                          isSelected 
                            ? "bg-white/10 border-l-2 border-l-white text-white font-medium" 
                            : "hover:bg-white/5 border-l-2 border-l-transparent text-zinc-300"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Bank className={clsx("transition-colors", isSelected ? "text-white" : "text-zinc-400 group-hover:text-white")} size={16} />
                          <span className={clsx("font-mono text-xs", isSelected ? "text-white font-semibold" : "text-zinc-200")}>
                            {acc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{acc.type.replace('_', ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block",
                            acc.priorityScore >= 80 ? "bg-red-950/60 text-red-400 border-red-500/30" : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                          )}>
                            {acc.priorityScore}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {controllers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Users className="text-zinc-400" size={14} />
                              <span className="text-xs text-zinc-200 font-medium">{controllers[0].label}</span>
                              {controllers.length > 1 && <span className="text-[10px] text-zinc-400 font-mono">+{controllers.length-1} more</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs font-mono text-zinc-400 group-hover:text-white hover:underline">
                            Inspect Asset →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        {selectedAccount && (
          <>
            <div 
              onClick={() => setSelectedAccount(null)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />
            <div className="fixed top-14 right-0 bottom-0 w-full sm:w-[450px] bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col z-50">
            <div className="p-6 border-b border-white/10 bg-zinc-800/30 relative">
              <button onClick={() => setSelectedAccount(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={16}/></button>
              <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mb-1 font-semibold">FINANCIAL ASSET PROFILE</div>
              <h2 className="text-xl font-display font-bold text-white mb-3 break-all">{selectedAccount.label}</h2>
              <div className="flex gap-2">
                <span className="badge-neutral">{selectedAccount.type.replace('_', ' ')}</span>
                <span className={selectedAccount.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                  PRIORITY: {selectedAccount.priorityScore}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {selectedAccount.riskFactors && (
                <section>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Risk Indicators</h3>
                  <div className="space-y-2">
                    {JSON.parse(selectedAccount.riskFactors).map((risk: string, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-red-400 font-medium">
                        <span>{risk}</span>
                        <TrendUp size={14} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                  <LinkIcon size={14} /> Known Associations
                </h3>
                <div className="bg-zinc-800/30 border border-white/5 p-3 space-y-3">
                  {selectedAccount.targetRelations?.filter((r:any) => r.type === "CONTROLS").map((r:any) => (
                    <div key={r.id} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Controlled By</div>
                        <div className="text-sm font-semibold text-white">{r.source.label}</div>
                      </div>
                      <Link href={`/entities/${r.source.id}`} className="text-xs text-gov-blue hover:underline font-mono">View Actor</Link>
                    </div>
                  ))}
                  {selectedAccount.sourceRelations?.filter((r:any) => r.type === "TRANSACTS_WITH").map((r:any) => (
                    <div key={r.id} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Transacts With</div>
                        <div className="text-sm font-semibold text-white">{r.target.label}</div>
                      </div>
                      <Link href={`/entities/${r.target.id}`} className="text-xs text-gov-blue hover:underline font-mono">View Asset</Link>
                    </div>
                  ))}
                  {(!selectedAccount.targetRelations?.length && !selectedAccount.sourceRelations?.length) && (
                    <div className="text-sm text-zinc-400 italic">No direct associations mapped.</div>
                  )}
                </div>
              </section>

              {/* ACTION PANEL (WITH 1-CLICK LEGAL GENERATION) */}
              <section>
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-semibold">
                  Law Enforcement Action Suite
                </h3>
                <div className="space-y-2.5">
                  <button 
                    onClick={() => setDispatchModalOpen(true)}
                    className="w-full bg-white text-black hover:bg-zinc-200 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <PaperPlaneTilt size={14} weight="bold" />
                    <span>Dispatch to Bank LEA Nodal Desk</span>
                  </button>
                  <button 
                    onClick={() => handleGenerateNotice("SECTION_91_CRPC")}
                    className="w-full btn-gov py-2 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Generate Section 91 Cr.P.C. Bank Notice</span>
                  </button>
                  <button 
                    onClick={() => handleGenerateNotice("SECTION_68F_NDPS")}
                    className="w-full btn-secondary py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Prepare Section 68F NDPS Act Asset Freeze Order</span>
                  </button>
                  <Link 
                    href={`/entities/${selectedAccount.id}`} 
                    className="w-full btn-secondary py-2 text-xs flex items-center justify-center"
                  >
                    View Full Entity Profile & Forensics
                  </Link>
                </div>
              </section>
            </div>
          </div>
          </>
        )}
        </div>
      )}

      {/* STATUTORY INSTITUTIONAL DISPATCH MODAL */}
      <StatutoryDispatchModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        defaultEntityLabel={selectedAccount?.label || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}
        defaultAccountNumber={selectedAccount?.label?.includes("Acct:") ? selectedAccount.label.split("Acct:")[1].replace(")", "").trim() : "99481204812"}
        defaultCaseId="FIR-NDPS-2026-088"
      />

      {/* LEGAL NOTICE GENERATION MODAL */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="glass border border-zinc-400 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-zinc-950 text-white px-6 py-4 flex justify-between items-center shrink-0 border-b border-zinc-400">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-white" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">Statutory Evidentiary Document</div>
                  <h3 className="text-base font-bold">
                    {legalNoticeDoc ? legalNoticeDoc.statutoryAuthority : "Generating Document..."}
                  </h3>
                </div>
              </div>
              <button onClick={() => setLegalModalOpen(false)} className="text-zinc-300 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {legalLoading ? (
                <div className="py-12 text-center font-mono text-xs text-zinc-400 animate-pulse">
                  CALCULATING SECTION 65B CRYPTOGRAPHIC HASH & GENERATING NOTICE...
                </div>
              ) : legalNoticeDoc ? (
                <>
                  <div className="p-3 bg-zinc-800/30 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase block">Digital Evidence Hash (Section 65B)</span>
                      <span className="font-mono text-white font-bold text-[11px] select-all break-all">
                        SHA-256: {legalNoticeDoc.sha256EvidenceHash}
                      </span>
                    </div>
                    <span className="badge-neutral text-[10px] font-mono uppercase shrink-0 ml-3">TAMPER-EVIDENT</span>
                  </div>

                  <div className="bg-zinc-900 border border-white/10 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-300 overflow-x-auto select-all">
                    {legalNoticeDoc.formattedText}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-800/30 flex justify-between items-center">
              <div className="text-[10px] font-mono text-zinc-400">
                Chandigarh Police Cyber Crime Division · Court Admissible
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    setLegalModalOpen(false);
                    setDispatchModalOpen(true);
                  }}
                  className="bg-white text-black hover:bg-zinc-200 text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PaperPlaneTilt size={14} weight="bold" />
                  <span>Transmit to Bank LEA Desk →</span>
                </button>
                <button 
                  onClick={handleCopy}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Text"}
                </button>
                <button 
                  onClick={() => window.print()}
                  className="btn-gov text-xs px-4 py-1.5 flex items-center gap-1"
                >
                  <Printer size={14} /> Print Legal Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
