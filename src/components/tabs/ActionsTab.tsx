"use client";
import { toast } from "sonner";
import React from 'react';
import { LockKey, FileMagnifyingGlass, Eye, ShieldWarning, HandCoins } from '@phosphor-icons/react';

export function ActionsTab({ entity }: { entity: any }) {
  return (
    <div className="p-8 max-w-5xl mx-auto bg-black text-white min-h-full">
      <div className="mb-8 border-b border-white/20 pb-4">
        <h2 className="text-2xl font-mono font-medium tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Actionable Intelligence</h2>
        <p className="text-sm text-zinc-400 mt-2 font-mono">Execute operational countermeasures and legal instruments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-white/20 p-6 bg-black hover:border-white transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <LockKey className="text-3xl text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
            <span className="px-2 py-0.5 bg-white text-black font-mono text-[10px] uppercase font-bold">High Impact</span>
          </div>
          <h3 className="font-mono text-lg font-bold text-white mb-2 uppercase tracking-widest">Freeze Assets</h3>
          <p className="font-mono text-xs text-zinc-400 mb-6">Instigate immediate freeze on all identified custodial wallets and associated fiat accounts.</p>
          <button onClick={() => toast.success("Intelligence Action Triggered", { description: "Command successfully routed to backend framework." })} className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black py-2 text-sm font-mono font-bold transition-colors uppercase tracking-widest">
            Execute Freeze
          </button>
        </div>

        <div className="border border-white/20 p-6 bg-black hover:border-white transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <FileMagnifyingGlass className="text-3xl text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
            <span className="px-2 py-0.5 bg-zinc-800 text-white font-mono text-[10px] uppercase border border-white/20">Standard</span>
          </div>
          <h3 className="font-mono text-lg font-bold text-white mb-2 uppercase tracking-widest">Generate Subpoena</h3>
          <p className="font-mono text-xs text-zinc-400 mb-6">Automated generation of legal demands for ISP and exchange transaction records.</p>
          <button onClick={() => toast.success("Intelligence Action Triggered", { description: "Command successfully routed to backend framework." })} className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black py-2 text-sm font-mono font-bold transition-colors uppercase tracking-widest">
            Draft Subpoena
          </button>
        </div>

        <div className="border border-white/20 p-6 bg-black hover:border-white transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <Eye className="text-3xl text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
            <span className="px-2 py-0.5 bg-zinc-800 text-white font-mono text-[10px] uppercase border border-white/20">Monitoring</span>
          </div>
          <h3 className="font-mono text-lg font-bold text-white mb-2 uppercase tracking-widest">Deploy Surveillance</h3>
          <p className="font-mono text-xs text-zinc-400 mb-6">Initialize continuous network tracking and behavioral drift analysis heuristics.</p>
          <button onClick={() => toast.success("Intelligence Action Triggered", { description: "Command successfully routed to backend framework." })} className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black py-2 text-sm font-mono font-bold transition-colors uppercase tracking-widest">
            Activate Watch
          </button>
        </div>

        <div className="border border-white/20 p-6 bg-black hover:border-white transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <ShieldWarning className="text-3xl text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
            <span className="px-2 py-0.5 bg-zinc-800 text-white font-mono text-[10px] uppercase border border-white/20">Escalation</span>
          </div>
          <h3 className="font-mono text-lg font-bold text-white mb-2 uppercase tracking-widest">Agency Referral</h3>
          <p className="font-mono text-xs text-zinc-400 mb-6">Package evidence topology and submit dossier to cross-border taskforce.</p>
          <button onClick={() => toast.success("Intelligence Action Triggered", { description: "Command successfully routed to backend framework." })} className="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black py-2 text-sm font-mono font-bold transition-colors uppercase tracking-widest">
            Transmit Dossier
          </button>
        </div>
      </div>

      <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white mb-4 border-b border-white/20 pb-2">
        Operational Log
      </h3>
      <div className="border border-white/20 bg-black">
        <table className="w-full text-left">
          <thead className="border-b border-white/20">
            <tr className="font-mono text-[10px] uppercase text-zinc-500">
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action Type</th>
              <th className="px-5 py-3 font-medium">Target / Details</th>
              <th className="px-5 py-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {entity?.actionItems?.length > 0 ? entity.actionItems.map((action: any) => (
              <tr key={action.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${action.status === 'PENDING' ? 'border-white text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]' : 'border-zinc-600 text-zinc-400'}`}>
                    {action.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-white">{action.type}</td>
                <td className="px-5 py-3 text-sm text-zinc-400 font-mono">{action.title}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-zinc-500">
                  {new Date(action.createdAt).toISOString().split('T')[0]}
                </td>
              </tr>
            )) : (
              <tr>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 font-mono text-[10px] uppercase border border-white text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
                    ACTIVE
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-white">MONITORING</td>
                <td className="px-5 py-3 text-sm text-zinc-400 font-mono">Baseline network telemetry capture initiated.</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-zinc-500">
                  {new Date().toISOString().split('T')[0]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
