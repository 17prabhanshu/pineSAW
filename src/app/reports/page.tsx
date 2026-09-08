"use client";

import { useState } from "react";
import { FileText, DownloadSimple, Printer, MagnifyingGlass, ShieldWarning, CheckCircle } from "@phosphor-icons/react";
import { ReportTemplateCarousel, ReportTemplate } from "@/components/ReportTemplateCarousel";
import { toast } from "sonner";
import clsx from "clsx";

const ALL_SECTIONS = [
  "Executive Summary", 
  "Investigative Scope", 
  "Key Entities", 
  "Relationship Findings", 
  "Activity Timeline", 
  "Risk Indicators", 
  "Financial Analysis", 
  "Legal/Procedural Relevance", 
  "Evidence Appendix"
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [selectedCase, setSelectedCase] = useState("INV-2026-0042");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "Executive Summary",
    "Investigative Scope",
    "Key Entities",
    "Financial Analysis",
    "Evidence Appendix"
  ]);
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplate | null>(null);

  const toggleSection = (sec: string) => {
    setSelectedSections(prev => 
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    setActiveTemplate(template);
    setSelectedSections(template.sections);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setReportReady(false);
    toast.info("Compiling Statutory Report", {
      description: "Aggregating verified case evidence and chain of custody logs..."
    });

    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
      toast.success("Report Compiled Successfully", {
        description: `Generated court export for ${selectedCase}`
      });
    }, 1400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end border-b border-white/10 pb-6 print:hidden">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-white">Statutory Report Generator</h1>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
            Cryptographic Evidence Packages & Court Production Orders
          </p>
        </div>
        {reportReady && (
          <button onClick={handlePrint} className="btn-gov flex items-center gap-2 cursor-pointer">
            <Printer size={16} /> Print to PDF
          </button>
        )}
      </header>

      {/* Pre-Approved Statutory Templates Carousel */}
      <ReportTemplateCarousel onSelectTemplate={handleSelectTemplate} />

      <div className="surface-1 nexus-border rounded-xl p-6 mb-8 print:hidden bg-zinc-950/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-2">Target Investigation</label>
            <select 
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors"
              value={selectedCase}
              onChange={e => setSelectedCase(e.target.value)}
            >
              <option value="INV-2026-0042">INV-2026-0042: Operation Cross-Platform Overlap</option>
              <option value="INV-2026-0058">INV-2026-0058: NeonNinja Distro Network</option>
              <option value="INV-2026-0104">INV-2026-0104: Agora ShadowBroker Hawala Liquidity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-2">Time Range</label>
            <select className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors">
              <option>Last 30 Days (Standard Judicial Scope)</option>
              <option>Last 90 Days</option>
              <option>Year to Date</option>
              <option>Complete Case Lifecyle (All Time)</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-mono text-zinc-300 uppercase mb-3 flex items-center justify-between">
            <span>Sections to Include in Dossier</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {selectedSections.length} of {ALL_SECTIONS.length} selected
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {ALL_SECTIONS.map(sec => {
              const isChecked = selectedSections.includes(sec);
              return (
                <div 
                  key={sec} 
                  onClick={() => toggleSection(sec)}
                  className={clsx(
                    "flex items-center gap-3 text-xs p-3 rounded-xl border cursor-pointer transition-all",
                    isChecked 
                      ? "bg-white/10 border-white/30 text-white font-medium shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
                      : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/15"
                  )}
                >
                  <div className={clsx(
                    "w-4 h-4 rounded-md border flex items-center justify-center text-[10px]",
                    isChecked ? "bg-white text-black border-white" : "border-white/20"
                  )}>
                    {isChecked && <CheckCircle size={12} weight="fill" />}
                  </div>
                  <span>{sec}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto btn-gov px-8 py-3 rounded-2xl font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <FileText size={16} weight="fill" />
          {generating ? "COMPILING JUDICIAL EXPORT..." : "GENERATE STATUTORY DOSSIER"}
        </button>
      </div>

      {reportReady && (
        <div id="print-section" className="printable-dossier surface-1 nexus-border rounded-2xl p-10 flex-1 overflow-auto glass text-zinc-200 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4">
          
          {/* Print specific branding */}
          <div className="hidden print:block absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <ShieldWarning size={600} />
          </div>

          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-800">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center font-serif text-white font-bold italic text-2xl">
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
              <div className="px-2.5 py-1 bg-zinc-900 border border-white/10 text-zinc-300 text-[10px] font-mono rounded-2xl uppercase font-bold mb-2 inline-block">
                STATUTORY EVIDENTIARY SUBMISSION
              </div>
              <p className="font-mono text-xs text-zinc-400 font-semibold uppercase">Classification: LAW ENFORCEMENT SENSITIVE</p>
            </div>
          </div>
          
          <div className="space-y-8 text-zinc-200 text-sm leading-relaxed max-w-4xl relative z-10">
            {selectedSections.includes("Executive Summary") && (
              <section>
                <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">1. Executive Summary</h3>
                <p>Operation Cross-Platform Overlap identified a high-priority actor operating under the alias "ShadowBroker". This entity was discovered sharing unique identifiers across GenesisMarket, Agora Darknet Market, and Telegram, facilitating cross-network correlation. Activity spiked by 3.4× over the previous 14-day baseline, indicating likely operational changes or asset liquidation.</p>
              </section>
            )}
            
            {selectedSections.includes("Investigative Scope") && (
              <section>
                <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">2. Investigative Objective</h3>
                <p>Determine extent of control ShadowBroker exerts over correlated accounts and map associated financial infrastructure for further evidentiary preservation under Section 91 CrPC and Section 69 Information Technology Act.</p>
              </section>
            )}

            {selectedSections.includes("Key Entities") && (
              <section>
                <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">3. Key Entities & Relationship Findings</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>ShadowBroker</strong> (ACTOR) - Priority 88. Central node of the investigation. Controls multiple aliases.</li>
                  <li><strong>shadow_99@genesis</strong> (ACCOUNT) - Observed on GenesisMarket. Connected via shared PGP signature.</li>
                  <li><strong>shadow99@proton.me</strong> (IDENTIFIER) - Primary linkage point identified in evidence package EV-2026-0912.</li>
                  <li><strong>bc1qar0srrr7xfkvy5l643...</strong> (CRYPTO WALLET) - Identified recipient address on Agora Marketplace.</li>
                </ul>
                <div className="mt-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                  <p className="italic text-zinc-300 text-xs">Certified Note: Observed identifier overlap is mathematically corroborated with a cosine similarity score of 0.94 across dense vector embeddings.</p>
                </div>
              </section>
            )}

            {selectedSections.includes("Legal/Procedural Relevance") && (
              <section>
                <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">4. Legal & Procedural Relevance</h3>
                <table className="w-full text-left text-sm border-collapse border border-white/10">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="border border-white/10 p-2.5 font-medium font-mono text-xs">Jurisdiction</th>
                      <th className="border border-white/10 p-2.5 font-medium font-mono text-xs">Provision</th>
                      <th className="border border-white/10 p-2.5 font-medium font-mono text-xs">Relevance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-white/10 p-2.5 font-mono text-xs">Chandigarh / UT</td>
                      <td className="border border-white/10 p-2.5 font-medium">IT Act Sec 66C (Identity Theft)</td>
                      <td className="border border-white/10 p-2.5">Fraudulent use of digital identifiers to facilitate transactions.</td>
                    </tr>
                    <tr>
                      <td className="border border-white/10 p-2.5 font-mono text-xs">National / FIU</td>
                      <td className="border border-white/10 p-2.5 font-medium">PMLA Sec 17 (Asset Freezing)</td>
                      <td className="border border-white/10 p-2.5">Requisition targeting domestic accounts receiving illicit cryptocurrency conversions.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {selectedSections.includes("Evidence Appendix") && (
              <section>
                <h3 className="font-mono uppercase tracking-widest mb-3 text-white font-bold border-b border-white/5 pb-1">5. Evidence Appendix & Integrity Seal</h3>
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SHA-256 HASH:</span>
                    <span className="text-white">a8f5c3b991e042db7417e29b4e548231c6a71e198b1836e4f3a</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CHAIN OF CUSTODY:</span>
                    <span className="text-white">VERIFIED · CONSTABLE FORENSICS #442</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TIME STAMP:</span>
                    <span className="text-white">{new Date().toISOString()}</span>
                  </div>
                </div>
              </section>
            )}
            
            <div className="pt-8 mt-8 border-t border-white/10 flex justify-between text-xs font-mono text-zinc-400">
              <div>Generated: {new Date().toLocaleString()}</div>
              <div>Investigator ID: OP-7492</div>
              <div>Certified Judicial Copy · Page 1 of 1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
