"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Plus } from "@phosphor-icons/react";
import clsx from "clsx";
import { NewCaseModal } from "@/components/NewCaseModal";
import { motion, useMotionValue, useSpring } from "motion/react";
import { motionTokens } from "@/lib/motionTokens";

function MagneticButton({ children, className, onClick }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionTokens.defaultTransition);
  const springY = useSpring(y, motionTokens.defaultTransition);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

const tableVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800/60 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800/60 animate-pulse rounded w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800/60 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-800/60 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800/60 animate-pulse rounded w-20 ml-auto"></div></td>
  </tr>
);

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestigations = () => {
    setIsLoading(true);
    fetch("/api/investigations")
      .then(r => r.json())
      .then(data => {
        setInvestigations(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Investigations</h1>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Active and Historical Intelligence Cases</p>
        </div>
        <MagneticButton 
          onClick={() => setIsModalOpen(true)}
          className="btn-gov px-4 py-2 font-medium text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} weight="bold" /> New Case
        </MagneticButton>
      </header>

      <NewCaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchInvestigations();
        }}
      />

      <div className="w-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-black/90 border-b border-white/10">
              <tr className="font-mono text-[10px] uppercase text-zinc-400">
                <th className="px-4 py-3 font-semibold w-32">Case ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold w-28">Priority</th>
                <th className="px-4 py-3 font-semibold w-28">Status</th>
                <th className="px-4 py-3 font-semibold w-36 text-right">Last Updated</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody className="divide-y divide-white/5 font-mono">
                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            ) : (
              <motion.tbody 
                variants={tableVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="divide-y divide-white/5 font-mono"
              >
                {investigations.map(inv => (
                  <motion.tr variants={rowVariants} key={inv.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-white">
                      <Link href={`/investigations/${inv.id}`} className="hover:underline">
                        {inv.caseId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-200 group-hover:text-white">
                      <Link href={`/investigations/${inv.id}`} className="flex items-center gap-2.5">
                        <Folder className="text-zinc-400 group-hover:text-white transition-colors" size={15} />
                        <span className="font-medium text-white group-hover:underline">{inv.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block",
                        inv.priority === 'CRITICAL' ? "bg-red-950/60 text-red-400 border-red-500/30" :
                        inv.priority === 'HIGH' ? "bg-amber-950/60 text-amber-300 border-amber-500/30" :
                        "bg-white/10 text-white border-white/20"
                      )}>
                        {inv.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">{inv.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                      {new Date(inv.updatedAt).toISOString().split('T')[0]}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
