"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, Funnel } from "@phosphor-icons/react";
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
    // Magnetic pull ratio
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
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-8 ml-auto"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200/50 animate-pulse rounded w-12 ml-auto"></div></td>
  </tr>
);

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entities")
      .then(r => r.json())
      .then(data => {
        setEntities(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Entity Intelligence</h1>
          <p className="text-zinc-400 font-mono text-sm">MONITORED ACTORS, ACCOUNTS, WALLETS, AND IDENTIFIERS</p>
        </div>
        <MagneticButton className="surface-2 border border-white/10 text-white px-4 py-2 rounded-none font-medium text-sm hover:bg-zinc-800/30 transition-colors flex items-center gap-2">
          <Funnel /> Filter
        </MagneticButton>
      </header>

      <div className=" glass rounded-[2rem] overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left text-sm flex-1 block overflow-auto">
          <thead className="sticky top-0 bg-zinc-800/20 border-b border-white/10 w-full table table-fixed">
            <tr className="font-mono text-[10px] uppercase text-zinc-400">
              <th className="px-6 py-4 font-medium w-32">Type</th>
              <th className="px-6 py-4 font-medium">Label</th>
              <th className="px-6 py-4 font-medium w-32 text-right">Confidence</th>
              <th className="px-6 py-4 font-medium w-32 text-right">Priority</th>
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
              {entities.map(ent => (
                <motion.tr variants={rowVariants} key={ent.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                    <Link href={`/entities/${ent.id}`} className="before:absolute before:inset-0 relative block">
                      {ent.type}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-200 group-hover:text-white relative">
                    <div className="flex items-center gap-3">
                      <User className="text-zinc-400" />
                      {ent.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-zinc-400 relative">
                    {(ent.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-none bg-nexus-red/10 text-nexus-red border border-nexus-red/20">
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
