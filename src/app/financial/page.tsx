"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bank, Users, MagnifyingGlass, Funnel, CaretRight, X, TrendUp, Link as LinkIcon } from "@phosphor-icons/react";
import clsx from "clsx";

export default function FinancialPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  useEffect(() => {
    fetch("/api/financial").then(r => r.json()).then(setAccounts);
  }, []);

  return (
    <div className="flex h-full overflow-hidden flex-col">
      <header className="px-8 py-6 bg-white border-b border-zinc-300 shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1 text-zinc-900">Asset Review</h1>
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Financial Intelligence & Subpoena Preparation</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2"><Funnel /> Filter Assets</button>
            <button className="btn-gov flex items-center gap-2"><MagnifyingGlass /> Query KYC Data</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={clsx("flex-1 overflow-auto p-8 transition-all duration-150", selectedAccount ? "mr-[450px]" : "")}>
          <div className="bg-white nexus-border rounded-none shadow-sm flex flex-col min-h-0">
            <div className="p-4 bg-zinc-50 border-b border-zinc-300">
              <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Bank size={16} /> Tracked Financial Assets
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-100 border-b border-zinc-300 sticky top-0 z-10">
                  <tr className="font-mono text-[10px] uppercase text-zinc-600">
                    <th className="px-4 py-3 font-semibold">Asset ID / Label</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Known Controllers</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {accounts.map((acc: any) => {
                    // Find who controls this
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
                          <Bank className="text-zinc-400 group-hover:text-gov-blue" />
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
                              <Users className="text-zinc-400" />
                              <span className="text-xs text-zinc-800">{controllers[0].label}</span>
                              {controllers.length > 1 && <span className="text-[10px] text-zinc-500 font-mono">+{controllers.length-1} more</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">Unknown</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs font-semibold text-gov-blue hover:text-gov-blue-hover transition-none">
                            Review
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
                      <div key={i} className="flex justify-between items-center text-xs bg-red-50 border border-red-100 p-2 text-red-800 font-medium rounded-none">
                        <span>{risk}</span>
                        <TrendUp />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                  <LinkIcon /> Known Associations
                </h3>
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-none space-y-3">
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

              <section>
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Action Panel</h3>
                <div className="space-y-2">
                  <button className="w-full btn-gov py-2">Generate Information Request</button>
                  <button className="w-full btn-secondary py-2 text-red-700 hover:bg-red-50 hover:text-red-800 border-red-200 hover:border-red-300">Prepare Freeze Order</button>
                  <Link href={`/entities/${selectedAccount.id}`} className="w-full btn-secondary py-2 flex items-center justify-center">View Full Asset Profile</Link>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
