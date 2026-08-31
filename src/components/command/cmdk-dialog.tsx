"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { 
  Search, 
  Wallet, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  FileText, 
  Banknote, 
  Sparkles, 
  ExternalLink,
  Command as CommandIcon
} from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalCommandMenu({
  onSelectView
}: {
  onSelectView?: (view: "bento" | "graph") => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ⌘K Keyboard Listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      {/* Visual Trigger Bar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-zinc-900/60 px-4 py-2 text-xs font-mono text-zinc-400 backdrop-blur-xl transition-all hover:border-violet-500/40 hover:bg-zinc-900 hover:text-zinc-200 shadow-sm"
      >
        <Search className="h-3.5 w-3.5 text-violet-400" />
        <span>Search suspects, wallets (btc:), or actions...</span>
        <kbd className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#09090b] shadow-2xl shadow-violet-500/10">
            <Command className="w-full text-white">
              <div className="flex items-center border-b border-white/[0.08] px-4">
                <Search className="mr-3 h-4 w-4 text-violet-400" />
                <Command.Input
                  placeholder="Type a command, suspect name, or wallet prefix..."
                  className="h-14 w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-3 font-mono text-xs">
                <Command.Empty className="p-4 text-center text-xs text-zinc-500">
                  No threat intel artifacts matched your query.
                </Command.Empty>

                {/* Primary Targets */}
                <Command.Group heading="High-Priority Targets" className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/investigations/INV-2026-0042"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    <span>ShadowBroker (Risk: 88/100 · Kingpin)</span>
                    <span className="ml-auto text-[10px] text-zinc-500">INV-2026-0042</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/financial"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <Wallet className="h-4 w-4 text-amber-400" />
                    <span>btc: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq</span>
                    <span className="ml-auto text-[10px] text-zinc-500">14.85 BTC</span>
                  </Command.Item>
                </Command.Group>

                {/* View Modes */}
                <Command.Group heading="Navigation & Console Views" className="mt-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <Command.Item
                    onSelect={() => runCommand(() => onSelectView && onSelectView("bento"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>Switch to Bento Ingestion Dashboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => onSelectView && onSelectView("graph"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Switch to Interactive Identity Graph (React Flow)</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/financial"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <Banknote className="h-4 w-4 text-emerald-400" />
                    <span>Asset Review & Section 68F Freezes</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/reports"))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-violet-600/20 hover:text-white"
                  >
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <span>Print Section 65B Certified Legal Dossier</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 text-[10px] font-mono text-zinc-500">
                <span>Navigate with ↑ ↓ · Press ESC to close</span>
                <span className="text-violet-400 font-bold">pineSAW OSINT Console</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
