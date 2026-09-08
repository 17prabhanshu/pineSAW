"use client";

import { useState } from "react";
import { toast } from "sonner";
import React from "react";
import { Gavel, FileText, CheckCircle, WarningCircle, ShieldCheck, PaperPlaneTilt, Scales } from "@phosphor-icons/react";
import { StatutoryDispatchModal } from "@/components/StatutoryDispatchModal";

export function LegalTab({ entity }: { entity: any }) {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto bg-black text-white min-h-full space-y-8 font-mono">
      <StatutoryDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        defaultEntityLabel={entity?.label || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}
        defaultCaseId="FIR-NDPS-2026-088"
      />

      <div className="border-b border-white/20 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
            <span>STATUTORY ENFORCEMENT</span> · <span className="text-white">NDPS & CrPC PROTOCOL</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Statutory Reporting & Nodal Dispatch
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            NDPS Act Sec 68F, CrPC Sec 91 Requisitions & Verified Banking LEA Gateway Routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PaperPlaneTilt size={14} weight="bold" />
            <span>Dispatch to Bank LEA Desk</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-white/20 p-6 bg-zinc-950 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white transition-colors duration-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              NDPS Framework (Sec 68F)
            </h3>
            <ShieldCheck className="text-xl text-emerald-400" weight="fill" />
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">Section 27A (Financing Illicit Traffic)</span>
              <span className="text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 rounded text-[10px] font-bold">APPLICABLE</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">Section 68F Asset Freeze Order</span>
              <button 
                onClick={() => setIsDispatchModalOpen(true)} 
                className="text-white underline hover:text-emerald-300 text-[10px] cursor-pointer"
              >
                Ready for Dispatch →
              </button>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">Recipient Nodal Verification</span>
              <span className="text-white border border-white/30 px-2 py-0.5 rounded text-[10px]">Whitelisted (SBI / HDFC)</span>
            </div>
          </div>
          
          <p className="text-xs text-zinc-400 mt-6 leading-relaxed">
            Target {entity?.label || "UNKNOWN"} triggers NDPS threshold alerts based on aggregated fiat/crypto transfer volume overlapping with known watchlists.
          </p>
        </div>

        <div className="border border-white/20 p-6 bg-zinc-950 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white transition-colors duration-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              MFScope Analysis & CrPC § 91
            </h3>
            <FileText className="text-xl text-white" />
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">Jurisdiction</span>
              <span className="text-white border border-white/30 px-2 py-0.5 rounded text-[10px]">Pan-India Scheduled Banks</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">Statutory Deadline</span>
              <span className="text-amber-400 border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 rounded text-[10px] font-bold">48 HOURS MANDATORY</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-zinc-400 uppercase text-[10px]">KYC & IP Log Requisition</span>
              <button 
                onClick={() => setIsDispatchModalOpen(true)} 
                className="text-white underline hover:text-amber-300 text-[10px] cursor-pointer"
              >
                Issue CrPC § 91 →
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mt-6 leading-relaxed">
            Multi-factor scope indicates non-compliance with international AML guidelines. Statutory requisition via verified nodal desk recommended.
          </p>
        </div>
      </div>

      <div className="border border-white/20 p-6 bg-zinc-950 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <WarningCircle size={16} />
          <span>Statutory Evidentiary Log</span>
        </h3>
        <div className="space-y-2">
          {entity?.legalReferences?.length > 0 ? entity.legalReferences.map((ref: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border border-white/10 rounded-lg bg-black hover:border-white/40 transition-colors">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">{ref.jurisdiction}</div>
                <div className="text-xs font-bold text-white">{ref.provision}</div>
              </div>
              <div className="text-xs text-zinc-400 mt-2 md:mt-0 max-w-md text-right">
                {ref.reason}
              </div>
            </div>
          )) : (
            <div className="flex justify-between items-center p-3 border border-white/10 rounded-lg bg-black">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">SYSTEM AUDIT LEDGER</div>
                <div className="text-xs font-bold text-white">Section 68F NDPS Act & Section 91 Cr.P.C. Ready</div>
              </div>
              <div className="text-xs text-zinc-400 max-w-md text-right">
                Institutional dispatch routing active for SBI, HDFC, ICICI, PNB, and CoinDCX.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
