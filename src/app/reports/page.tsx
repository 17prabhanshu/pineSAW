"use client";

import { useState } from "react";
import { FileText, DownloadSimple, Printer, MagnifyingGlass, ShieldWarning } from "@phosphor-icons/react";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [selectedCase, setSelectedCase] = useState("INV-2026-0042");

  const handleGenerate = () => {
    setGenerating(true);
    setReportReady(false);
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end print:hidden">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2 text-white">Report Generator</h1>
          <p className="text-zinc-300 font-mono text-sm uppercase tracking-widest">Generate Structured Investigation Exports</p>
        </div>
        {reportReady && (
          <button onClick={handlePrint} className="btn-gov flex items-center gap-2">
            <Printer size={16} /> Print to PDF
          </button>
        )}
      </header>

      <div className="surface-1 nexus-border rounded-2xl p-6 mb-8 print:hidden">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-2">Target Investigation</label>
            <select 
              className="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-nexus-cyan"
              value={selectedCase}
              onChange={e => setSelectedCase(e.target.value)}
            >
              <option value="INV-2026-0042">INV-2026-0042: Operation Cross-Platform Overlap</option>
              <option value="INV-2026-0058">INV-2026-0058: NeonNinja Distro Network</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-2">Time Range</label>
            <select className="w-full bg-zinc-800/30 border border-white/10 rounded-2xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-nexus-cyan">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Year to Date</option>
              <option>All Time</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-mono text-zinc-300 uppercase mb-3">Sections to Include</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Executive Summary", "Investigative Scope", "Key Entities", "Relationship Findings", "Activity Timeline", "Risk Indicators", "Financial Analysis", "Legal/Procedural Relevance", "Evidence Appendix"].map(sec => (
              <label key={sec} className="flex items-center gap-3 text-sm text-zinc-300 p-2 bg-zinc-800/30 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="accent-nexus-cyan w-4 h-4" />
                {sec}
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="btn-gov px-6 py-2.5 rounded-2xl font-medium flex items-center gap-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          <FileText weight="fill" />
          {generating ? "GENERATING REPORT..." : "GENERATE REPORT"}
        </button>
      </div>

      {reportReady && (
        <div className="surface-1 nexus-border rounded-2xl p-10 flex-1 overflow-auto glass text-zinc-200 animate-in fade-in slide-in-from-bottom-4 shadow-md relative">
          
          {/* Print specific branding */}
          <div className="hidden print:block absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <ShieldWarning size={600} />
          </div>

          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-800">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center font-serif text-white font-bold italic text-2xl">
                CP
              </div>
              <div>
                <div className="text-xs text-zinc-300 font-mono uppercase tracking-widest font-semibold">Chandigarh Police</div>
                <div className="text-lg font-bold text-white tracking-wide mb-1">CYBER CRIME & INTELLIGENCE UNIT</div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-lg tracking-widest text-white">DARKINT</span>
                  <span className="text-xs font-mono text-zinc-400 uppercase">Intelligence Report: {selectedCase}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="px-2 py-1 bg-zinc-900/50 border border-white/10 text-zinc-300 text-[10px] font-mono rounded-2xl uppercase font-bold mb-2 inline-block">
                DEMONSTRATION ENVIRONMENT
              </div>
              <p className="font-mono text-xs text-zinc-400 font-semibold uppercase">Classification: UNCLASSIFIED</p>
            </div>
          </div>
          
          <div className="space-y-8 text-zinc-200 text-sm leading-relaxed max-w-4xl relative z-10">
            <section>
              <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">1. Executive Summary</h3>
              <p>Operation Cross-Platform Overlap identified a high-priority actor operating under the alias "ShadowBroker". This entity was discovered sharing unique identifiers across GenesisMarket and Telegram, facilitating cross-network correlation. Activity spiked by 3.4x over the previous 14-day baseline, indicating likely operational changes or asset liquidation.</p>
            </section>
            
            <section>
              <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">2. Investigative Objective</h3>
              <p>Determine extent of control ShadowBroker exerts over correlated accounts and map associated financial infrastructure for further evidentiary preservation.</p>
            </section>

            <section>
              <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">3. Key Entities & Relationship Findings</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>ShadowBroker</strong> (ACTOR) - Priority 88. Central node of the investigation. Controls multiple aliases.</li>
                <li><strong>shadow_99@genesis</strong> (ACCOUNT) - Observed on GenesisMarket. Connected via shared PGP signature.</li>
                <li><strong>shadow99@proton.me</strong> (IDENTIFIER) - Primary linkage point identified in evidence package EV-2026-0912.</li>
              </ul>
              <div className="mt-4 p-4 bg-zinc-800/30 border border-white/5 rounded-2xl">
                <p className="italic text-zinc-300 text-xs">Note: The observed identifier overlap is suggestive but does not independently establish that both accounts are controlled by the same physical person without further verification.</p>
              </div>
            </section>

            <section>
              <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">4. Legal & Procedural Relevance</h3>
              <table className="w-full text-left text-sm border-collapse border border-white/5">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="border border-white/5 p-2 font-medium">Jurisdiction</th>
                    <th className="border border-white/5 p-2 font-medium">Provision</th>
                    <th className="border border-white/5 p-2 font-medium">Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/5 p-2 font-mono text-xs">Chandigarh/India</td>
                    <td className="border border-white/5 p-2 font-medium">IT Act Sec 66C (Identity Theft)</td>
                    <td className="border border-white/5 p-2">Fraudulent use of digital identifiers to facilitate transactions.</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">5. Recommended Actions</h3>
              <ul className="list-decimal pl-5 space-y-2">
                <li>Execute simulated preservation request for associated GenesisMarket data.</li>
                <li>Generate simulated Bank Information Request for linked financial identifiers.</li>
                <li>Prepare Escalation Package for inter-agency referral.</li>
              </ul>
            </section>
            
            <div className="pt-12 mt-12 border-t border-white/10 flex justify-between text-xs font-mono text-zinc-400">
              <div>Generated: {new Date().toLocaleString()}</div>
              <div>Investigator ID: OP-7492</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
