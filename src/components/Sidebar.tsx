"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ShieldChevron,
  WarningOctagon,
  FolderOpen,
  Users,
  MagnifyingGlass,
  FileText,
  Database,
  Bank,
  CheckSquareOffset,
} from "@phosphor-icons/react";
import clsx from "clsx";

const navSections = [
  {
    title: "OPERATIONS",
    items: [
      { href: "/", label: "Command Center", icon: ShieldChevron },
      { href: "/actions", label: "Action Center", icon: CheckSquareOffset },
      { href: "/alerts", label: "Alerts", icon: WarningOctagon },
      { href: "/investigations", label: "Investigations", icon: FolderOpen },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { href: "/entities", label: "Entities Directory", icon: Users },
      { href: "/search", label: "FAISS Vector Search", icon: MagnifyingGlass, shortcut: "⌘K" },
    ]
  },
  {
    title: "FINANCIAL FORENSICS",
    items: [
      { href: "/financial", label: "Asset Review (Fiat)", icon: Bank },
    ]
  },
  {
    title: "STATUTORY REPORTING",
    items: [
      { href: "/reports", label: "Evidentiary Reports", icon: FileText },
    ]
  },
  {
    title: "INTELLIGENCE INGESTION",
    items: [
      { href: "/ingestion", label: "AIL / ZeroMQ Streams", icon: Database },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar z-30 select-none">
      <div className="flex-1 py-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-5">
            <h3 className="px-5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">
              {section.title}
            </h3>
            <ul className="space-y-0.5 px-3">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "relative flex items-center justify-between px-3 py-2 text-xs transition-all rounded-lg",
                        isActive
                          ? "text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white/10 border border-white/15 rounded-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-2.5">
                        <item.icon
                          weight={isActive ? "fill" : "regular"}
                          className={clsx("text-base", isActive ? "text-white" : "text-zinc-400")}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={clsx("relative z-10 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold", item.badgeColor || "bg-black/60 text-zinc-300 border border-white/10")}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="relative z-10 text-[9px] font-mono bg-black/60 border border-white/10 px-1.5 py-0.5 rounded text-zinc-400">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      {/* System Telemetry Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-black/40 text-[11px] font-mono text-zinc-400 space-y-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Tor Lacus
          </span>
          <span className="text-white font-semibold">8 Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            FIU-IND Node
          </span>
          <span className="text-white font-semibold">Online</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] text-zinc-500">
          <span>DARKINT v2.8</span>
          <span className="bg-white/5 px-1.5 py-0.2 rounded text-zinc-400 border border-white/5">SECURE</span>
        </div>
      </div>
    </aside>
  );
}
