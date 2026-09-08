"use client";

import React, { useState } from "react";
import { 
  FileText, 
  ChatCircle, 
  Hash, 
  LockKey, 
  ShieldCheck, 
  CheckCircle, 
  Scales, 
  Fingerprint, 
  Printer, 
  Clock,
  ArrowSquareOut
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Section65BCertificateModal } from "@/components/Section65BCertificateModal";
import type { Section65BCertificate } from "@/lib/legal/admissibilityEngine";

interface EvidenceTabProps {
  entity: any;
}

export default function EvidenceTab({ entity }: EvidenceTabProps) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, { verified: boolean; sha256: string }>>({});
  const [activeCertificate, setActiveCertificate] = useState<Section65BCertificate | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const exhibits = [
    {
      id: "EXHIBIT-NDPS-2026-001",
      caseId: "FIR-NDPS-2026-088",
      type: "CHAT_INTERCEPT",
      source: "Telegram (@tri_city_dead_drops / t.me/ice_chd)",
      title: "Encrypted Narcotics Drop Coordination",
      description: "Intercepted communications referencing 250 units Fentanyl m30 dead drops in Sector 35. Matched crypto escrow payment instructions.",
      rawPayload: "TELEGRAM_INTERCEPT_RAW_LOG_ENTRY_8821: Sector 35 dead drop package 250x m30 confirmed. Escrow release address bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq.",
      expectedSha256: "3d4b8f72c918a90184b2e8dc77610fa2e36b85c378952b1bdf624835698b71d9",
      capturedAt: "2026-09-07T14:22:10Z",
      custodian: "P. Shekhar, Inspector (Cyber Crime)",
      custodyChain: "Acquired via Lacus Tor Node -> FAISS Vectorized -> SHA-256 Sealed",
      tags: ["SIGINT", "COURT EXHIBIT", "SECTION 63 BSA"]
    },
    {
      id: "EXHIBIT-NDPS-2026-002",
      caseId: "FIR-NDPS-2026-088",
      type: "BLOCKCHAIN_FORENSICS",
      source: "Ethereum & Bitcoin UTXO Ledger (Peeling Trace)",
      title: "Illicit Syndicate Mixing & Off-Ramp Flow",
      description: "Peeling chain tracing 12 hops from Wasabi mixer into Binance intermediate address, thence off-ramping INR 42,00,000 to State Bank of India account.",
      rawPayload: "BLOCKCHAIN_LEDGER_EXPORT: TxHash 0x742d35Cc6634C0532925a3b844Bc454e4438f44e -> SBI A/C 99481204812 (IFSC: SBIN0000249)",
      expectedSha256: "a68c9284bf41819d9b0e12f67623910c2847a9cb521946001273921bdfa89104",
      capturedAt: "2026-09-07T18:45:00Z",
      custodian: "Agent Cipher / FININT Desk",
      custodyChain: "Mempool Hook -> On-Chain Forensic Graph -> Immutable Vault",
      tags: ["FININT", "ON-CHAIN", "AML FREEZE"]
    },
    {
      id: "EXHIBIT-NDPS-2026-003",
      caseId: "FIR-NDPS-2026-088",
      type: "SEIZED_DEVICE_IMAGE",
      source: "Forensic Bitstream Image (E01) of Seized ThinkPad T14",
      title: "Recovered Session Tokens & PGP Master Key",
      description: "Bitstream forensic image containing decrypted Signal desktop database and private PGP keyring matching darknet vendor signatures.",
      rawPayload: "FORENSIC_IMAGE_HASH_E01: ThinkPad-T14-Ser#PF29810-Block0toEnd-Partition2-LinuxLUKS",
      expectedSha256: "7c18a245f891029c7820128913bc541920849102834019284719203847291023",
      capturedAt: "2026-09-08T02:15:30Z",
      custodian: "Digital Forensics Lab, CFSL Chandigarh",
      custodyChain: "Physical Seizure Memo (Panchnama) -> Write Blocker -> EnCase Image",
      tags: ["DEVICE EXTRACTION", "PGP KEYRING", "CRITICAL"]
    }
  ];

  const handleVerifyIntegrity = async (exhibit: typeof exhibits[0]) => {
    setVerifyingId(exhibit.id);
    try {
      const res = await fetch("/api/evidence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exhibitId: exhibit.id,
          caseId: exhibit.caseId,
          rawPayload: exhibit.rawPayload,
          expectedSha256: exhibit.expectedSha256,
          generateCertificate: true
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifiedMap(prev => ({
          ...prev,
          [exhibit.id]: { verified: true, sha256: data.calculatedSha256 }
        }));
        toast.success("Cryptographic Integrity Verified (Zero Tamper)", {
          description: `SHA-256 Checksum for ${exhibit.id} matches legal custody record byte-for-byte.`
        });
      } else {
        toast.error("Integrity Verification Failed", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Network error during verification", { description: err.message });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleOpenCertificate = async (exhibit: typeof exhibits[0]) => {
    try {
      const res = await fetch("/api/evidence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exhibitId: exhibit.id,
          caseId: exhibit.caseId,
          rawPayload: exhibit.rawPayload,
          expectedSha256: exhibit.expectedSha256,
          generateCertificate: true
        })
      });
      const data = await res.json();
      if (data.certificate) {
        setActiveCertificate(data.certificate);
        setIsCertModalOpen(true);
      } else {
        toast.error("Failed to generate certificate document.");
      }
    } catch (e: any) {
      toast.error("Could not fetch certificate", { description: e.message });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto font-mono text-white min-h-full space-y-8">
      <Section65BCertificateModal
        certificate={activeCertificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
            <span>FORENSIC DOSSIER</span> · <span className="text-white">SECTION 63 BSA / 65B IEA</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Court-Admissible Evidence Pipeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Chain of Custody, dual cryptographic hashes (SHA-256 & MD5), and statutory admissibility certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-zinc-950 border border-white/10 rounded-xl text-right">
            <span className="text-[9px] text-zinc-500 uppercase block">Statutory Status</span>
            <span className="text-xs font-bold text-emerald-400">BSA 2023 COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Exhibits & Chain of Custody Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Scales size={16} className="text-white" />
            <span>Formal Exhibits Ledger ({exhibits.length} Registered Items)</span>
          </div>
          <span className="text-[10px] text-zinc-500">
            Target Reference: {entity?.label || "Unknown Target"}
          </span>
        </div>

        <div className="space-y-4">
          {exhibits.map((exhibit) => {
            const verificationState = verifiedMap[exhibit.id];
            const isCurrentlyVerifying = verifyingId === exhibit.id;

            return (
              <div 
                key={exhibit.id}
                className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 hover:border-white/20 transition-all shadow-sm"
              >
                {/* Top Row: Exhibit ID, Type, Dates */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        {exhibit.id}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {exhibit.title}
                      </span>
                      <span className="text-[10px] text-zinc-400">({exhibit.source})</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
                      <Clock size={12} />
                      <span>Captured: {new Date(exhibit.capturedAt).toLocaleString("en-IN")}</span>
                      <span>·</span>
                      <span>Custodian: {exhibit.custodian}</span>
                    </div>
                  </div>

                  {/* Tamper / Verification Status Badge */}
                  <div>
                    {verificationState ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-bold text-emerald-400">
                        <ShieldCheck size={14} weight="fill" />
                        <span>ZERO TAMPER VERIFIED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                        <Fingerprint size={14} />
                        <span>INTEGRITY SEAL PENDING</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Description & Chain of Custody */}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {exhibit.description}
                </p>

                {/* Chain of Custody Provenance Strip */}
                <div className="p-3 bg-black/60 border border-white/5 rounded-xl space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-zinc-500 uppercase">Chain of Custody Provenance:</span>
                    <span className="text-zinc-300">{exhibit.custodyChain}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-zinc-500 uppercase">Cryptographic SHA-256 Hash:</span>
                    <span className="text-emerald-400/90 font-mono truncate max-w-[450px] select-all">
                      {verificationState ? verificationState.sha256 : exhibit.expectedSha256}
                    </span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {exhibit.tags.map(t => (
                      <span key={t} className="text-[9px] uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyIntegrity(exhibit)}
                      disabled={isCurrentlyVerifying}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black border border-white/20 rounded-lg text-xs font-semibold text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isCurrentlyVerifying ? (
                        <>
                          <div className="w-3 h-3 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                          <span>Computing Hashes...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Verify Hash Integrity</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenCertificate(exhibit)}
                      className="px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Scales size={14} weight="bold" />
                      <span>Section 63 BSA Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
