"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldChevron,
  WarningOctagon,
  FolderOpen,
  Users,
  Link as LinkIcon,
  MagnifyingGlass,
  FileText,
  Database,
  Bank,
  CheckSquareOffset
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
      { href: "/entities", label: "Entities", icon: Users },
      { href: "/search", label: "Global Search", icon: MagnifyingGlass },
    ]
  },
  {
    title: "FINANCIAL",
    items: [
      { href: "/financial", label: "Asset Review", icon: Bank },
    ]
  },
  {
    title: "REPORTING",
    items: [
      { href: "/reports", label: "Reports & Requests", icon: FileText },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/ingestion", label: "Pipeline Simulator", icon: Database },
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
    <aside className="w-56 bg-white nexus-border-r flex flex-col h-full shrink-0 shadow-sm z-20">
      <div className="flex-1 overflow-y-auto py-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-semibold">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-5 py-2 text-sm transition-colors border-l-2",
                        isActive
                          ? "border-gov-blue bg-zinc-50 text-zinc-900 font-medium"
                          : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      )}
                    >
                      <item.icon
                        weight={isActive ? "fill" : "regular"}
                        className={clsx("text-lg", isActive ? "text-gov-blue" : "text-zinc-500")}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-zinc-200 text-xs text-zinc-500 font-mono flex flex-col items-center gap-1">
        <span>pineSAW v1.4.2</span>
        <span className="text-[9px]">RESTRICTED ACCESS</span>
      </div>
    </aside>
  );
}
