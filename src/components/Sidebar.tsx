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
    <aside className="w-60 bg-white nexus-border-r flex flex-col h-full shrink-0 shadow-sm z-20">
      <div className="flex-1 overflow-y-auto py-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-5">
            <h3 className="px-5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center justify-between px-5 py-2 text-xs transition-none border-l-2",
                        isActive
                          ? "border-gov-blue bg-blue-50/70 text-gov-blue font-bold"
                          : "border-transparent text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          weight={isActive ? "fill" : "bold"}
                          className={clsx("text-base", isActive ? "text-gov-blue" : "text-zinc-500")}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={clsx("text-[10px] font-mono px-1.5 py-0.2 font-bold", item.badgeColor || "bg-zinc-200 text-zinc-800")}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="text-[9px] font-mono bg-zinc-100 border border-zinc-300 px-1 py-0.5 text-zinc-500">
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
      <div className="p-3 border-t border-zinc-200 bg-zinc-50 text-[10px] font-mono text-zinc-600 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Tor Crawlers
          </span>
          <span className="font-bold text-zinc-800">8 Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            FIU-IND Node
          </span>
          <span className="font-bold text-emerald-700">Online</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-zinc-200 text-[9px] text-zinc-400">
          <span>pineSAW v2.0 (Phase 2)</span>
          <span>RESTRICTED</span>
        </div>
      </div>
    </aside>
  );
}
