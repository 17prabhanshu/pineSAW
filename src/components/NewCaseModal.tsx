"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, X, WarningOctagon, User, ShieldCheck, FileText, CaretRight } from "@phosphor-icons/react";
import clsx from "clsx";

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCase: any) => void;
}

export function NewCaseModal({ isOpen, onClose, onSuccess }: NewCaseModalProps) {
  const router = useRouter();
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [caseId, setCaseId] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [investigator, setInvestigator] = useState("OP-7492");
  const [primaryEntityId, setPrimaryEntityId] = useState("");
  const [category, setCategory] = useState("Darknet Market Ingestion");
  const [initialNote, setInitialNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Auto-generate suggested Case ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setCaseId(`INV-2026-${randomNum}`);
      setError(null);

      // Fetch entities for selection
      fetch("/api/entities")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEntities(data.filter((e: any) => e.type === "ACTOR" || e.type === "ACCOUNT"));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a case title or operational code name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          title: title.trim(),
          priority,
          investigator: investigator.trim() || "OP-7492",
          primaryEntityId: primaryEntityId || undefined,
          category,
          initialNote: initialNote.trim() || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create investigation");
      }

      const newCase = await res.json();
      onClose();
      if (onSuccess) {
        onSuccess(newCase);
      } else {
        router.push(`/investigations/${newCase.id}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-100">
      <div 
        className="bg-white border border-zinc-300 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] rounded-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002244] text-white px-6 py-4 flex justify-between items-center shrink-0 border-b border-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white text-[#002244] flex items-center justify-center font-bold text-sm">
              <FolderPlus size={18} weight="bold" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">Chandigarh Police Intelligence Desk</div>
              <h2 className="text-base font-bold tracking-wide">Initiate New Investigation File</h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-300 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-zinc-900">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <WarningOctagon size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">Case Number</label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-zinc-100 border border-zinc-300 px-3 py-2 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-gov-blue"
                placeholder="INV-2026-XXXX"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">
                Operation Title / Codename <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-gov-blue"
                placeholder="e.g. Operation Telegram Hydra Cartel"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1.5">Priority Classification</label>
            <div className="grid grid-cols-4 gap-2">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriority(lvl)}
                  className={clsx(
                    "py-2 text-xs font-mono font-bold transition-none border",
                    priority === lvl 
                      ? lvl === "CRITICAL" ? "bg-red-600 text-white border-red-700" :
                        lvl === "HIGH" ? "bg-amber-600 text-white border-amber-700" :
                        lvl === "MEDIUM" ? "bg-gov-blue text-white border-blue-800" :
                        "bg-zinc-800 text-white border-zinc-900"
                      : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">Lead Officer ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={investigator}
                  onChange={(e) => setInvestigator(e.target.value)}
                  className="w-full bg-white border border-zinc-300 px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-gov-blue"
                  placeholder="OP-7492"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">Intelligence Source / Trigger</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-gov-blue"
              >
                <option value="Darknet Market Ingestion">Darknet Market Crawler (Tor)</option>
                <option value="Encrypted Telegram Channel">Encrypted Chat Monitor (Telegram)</option>
                <option value="Crypto Exchange SAR">Exchange Suspicious Activity Report (SAR)</option>
                <option value="Financial Intelligence Unit">FIU-IND Suspicious Wire Escalation</option>
                <option value="Narcotics Control Bureau">NCB / Inter-Agency Referral</option>
              </select>
            </div>
          </div>

          {/* Primary Subject Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">
              Link Primary Suspect / Target Entity (Optional)
            </label>
            <select
              value={primaryEntityId}
              onChange={(e) => setPrimaryEntityId(e.target.value)}
              className="w-full bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-gov-blue font-mono"
            >
              <option value="">-- No initial subject linked (Create blank file) --</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  [{ent.type}] {ent.label} (Score: {ent.priorityScore})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Briefing / Notes */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-600 mb-1">
              Preliminary Case Synopsis & Actionable Objective
            </label>
            <textarea
              rows={3}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full bg-white border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-gov-blue font-mono resize-none"
              placeholder="e.g. Intercepted PGP communication indicating synthetic opioid distribution across North Indian distribution nodes. Immediate asset discovery and subpoena required."
            ></textarea>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-300 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gov px-5 py-2 text-xs flex items-center gap-2"
            >
              {loading ? (
                <span>Registering Case...</span>
              ) : (
                <>
                  <span>Create Investigation File</span>
                  <CaretRight size={14} weight="bold" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
