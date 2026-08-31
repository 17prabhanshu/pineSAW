"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Funnel } from "@phosphor-icons/react";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/entities").then(r => r.json()).then(setEntities);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Entity Intelligence</h1>
          <p className="text-zinc-600 font-mono text-sm">MONITORED ACTORS, ACCOUNTS, WALLETS, AND IDENTIFIERS</p>
        </div>
        <button className="surface-2 border border-zinc-300 text-zinc-900 px-4 py-2 rounded-none font-medium text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
          <Funnel /> Filter
        </button>
      </header>

      <div className="surface-1 nexus-border rounded-none overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left text-sm flex-1 block overflow-auto">
          <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-300 w-full table table-fixed">
            <tr className="font-mono text-[10px] uppercase text-zinc-500">
              <th className="px-6 py-4 font-medium w-32">Type</th>
              <th className="px-6 py-4 font-medium">Label</th>
              <th className="px-6 py-4 font-medium w-32 text-right">Confidence</th>
              <th className="px-6 py-4 font-medium w-32 text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 w-full table table-fixed">
            {entities.map(ent => (
              <tr key={ent.id} className="hover:bg-zinc-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-mono text-xs text-zinc-600">
                  <Link href={`/entities/${ent.id}`} className="before:absolute before:inset-0 relative block">
                    {ent.type}
                  </Link>
                </td>
                <td className="px-6 py-4 text-zinc-800 group-hover:text-zinc-900 relative">
                  <div className="flex items-center gap-3">
                    <User className="text-zinc-500" />
                    {ent.label}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-xs text-zinc-500 relative">
                  {(ent.confidence * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 text-right relative">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-none bg-nexus-red/10 text-nexus-red border border-nexus-red/20">
                    {ent.priorityScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
