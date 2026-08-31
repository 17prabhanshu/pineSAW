"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bank, Users, MagnifyingGlass, Funnel, CaretRight, X, TrendUp, Link as LinkIcon, Printer, Copy, ShieldCheck, Check } from "@phosphor-icons/react";
import clsx from "clsx";

export default function FinancialPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

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

  return (
    <div className="flex h-full overflow-hidden flex-col">
      <header className="px-8 py-6 bg-white border-b border-zinc-300 shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1 text-zinc-900">Asset Review & Fiat Tracing</h1>
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              NDSS MFScope Bidirectional Backtracking & NDPS Act Sec 68F Freeze Engine
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2 text-xs"><Funnel size={14} /> Filter Assets</button>
            <button className="btn-gov flex items-center gap-2 text-xs"><MagnifyingGlass size={14} /> Query FIU-IND Gateway</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={clsx("flex-1 overflow-auto p-8 transition-all duration-150", selectedAccount ? "mr-[450px]" : "")}>
          <div className="bg-white nexus-border rounded-none shadow-sm flex flex-col min-h-0">
            <div className="p-4 bg-zinc-50 border-b border-zinc-300 flex justify-between items-center">
              <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Bank size={16} /> Tracked Financial Assets (Indian & Offshore Banks)
              </h2>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {accounts.length} Assets Monitored
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-100 border-b border-zinc-300 sticky top-0 z-10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-600">
                    <th className="px-4 py-3 font-semibold">Asset ID / Label</th>
                    <th className="px-4 py-3 font-semibold">Asset Type</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Known Controllers</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {accounts.map((acc: any) => {
                    const controllers = acc.targetRelations?.filter((r:any) => r.type === "CONTROLS").map((r:any) => r.source) || [];
                    
                    return (
                      <tr 
                        key={acc.id} 
                        onClick={() => setSelectedAccount(acc)}
                        className={clsx(
                          "transition-colors cursor-pointer group",
                          selectedAccount?.id === acc.id ? "bg-blue-50 border-l-2 border-l-gov-blue" : "hover:bg-zinc-50 border-l-2 border-l-transparent"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-zinc-900 flex items-center gap-2">
                          <Bank className="text-zinc-400 group-hover:text-gov-blue" size={16} />
                          {acc.label}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-600">{acc.type.replace('_', ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={acc.priorityScore >= 80 ? "badge-critical" : "badge-warning"}>
                            {acc.priorityScore}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {controllers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Users className="text-zinc-400" size={14} />
                              <span className="text-xs text-zinc-800 font-medium">{controllers[0].label}</span>
                              {controllers.length > 1 && <span className="text-[10px] text-zinc-500 font-mono">+{controllers.length-1} more</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs font-semibold text-gov-blue hover:underline">
                            Inspect Asset & Legal Action
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
          <div className="absolute top-0 right-0 bottom-0 w-[450px] bg-white border-l border-zinc-300 shadow-xl flex flex-col z-30">
            <div className="p-6 border-b border-zinc-300 bg-zinc-50 relative">
              <button onClick={() => setSelectedAccount(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900"><X size={16}/></button>
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1 font-semibold">FINANCIAL ASSET PROFILE</div>
              <h2 className="text-xl font-display font-bold text-zinc-900 mb-3 break-all">{selectedAccount.label}</h2>
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
                  <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Risk Indicators</h3>
                  <div className="space-y-2">
                    {JSON.parse(selectedAccount.riskFactors).map((risk: string, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-red-50 border border-red-100 p-2 text-red-800 font-medium">
                        <span>{risk}</span>
                        <TrendUp size={14} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                  <LinkIcon size={14} /> Known Associations
                </h3>
                <div className="bg-zinc-50 border border-zinc-200 p-3 space-y-3">
                  {selectedAccount.targetRelations?.filter((r:any) => r.type === "CONTROLS").map((r:any) => (
                    <div key={r.id} className="flex justify-between items-center pb-2 border-b border-zinc-200 last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">Controlled By</div>
                        <div className="text-sm font-semibold text-zinc-900">{r.source.label}</div>
                      </div>
                      <Link href={`/entities/${r.source.id}`} className="text-xs text-gov-blue hover:underline font-mono">View Actor</Link>
                    </div>
                  ))}
                  {selectedAccount.sourceRelations?.filter((r:any) => r.type === "TRANSACTS_WITH").map((r:any) => (
                    <div key={r.id} className="flex justify-between items-center pb-2 border-b border-zinc-200 last:border-0 last:pb-0">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">Transacts With</div>
                        <div className="text-sm font-semibold text-zinc-900">{r.target.label}</div>
                      </div>
                      <Link href={`/entities/${r.target.id}`} className="text-xs text-gov-blue hover:underline font-mono">View Asset</Link>
                    </div>
                  ))}
                  {(!selectedAccount.targetRelations?.length && !selectedAccount.sourceRelations?.length) && (
                    <div className="text-sm text-zinc-500 italic">No direct associations mapped.</div>
                  )}
                </div>
              </section>

              {/* ACTION PANEL (WITH 1-CLICK LEGAL GENERATION) */}
              <section>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">
                  Law Enforcement Action Suite
                </h3>
                <div className="space-y-2.5">
                  <button 
                    onClick={() => handleGenerateNotice("SECTION_91_CRPC")}
                    className="w-full btn-gov py-2 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Generate Section 91 Cr.P.C. Bank Notice</span>
                  </button>
                  <button 
                    onClick={() => handleGenerateNotice("SECTION_68F_NDPS")}
                    className="w-full btn-secondary py-2 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 border-red-300 hover:border-red-400 flex items-center justify-center gap-2"
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
        )}
      </div>

      {/* LEGAL NOTICE GENERATION MODAL */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-white border border-zinc-400 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#002244] text-white px-6 py-4 flex justify-between items-center shrink-0 border-b border-zinc-400">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-amber-400" />
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
                <div className="py-12 text-center font-mono text-xs text-zinc-500 animate-pulse">
                  CALCULATING SECTION 65B CRYPTOGRAPHIC HASH & GENERATING NOTICE...
                </div>
              ) : legalNoticeDoc ? (
                <>
                  <div className="p-3 bg-zinc-50 border border-zinc-300 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase block">Digital Evidence Hash (Section 65B)</span>
                      <span className="font-mono text-zinc-900 font-bold text-[11px] select-all break-all">
                        SHA-256: {legalNoticeDoc.sha256EvidenceHash}
                      </span>
                    </div>
                    <span className="badge-neutral text-[10px] font-mono uppercase shrink-0 ml-3">TAMPER-EVIDENT</span>
                  </div>

                  <div className="bg-[#FAFAFA] border border-zinc-300 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-900 overflow-x-auto select-all">
                    {legalNoticeDoc.formattedText}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-zinc-300 bg-zinc-50 flex justify-between items-center">
              <div className="text-[10px] font-mono text-zinc-500">
                Chandigarh Police Cyber Crime Division · Court Admissible
              </div>
              <div className="flex gap-2">
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
