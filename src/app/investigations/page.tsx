"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Plus } from "@phosphor-icons/react";
import clsx from "clsx";
import { NewCaseModal } from "@/components/NewCaseModal";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvestigations = () => {
    fetch("/api/investigations").then(r => r.json()).then(setInvestigations);
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Investigations</h1>
          <p className="text-zinc-300 font-mono text-sm">ACTIVE AND HISTORICAL INTELLIGENCE CASES</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-gov px-4 py-2 rounded-2xl font-medium text-sm flex items-center gap-2"
        >
          <Plus size={16} weight="bold" /> New Case
        </button>
      </header>

      <NewCaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchInvestigations();
        }}
      />

      <div className="surface-1 nexus-border rounded-2xl overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left text-sm flex-1 block overflow-auto">
          <thead className="sticky top-0 bg-zinc-800/30 border-b border-white/10 w-full table table-fixed">
            <tr className="font-mono text-[10px] uppercase text-zinc-400">
              <th className="px-6 py-4 font-medium w-32">Case ID</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium w-32">Priority</th>
              <th className="px-6 py-4 font-medium w-32">Status</th>
              <th className="px-6 py-4 font-medium w-48 text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 w-full table table-fixed">
            {investigations.map(inv => (
              <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-mono text-xs text-nexus-cyan">
                  <Link href={`/investigations/${inv.id}`} className="before:absolute before:inset-0 relative block">
                    {inv.caseId}
                  </Link>
                </td>
                <td className="px-6 py-4 text-zinc-200 group-hover:text-white relative">
                  <div className="flex items-center gap-3">
                    <Folder className="text-zinc-400" />
                    {inv.title}
                  </div>
                </td>
                <td className="px-6 py-4 relative">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-2xl font-mono text-[10px] border",
                    inv.priority === 'CRITICAL' && "bg-nexus-red/10 text-nexus-red border-nexus-red/20",
                    inv.priority === 'HIGH' && "bg-nexus-amber/10 text-nexus-amber border-nexus-amber/20",
                    inv.priority === 'MEDIUM' && "bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/20",
                    inv.priority === 'LOW' && "bg-zinc-800 text-zinc-300 border-zinc-700"
                  )}>
                    {inv.priority}
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <span className="font-mono text-xs text-zinc-300">{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-xs text-zinc-400 relative">
                  {new Date(inv.updatedAt).toISOString().split('T')[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
