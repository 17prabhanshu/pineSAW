"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  CaretLeft, 
  CaretRight, 
  Check, 
  ShieldCheck, 
  Scales, 
  LockKey,
  FolderOpen
} from "@phosphor-icons/react";
import clsx from "clsx";
import { toast } from "sonner";

export interface ReportTemplate {
  id: string;
  code: string;
  title: string;
  statute: string;
  purpose: string;
  sections: string[];
  classification: "COURT ANNEXURE" | "STATUTORY FILING" | "CONFIDENTIAL" | "EVIDENTIARY EXHIBIT";
}

const TEMPLATES: ReportTemplate[] = [
  {
    id: "TMP-CRPC-91",
    code: "CrPC § 91 / BNSS § 94",
    title: "Summons to Produce Bank & Telemetry Records",
    statute: "Section 91 Code of Criminal Procedure, 1973",
    purpose: "Formal requisition issued to Scheduled Commercial Banks, UPI Gateways, and ISPs requiring production of certified statements and IPDR logs.",
    sections: ["Executive Summary", "Investigative Scope", "Key Entities", "Financial Analysis", "Evidence Appendix"],
    classification: "STATUTORY FILING"
  },
  {
    id: "TMP-PMLA-17",
    code: "PMLA § 17",
    title: "Digital Asset & Crypto Seizure Affidavit",
    statute: "Section 17 Prevention of Money Laundering Act, 2002",
    purpose: "Cryptographic freezing requisition submitted to domestic exchanges and international VASPs for immediate escrow containment.",
    sections: ["Executive Summary", "Key Entities", "Relationship Findings", "Financial Analysis", "Risk Indicators", "Evidence Appendix"],
    classification: "CONFIDENTIAL"
  },
  {
    id: "TMP-IT-69",
    code: "IT ACT § 69",
    title: "Lawful Decryption & Interception Certificate",
    statute: "Section 69 Information Technology Act, 2000",
    purpose: "Evidentiary certificate establishing chain of custody for lawful packet interception and PGP signature attribution under cyber forensics guidelines.",
    sections: ["Executive Summary", "Activity Timeline", "Risk Indicators", "Legal/Procedural Relevance", "Evidence Appendix"],
    classification: "EVIDENTIARY EXHIBIT"
  },
  {
    id: "TMP-DARKNET-DOSSIER",
    code: "DARKINT DOSSIER",
    title: "Comprehensive Multi-Network Threat Assessment",
    statute: "Rule 3(1) Cyber Appellate Tribunal Forensic Procedures",
    purpose: "Complete multi-tier intelligence synthesis mapping Tor relays, Telegram channels, and fiat off-ramps into judicial court-ready format.",
    sections: ["Executive Summary", "Investigative Scope", "Key Entities", "Relationship Findings", "Activity Timeline", "Risk Indicators", "Financial Analysis", "Legal/Procedural Relevance", "Evidence Appendix"],
    classification: "COURT ANNEXURE"
  }
];

export function ReportTemplateCarousel({
  onSelectTemplate
}: {
  onSelectTemplate: (template: ReportTemplate) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("TMP-CRPC-91");

  const total = TEMPLATES.length;

  const next = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % total);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + total) % total);
  };

  const current = TEMPLATES[currentIndex];

  const handleApply = (tpl: ReportTemplate) => {
    setSelectedTemplateId(tpl.id);
    onSelectTemplate(tpl);
    toast.success(`Applied Template: ${tpl.code}`, {
      description: `Configured sections for ${tpl.title}`
    });
  };

  return (
    <div className="surface-1 nexus-border rounded-2xl p-5 mb-8 print:hidden bg-zinc-950/70 relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Scales size={16} className="text-white" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Pre-Approved Statutory Templates ({currentIndex + 1}/{total})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white border border-white/20 uppercase tracking-widest">
                {current.code}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">
                {current.classification}
              </span>
            </div>

            <h3 className="text-base font-display font-semibold text-white mb-1">
              {current.title}
            </h3>

            <p className="text-xs text-zinc-400 mb-2.5 max-w-2xl leading-relaxed">
              {current.purpose}
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 mr-1">SECTIONS:</span>
              {current.sections.map((sec, idx) => (
                <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-300">
                  {sec}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 self-stretch md:self-auto justify-end pt-2 md:pt-0">
            <button
              onClick={() => handleApply(current)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                selectedTemplateId === current.id
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
              )}
            >
              {selectedTemplateId === current.id ? (
                <>
                  <Check size={14} weight="bold" /> Applied
                </>
              ) : (
                <>
                  <FolderOpen size={14} /> Apply Template
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={clsx(
              "h-1 rounded-full transition-all cursor-pointer",
              i === currentIndex ? "w-6 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
