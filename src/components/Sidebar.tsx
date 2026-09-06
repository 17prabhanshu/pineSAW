"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Circle,
  Pulse
} from "@phosphor-icons/react";
import clsx from "clsx";

const navSections = [
  {
    title: "OPERATIONS",
    items: [
      { href: "/", label: "Command Center", icon: ShieldChevron },
      { href: "/actions", label: "Action Center", icon: CheckSquareOffset, badge: "11" },
      { href: "/alerts", label: "Alerts", icon: WarningOctagon, badge: "03", badgeColor: "bg-red-600 text-white" },
      { href: "/investigations", label: "Investigations", icon: FolderOpen },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { href: "/entities", label: "Entities Directory", icon: Users },
      { href: "/search", label: "Global Search", icon: MagnifyingGlass, shortcut: "⌘K" },
    ]
  },
  {
    title: "FINANCIAL FORENSICS",
    items: [
      { href: "/financial", label: "Asset Review (Fiat)", icon: Bank, badge: "6" },
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
      { href: "/ingestion", label: "Tor & NLP Ingestion", icon: Database },
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
    <aside className="hidden md:flex w-64 liquid-glass rounded-[2rem] flex-col fixed top-28 bottom-6 left-6 z-40 overflow-hidden shadow-2xl border border-white/10">
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">
              {section.title}
            </h3>
            <ul className="space-y-1 px-4">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center justify-between px-4 py-2.5 text-sm transition-all rounded-xl",
                        isActive
                          ? "bg-gemini-purple/20 text-white font-medium shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_10px_rgba(139,92,246,0.3)] border border-gemini-purple/30"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          weight={isActive ? "fill" : "regular"}
                          className={clsx("text-lg", isActive ? "text-gemini-purple" : "text-zinc-500")}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={clsx("text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", item.badgeColor || "bg-black/50 text-zinc-300 border border-white/10")}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="text-[10px] font-mono bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-lg text-zinc-500 shadow-inner">
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
      <div className="p-5 border-t border-white/5 bg-black/20 text-xs font-mono text-zinc-500 space-y-3 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gemini-purple rounded-full shadow-[0_0_10px_#8b5cf6] animate-pulse"></span>
            Tor Nodes
          </span>
          <span className="font-medium text-zinc-300">8 Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gemini-accent rounded-full shadow-[0_0_10px_#3b82f6]"></span>
            FIU-IND
          </span>
          <span className="font-medium text-gemini-accent">Online</span>
        </div>
        <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/5 text-[10px] text-zinc-600">
          <span>pineSAW v2.5</span>
          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">SECURE</span>
        </div>
      </div>
    </aside>
  );
}
