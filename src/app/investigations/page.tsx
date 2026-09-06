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
    <td className="px-6 py-4"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-16"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-20 ml-auto"></div></td>
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
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Investigations</h1>
          <p className="text-zinc-400 font-mono text-sm">ACTIVE AND HISTORICAL INTELLIGENCE CASES</p>
        </div>
        <MagneticButton 
          onClick={() => setIsModalOpen(true)}
          className="btn-gov px-4 py-2 rounded-none font-medium text-sm flex items-center gap-2"
        >
          <Plus size={16} weight="bold" /> New Case
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

      <div className=" glass rounded-[2rem] overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left text-sm flex-1 block overflow-auto">
          <thead className="sticky top-0 glass/5 border-b border-white/10 w-full table table-fixed z-10">
            <tr className="font-mono text-[10px] uppercase text-zinc-400">
              <th className="px-6 py-4 font-medium w-32">Case ID</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium w-32">Priority</th>
              <th className="px-6 py-4 font-medium w-32">Status</th>
              <th className="px-6 py-4 font-medium w-48 text-right">Last Updated</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody className="divide-y divide-zinc-200 w-full table table-fixed">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          ) : (
            <motion.tbody 
              variants={tableVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="divide-y divide-zinc-200 w-full table table-fixed"
            >
              {investigations.map(inv => (
                <motion.tr variants={rowVariants} key={inv.id} className="hover:glass/5 transition-colors group cursor-pointer">
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
                      "px-2 py-0.5 rounded-none font-mono text-[10px] border",
                      inv.priority === 'CRITICAL' && "bg-nexus-red/10 text-nexus-red border-nexus-red/20",
                      inv.priority === 'HIGH' && "bg-nexus-amber/10 text-nexus-amber border-nexus-amber/20",
                      inv.priority === 'MEDIUM' && "bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/20",
                      inv.priority === 'LOW' && "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}>
                      {inv.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 relative">
                    <span className="font-mono text-xs text-zinc-400">{inv.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-zinc-400 relative">
                    {new Date(inv.updatedAt).toISOString().split('T')[0]}
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
