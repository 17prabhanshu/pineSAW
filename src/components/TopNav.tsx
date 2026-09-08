"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalligraphicMark } from "./CalligraphicMark";
import { 
  MagnifyingGlass, 
  CaretDown, 
  Terminal, 
  Radio, 
  Command,
  WarningOctagon
} from "@phosphor-icons/react";
import clsx from "clsx";

const navSections = [
  { href: "/", label: "Overview" },
  { href: "/entities", label: "Graph Explorer" },
  { href: "/investigations", label: "Dossiers" },
  { href: "/ingestion", label: "Ingestion" },
  { href: "/financial", label: "Forensics" },
  { href: "/reports", label: "Evidence & Reports" },
  { href: "/actions", label: "Action Center" },
  { href: "/alerts", label: "Alerts" },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 transition-all duration-300">
      <nav className="liquid-glass rounded-full px-5 py-2.5 flex items-center justify-between relative shadow-[0_12px_40px_rgba(0,0,0,0.75)] glass-press">
        
        {/* Left: Calligraphic C Monogram + DARKINT wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CalligraphicMark size={32} />
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-wider text-white group-hover:text-[#00f0ff] transition-colors">
                DARKINT
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline-block">
                Cyber Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Named Product Sections (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3">
          {navSections.map((sec) => {
            const isActive = sec.href === "/" ? pathname === "/" : pathname.startsWith(sec.href);
            return (
              <Link
                key={sec.href}
                href={sec.href}
                className={clsx(
                  "relative px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all rounded-full select-none",
                  isActive
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {sec.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
                      boxShadow: "0 0 10px #00f0ff"
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Telemetry pill & Command button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[10px] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
            <span>AIL / ZMQ NOMINAL</span>
          </div>

          {/* Cmd+K Quick Key */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 hover:border-white/20 bg-black/40 text-[10px] font-mono text-zinc-400 hover:text-white transition-all"
            title="Open Command Palette"
          >
            <Command size={11} />
            <span>K</span>
          </button>

          {/* Compact Dropdown trigger for narrow viewports */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono text-white"
          >
            <span>Sections</span>
            <CaretDown size={12} className={clsx("transition-transform", mobileMenuOpen && "rotate-180")} />
          </button>
        </div>
      </nav>

      {/* Compact Dropdown Menu on Mobile (No Sidebar rule honored) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3 rounded-2xl border border-white/15 bg-[#0a0c10] shadow-2xl flex flex-col space-y-1 backdrop-blur-xl">
          {navSections.map((sec) => {
            const isActive = sec.href === "/" ? pathname === "/" : pathname.startsWith(sec.href);
            return (
              <Link
                key={sec.href}
                href={sec.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "px-3 py-2 text-xs font-mono rounded-lg transition-colors flex items-center justify-between",
                  isActive
                    ? "bg-white/10 text-white font-bold text-[#00f0ff]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{sec.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
