"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Folder, User, FileText, Settings, X } from "lucide-react";
import { transitionSpring } from "@/lib/motionTokens";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            transition={transitionSpring}
            className="relative w-full max-w-2xl glass border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >
            <Command className="w-full h-full flex flex-col">
              <div className="flex items-center px-4 border-b border-white/5">
                <Search className="w-5 h-5 text-zinc-400 mr-2" />
                <Command.Input 
                  autoFocus
                  placeholder="Search entities, cases, or commands..." 
                  className="flex-1 h-14 bg-transparent border-none outline-none text-white placeholder:text-zinc-400 text-lg"
                />
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-zinc-900/50 rounded-md text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-zinc-400">No results found.</Command.Empty>

                <Command.Group heading="Cases" className="text-xs font-semibold text-zinc-400 px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-zinc-400 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold">
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/cases/C-2024-001"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <Folder className="w-4 h-4 mr-3 text-blue-500" />
                    <span>C-2024-001: Operation Iron Thunder</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/cases/C-2024-002"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <Folder className="w-4 h-4 mr-3 text-blue-500" />
                    <span>C-2024-002: Alpha Syndicate</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Entities" className="text-xs font-semibold text-zinc-400 px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-zinc-400 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold mt-2">
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/entities/E-9923"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <User className="w-4 h-4 mr-3 text-green-500" />
                    <span>Vikram Singh (E-9923)</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/entities/E-8841"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <User className="w-4 h-4 mr-3 text-green-500" />
                    <span>Rajiv Sharma (E-8841)</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Quick Actions" className="text-xs font-semibold text-zinc-400 px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-zinc-400 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold mt-2">
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/reports/new"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <FileText className="w-4 h-4 mr-3 text-zinc-400" />
                    <span>Create New Report</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => router.push("/settings"))}
                    className="flex items-center px-4 py-3 cursor-pointer rounded-lg hover:bg-zinc-900/50 data-[selected=true]:bg-zinc-900/50 text-white"
                  >
                    <Settings className="w-4 h-4 mr-3 text-zinc-400" />
                    <span>System Settings</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
