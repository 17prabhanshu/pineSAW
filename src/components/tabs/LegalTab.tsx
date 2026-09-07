import React from 'react';
import { Gavel, FileText, CheckCircle, WarningCircle, ShieldCheck } from '@phosphor-icons/react';

export function LegalTab({ entity }: { entity: any }) {
  return (
    <div className="p-8 max-w-5xl mx-auto bg-black text-white min-h-full">
      <div className="mb-8 flex justify-between items-end border-b border-white/20 pb-4">
        <div>
          <h2 className="text-2xl font-mono font-medium tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Statutory Reporting</h2>
          <p className="text-sm text-zinc-400 mt-2 font-mono">NDPS / MFScope Compliance Matrix</p>
        </div>
        <button onClick={() => alert("Action Simulated.")} className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-none text-sm font-mono font-bold transition-colors uppercase tracking-widest">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-white/20 p-6 bg-black relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white transition-colors duration-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-lg font-bold uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">NDPS Framework</h3>
            <ShieldCheck className="text-2xl text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Section 27A</span>
              <span className="font-mono text-xs text-white border border-white/30 px-2 py-0.5">Applicable</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Financial Trace</span>
              <span className="font-mono text-xs text-white border border-white/30 px-2 py-0.5">Verified</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Predicate Offense</span>
              <span className="font-mono text-xs text-zinc-500 border border-zinc-700 px-2 py-0.5">Pending Review</span>
            </div>
          </div>
          
          <p className="font-mono text-xs text-zinc-500 mt-6 leading-relaxed">
            Entity {entity?.label || 'UNKNOWN'} triggers NDPS threshold alerts based on aggregated fiat/crypto transfer volume overlapping with known watchlists.
          </p>
        </div>

        <div className="border border-white/20 p-6 bg-black relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white transition-colors duration-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-lg font-bold uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">MFScope Analysis</h3>
            <FileText className="text-2xl text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Jurisdiction</span>
              <span className="font-mono text-xs text-white border border-white/30 px-2 py-0.5">Global / FATF</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Risk Level</span>
              <span className="font-mono text-xs text-white border border-white px-2 py-0.5 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">CRITICAL</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-mono text-xs text-zinc-400 uppercase">Sanctions Match</span>
              <span className="font-mono text-xs text-white border border-white/30 px-2 py-0.5">Positive</span>
            </div>
          </div>

          <p className="font-mono text-xs text-zinc-500 mt-6 leading-relaxed">
            Multi-factor scope indicates severe non-compliance with international AML guidelines. Statutory filing recommended.
          </p>
        </div>
      </div>

      <div className="mt-8 border border-white/20 p-6 bg-black">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
          <WarningCircle /> Evidentiary Log
        </h3>
        <div className="space-y-2">
          {entity?.legalReferences?.length > 0 ? entity.legalReferences.map((ref: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border border-white/10 hover:border-white/40 transition-colors">
              <div>
                <div className="font-mono text-xs text-zinc-400 uppercase">{ref.jurisdiction}</div>
                <div className="font-mono text-sm text-white">{ref.provision}</div>
              </div>
              <div className="font-mono text-xs text-zinc-500 mt-2 md:mt-0 max-w-md text-right">
                {ref.reason}
              </div>
            </div>
          )) : (
            <div className="flex justify-between items-center p-3 border border-white/10">
              <div>
                <div className="font-mono text-xs text-zinc-400 uppercase">SYSTEM AUTO-LOG</div>
                <div className="font-mono text-sm text-white">Section 3 PMLA - Money Laundering</div>
              </div>
              <div className="font-mono text-xs text-zinc-500 max-w-md text-right">
                Automated inference based on transaction topology.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
