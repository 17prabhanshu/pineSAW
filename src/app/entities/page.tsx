"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { User, Funnel, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { motionTokens } from "@/lib/motionTokens";
import { toast } from "sonner";
import clsx from "clsx";

const tableVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 }
};

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 animate-pulse rounded w-32"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800 animate-pulse rounded w-8 ml-auto"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800 animate-pulse rounded w-12 ml-auto"></div></td>
  </tr>
);

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/entities")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntities(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Failed to load entities from database.");
      });
  }, []);

  const filteredEntities = useMemo(() => {
    return entities.filter(ent => {
      const matchesSearch = 
        ent.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ent.type?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "ALL") return true;
      return ent.type?.toUpperCase() === filter;
    });
  }, [entities, filter, searchQuery]);

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-1">Entity Intelligence</h1>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
            Monitored Threat Actors, Financial Accounts, Wallets, and Identifiers
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search entity..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
            />
          </div>

          <div className="flex bg-zinc-950 border border-white/10 rounded-xl p-0.5 overflow-x-auto max-w-full">
            {["ALL", "ACTOR", "ACCOUNT", "WALLET", "IDENTIFIER"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  toast.info(`Filtered: ${f}`);
                }}
                className={clsx(
                  "px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                  filter === f ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="glass rounded-xl border border-white/10 overflow-hidden flex-1 flex flex-col shadow-xl">
        <table className="w-full text-left text-sm flex-1 block overflow-y-auto">
          <thead className="sticky top-0 bg-black/90 border-b border-white/10 w-full table table-fixed z-10">
            <tr className="font-mono text-[10px] uppercase text-zinc-400">
              <th className="px-6 py-3.5 font-medium w-32">Type</th>
              <th className="px-6 py-3.5 font-medium">Identifier / Label</th>
              <th className="px-6 py-3.5 font-medium w-32 text-right">Confidence</th>
              <th className="px-6 py-3.5 font-medium w-32 text-right">Priority</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody className="divide-y divide-white/10 w-full table table-fixed">
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          ) : (
            <motion.tbody 
              variants={tableVariants} 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }}
              className="divide-y divide-white/5 w-full table table-fixed"
            >
              {filteredEntities.map(ent => (
                <motion.tr 
                  variants={rowVariants} 
                  key={ent.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                    <Link href={`/entities/${ent.id}`} className="before:absolute before:inset-0 relative block">
                      {ent.type}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-200 group-hover:text-white relative">
                    <div className="flex items-center gap-3">
                      <User className="text-zinc-500 group-hover:text-white transition-colors" size={16} />
                      <span className="font-medium">{ent.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-zinc-400 relative">
                    {((ent.confidence || 0.95) * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <span className={clsx(
                      "font-mono text-xs px-2.5 py-0.5 rounded-full border",
                      ent.priorityScore >= 80 
                        ? "bg-red-500/20 text-red-400 border-red-500/30 font-bold" 
                        : "bg-white/10 text-white border-white/20"
                    )}>
                      {ent.priorityScore}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>
    </div>
  );
}
