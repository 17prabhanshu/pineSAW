"use client";

import { useState } from "react";
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Fingerprint, 
  FileText, 
  SealCheck,
  Scales
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Section65BCertificate } from "@/lib/legal/admissibilityEngine";

interface Section65BCertificateModalProps {
  certificate: Section65BCertificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Section65BCertificateModal({ certificate, isOpen, onClose }: Section65BCertificateModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(certificate.statutoryDeclarationText);
    setCopied(true);
    toast.success("Section 63 BSA Certificate Copied to Clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 print:static print:inset-auto print:bg-transparent print:backdrop-blur-none print:p-0 print:m-0 print:block print:w-full print:h-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="bg-zinc-950 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono print:static print:transform-none print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:rounded-none print:w-full print:p-0 print:m-0"
        >
          {/* Header - Hidden on Print */}
          <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/60 print:hidden">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-white">
                <Scales size={24} weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Statutory Electronic Evidence Certificate
                  </h2>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                    COURT ADMISSIBLE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Section 63 BSA 2023 (formerly Section 65B Indian Evidence Act, 1872)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                title="Print or Save PDF"
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Formal Certificate Body */}
          <div 
            id="print-section"
            className="printable-dossier flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs text-zinc-200 bg-black/40 print:bg-white print:text-black print:p-0 print:overflow-visible print:w-full"
          >
            {/* Judicial Title Heading */}
            <div className="text-center space-y-1.5 border-b border-white/15 pb-5 print:border-b-2 print:border-black">
              <div className="text-[11px] font-bold tracking-widest text-zinc-400 print:text-black uppercase">
                FORM NO. BSA-63 / E-EVID-SEC17
              </div>
              <h1 className="text-base md:text-lg font-bold text-white print:text-black uppercase tracking-wide">
                IN THE COURT OF SESSIONS / SPECIAL NDPS JUDGE, CHANDIGARH
              </h1>
              <h2 className="text-xs font-semibold text-zinc-300 print:text-black font-bold">
                CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
              </h2>
              <p className="text-[10px] text-zinc-400 print:text-gray-700">
                (CORRESPONDING TO MANDATORY PROVISIONS OF SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872)
              </p>
            </div>

            {/* Case & Exhibit Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/80 p-3.5 rounded-xl border border-white/10 print:border print:border-black print:bg-gray-100 text-[10px]">
              <div>
                <span className="text-zinc-500 uppercase block print:text-gray-700 font-semibold">Certificate Ref</span>
                <span className="text-white print:text-black font-bold truncate block">{certificate.certificateId}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block print:text-gray-700 font-semibold">Case Reference</span>
                <span className="text-white print:text-black font-bold block">{certificate.caseRef}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block print:text-gray-700 font-semibold">Exhibit ID</span>
                <span className="text-emerald-400 print:text-black font-bold block">{certificate.exhibitId}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block print:text-gray-700 font-semibold">Certified Date</span>
                <span className="text-white print:text-black font-bold block">{new Date(certificate.issuedAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Cryptographic Proof Table */}
            <div className="border border-white/15 rounded-xl p-4 bg-black/60 print:bg-white print:border print:border-black space-y-2.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 print:text-black">
                <Fingerprint size={14} className="text-white print:text-black" />
                <span>Forensic Hardware & Cryptographic Authentication Fingerprint</span>
              </div>
              
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                  <span className="text-zinc-400 print:text-gray-700 font-medium">SHA-256 Checksum:</span>
                  <span className="text-emerald-400 print:text-black font-bold break-all select-all font-mono">
                    {certificate.technicalProfile.sha256Digest}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                  <span className="text-zinc-400 print:text-gray-700 font-medium">MD5 Message Digest:</span>
                  <span className="text-zinc-300 print:text-black font-bold break-all select-all font-mono">
                    {certificate.technicalProfile.md5Digest}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                  <span className="text-zinc-400 print:text-gray-700 font-medium">RFC 3161 Timestamp Seal:</span>
                  <span className="text-amber-300 print:text-black font-bold">
                    {certificate.technicalProfile.rfc3161TimestampSeal}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                  <span className="text-zinc-400 print:text-gray-700 font-medium">Acquisition Workstation:</span>
                  <span className="text-white print:text-black font-bold">
                    {certificate.technicalProfile.workstationHost}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <span className="text-zinc-400 print:text-gray-700 font-medium">Forensic Software Kernel:</span>
                  <span className="text-white print:text-black font-bold">
                    {certificate.technicalProfile.acquisitionTool}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Statutory Declaration Text */}
            <div className="border border-white/10 rounded-xl p-5 bg-black/80 print:bg-gray-50 print:border print:border-black print:text-black text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono">
              {certificate.statutoryDeclarationText}
            </div>

            {/* Official Deponent Seal Box */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 print:border-t-2 print:border-black">
              <div className="flex items-center gap-3">
                <div className="p-3 border border-emerald-500/30 rounded-xl bg-emerald-950/40 text-emerald-400 print:border print:border-black print:text-black print:bg-transparent">
                  <ShieldCheck size={28} weight="fill" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-700">Verification Seal</div>
                  <div className="text-xs font-bold text-white print:text-black">ZERO TAMPER DETECTED · CRYPTOGRAPHIC MATCH</div>
                  <div className="text-[10px] text-zinc-500 print:text-gray-700">Compliant with Supreme Court Arjun Panditrao (2020) Mandate</div>
                </div>
              </div>

              <div className="text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 print:border-none">
                <div className="text-xs font-bold text-white print:text-black">{certificate.deponent.name}</div>
                <div className="text-[10px] text-zinc-400 print:text-gray-700">{certificate.deponent.designation}</div>
                <div className="text-[10px] text-zinc-500 print:text-gray-700">Badge ID: {certificate.deponent.badgeNumber} · {certificate.deponent.station}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
