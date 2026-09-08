"use client";

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  PaperPlaneTilt, 
  CheckCircle, 
  WarningCircle, 
  BuildingApartment, 
  EnvelopeSimple, 
  UserCheck, 
  FileText, 
  Printer, 
  LockKey,
  Scales,
  Fingerprint
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";
import { LEA_NODAL_DIRECTORY, NodalInstitution, validateInstitutionalEmail } from "@/lib/legal/nodalDirectory";

interface StatutoryDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntityLabel?: string;
  defaultAccountNumber?: string;
  defaultCaseId?: string;
}

export function StatutoryDispatchModal({
  isOpen,
  onClose,
  defaultEntityLabel = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  defaultAccountNumber = "99481204812",
  defaultCaseId = "FIR-NDPS-2026-088"
}: StatutoryDispatchModalProps) {
  const [selectedInstId, setSelectedInstId] = useState<string>("sbi");
  const [orderType, setOrderType] = useState<"SECTION_68F_NDPS" | "SECTION_91_CRPC">("SECTION_68F_NDPS");
  const [caseId, setCaseId] = useState<string>(defaultCaseId);
  const [targetLabel, setTargetLabel] = useState<string>(defaultEntityLabel);
  const [accountNumber, setAccountNumber] = useState<string>(defaultAccountNumber);
  const [ifscCode, setIfscCode] = useState<string>("SBIN0000249");
  const [officerNotes, setOfficerNotes] = useState<string>("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const currentInstitution = LEA_NODAL_DIRECTORY.find(i => i.id === selectedInstId) || LEA_NODAL_DIRECTORY[0];
  const emailValidation = validateInstitutionalEmail(currentInstitution.primaryNodalEmail, currentInstitution.officialDomain);

  const handleDispatch = async () => {
    setIsTransmitting(true);
    try {
      const res = await fetch("/api/legal/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: currentInstitution.id,
          orderType,
          caseId,
          targetEntityLabel: targetLabel,
          accountNumber,
          ifscCode,
          officerNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchReceipt(data);
        toast.success("Statutory Order Transmitted Successfully", {
          description: `Delivered to ${currentInstitution.name} Nodal Desk (${currentInstitution.primaryNodalEmail})`
        });
      } else {
        toast.error("Transmission Rejected", {
          description: data.reason || data.error || "Compliance check failed"
        });
      }
    } catch (err: any) {
      toast.error("Network dispatch error", { description: err.message });
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 print:static print:inset-auto print:bg-transparent print:backdrop-blur-none print:p-0 print:m-0 print:block print:w-full print:h-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="bg-zinc-950 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-white print:static print:transform-none print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:rounded-none print:w-full print:p-0 print:m-0"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/50 print:hidden">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-white">
                <Scales size={24} weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Statutory Institutional Dispatch
                  </h2>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                    VERIFIED LEA GATEWAY
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct dispatch to verified Bank Nodal Desks & FIU-IND with cryptographic seal.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300">
            {!dispatchReceipt ? (
              <>
                {/* 1. Target Institution Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <BuildingApartment size={14} className="text-white" />
                    <span>Select Law Enforcement Agency (LEA) Nodal Institution</span>
                  </label>
                  <select
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-white focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Scheduled Commercial Banks (Pan-India)">
                      {LEA_NODAL_DIRECTORY.filter(i => i.category === "COMMERCIAL_BANK").map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code}) — {inst.primaryNodalEmail}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="FIU-Registered Virtual Digital Asset Exchanges">
                      {LEA_NODAL_DIRECTORY.filter(i => i.category === "CRYPTO_EXCHANGE").map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} — {inst.primaryNodalEmail}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Enforcement & Regulatory Authorities">
                      {LEA_NODAL_DIRECTORY.filter(i => i.category === "REGULATORY_AGENCY").map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} — {inst.primaryNodalEmail}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Institution Profile & Verified Domain Badge */}
                <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" weight="fill" />
                      <span className="font-bold text-white text-xs">{currentInstitution.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                        {currentInstitution.statutoryJurisdiction}
                      </span>
                    </div>

                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                      DOMAIN WHITELISTED ({currentInstitution.officialDomain})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-zinc-500 block">Verified Nodal Officer:</span>
                      <span className="text-white font-semibold">{currentInstitution.nodalOfficerName}</span>
                      <span className="text-zinc-400 block">{currentInstitution.designation}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Statutory Transmission Endpoint:</span>
                      <span className="text-emerald-400 font-bold block">{currentInstitution.primaryNodalEmail}</span>
                      <span className="text-zinc-500 block">Escalation: {currentInstitution.escalationEmail}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Statutory Order Type Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Statutory Provision & Order Mandate
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderType("SECTION_68F_NDPS")}
                      className={clsx(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer",
                        orderType === "SECTION_68F_NDPS"
                          ? "bg-white/10 border-white text-white"
                          : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                      )}
                    >
                      <div className="font-bold text-xs">Section 68F NDPS Act</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Immediate Debit Freeze Order on Illegally Acquired Syndicate Accounts (24 Hr Mandate)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("SECTION_91_CRPC")}
                      className={clsx(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer",
                        orderType === "SECTION_91_CRPC"
                          ? "bg-white/10 border-white text-white"
                          : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                      )}
                    >
                      <div className="font-bold text-xs">Section 91 Cr.P.C.</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Statutory Requisition for Account Opening Form (AOF), NetBanking IP Logs & Statements
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Account & Target Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-zinc-400 font-bold block mb-1">Case Ref / FIR</label>
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase text-zinc-400 font-bold block mb-1">Target Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase text-zinc-400 font-bold block mb-1">IFSC / Routing Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-zinc-400 font-bold block mb-1">Investigating Officer Forensics Note</label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="e.g. Account identified as primary off-ramp mule in darknet fentanyl distribution channel #8821. Requisition signed by Inspector Cyber Crime."
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </>
            ) : (
              /* Statutory Dispatch Receipt */
              <div 
                id="print-section"
                className="printable-dossier space-y-5 print:bg-white print:text-black print:p-0 print:overflow-visible print:w-full"
              >
                {/* Formal header for printed receipt */}
                <div className="hidden print:block text-center border-b-2 border-black pb-4">
                  <div className="text-[10px] font-bold tracking-widest text-black uppercase">
                    CHANDIGARH POLICE // CYBER CRIME & NARCOTICS INTELLIGENCE CELL
                  </div>
                  <h1 className="text-base font-bold text-black uppercase tracking-wide">
                    STATUTORY INSTITUTIONAL DISPATCH TRANSMISSION RECEIPT
                  </h1>
                  <p className="text-[10px] text-gray-700">
                    COURT-ADMISSIBLE TRANSMISSION AUDIT RECORD UNDER SECTION 63 BSA / SECTION 91 CRPC
                  </p>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2 print:bg-gray-100 print:border print:border-black print:text-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm print:text-black">
                      <CheckCircle size={20} weight="fill" className="print:text-black" />
                      <span>ORDER TRANSMITTED TO VERIFIED NODAL DESK</span>
                    </div>
                    <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded print:bg-gray-200 print:text-black font-mono">
                      {dispatchReceipt.trackingNumber}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed print:text-black font-medium">
                    Formal statutory order under {dispatchReceipt.order.statutoryAuthority} has been dispatched over encrypted LEA channel to {dispatchReceipt.institution.name}.
                  </p>
                </div>

                <div className="border border-white/15 rounded-xl p-4 bg-black/60 space-y-2 text-[10px] print:bg-white print:border print:border-black print:text-black">
                  <div className="flex justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                    <span className="text-zinc-400 print:text-gray-700 font-medium">Recipient Nodal Email:</span>
                    <span className="text-white print:text-black font-bold">{dispatchReceipt.institution.recipientEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                    <span className="text-zinc-400 print:text-gray-700 font-medium">Nodal Officer In-Charge:</span>
                    <span className="text-white print:text-black font-bold">{dispatchReceipt.institution.nodalOfficerName} ({dispatchReceipt.institution.designation})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                    <span className="text-zinc-400 print:text-gray-700 font-medium">Compliance Timeframe:</span>
                    <span className="text-amber-400 print:text-black font-bold">{dispatchReceipt.complianceWindowHours} HOURS MANDATORY WINDOW</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 print:border-b print:border-gray-300">
                    <span className="text-zinc-400 print:text-gray-700 font-medium">Transmission Timestamp:</span>
                    <span className="text-white print:text-black font-bold">{new Date(dispatchReceipt.timestamp).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-1">
                    <span className="text-zinc-400 print:text-gray-700 font-medium">SHA-256 Digital Transmission Seal:</span>
                    <span className="text-emerald-400 print:text-black font-mono font-bold select-all break-all">{dispatchReceipt.transmissionSeal}</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-white/10 rounded-xl text-[10px] text-zinc-300 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono print:bg-gray-50 print:border print:border-black print:text-black print:max-h-none print:overflow-visible">
                  {dispatchReceipt.order.formattedText}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 print:hidden">
            {!dispatchReceipt ? (
              <>
                <div className="text-[10px] text-zinc-500">
                  Pre-flight verified against official RBI/FIU-IND LEA directory.
                </div>

                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={isTransmitting || !emailValidation.isValid}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                    isTransmitting ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200"
                  )}
                >
                  {isTransmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                      <span>Transmitting via LEA Gateway...</span>
                    </>
                  ) : (
                    <>
                      <PaperPlaneTilt size={16} weight="bold" />
                      <span>Transmit Order to Nodal Desk</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Transmission Receipt</span>
                </button>

                <button
                  onClick={() => {
                    setDispatchReceipt(null);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
