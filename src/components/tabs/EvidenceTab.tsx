import React from 'react';
import { FileText, ChatCircle, Hash, LockKey } from '@phosphor-icons/react';

export default function EvidenceTab({ entity }: { entity: any }) {
  const evidenceTimeline = [
    {
      id: "ev_901",
      date: "2023-09-28",
      time: "22:14:05 UTC",
      type: "CHAT INTERCEPT",
      icon: <ChatCircle size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />,
      title: "Encrypted Telegram Communications",
      description: "Intercepted communications referencing 'the package' and coordinating a drop. PGP signatures match known keys associated with the entity.",
      tags: ["SIGINT", "HIGH CONFIDENCE"]
    },
    {
      id: "ev_902",
      date: "2023-10-02",
      time: "08:45:11 UTC",
      type: "DOCUMENT SEIZURE",
      icon: <FileText size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />,
      title: "Offshore Incorporation Papers",
      description: "Scanned documents recovered from a raid in Cyprus. Establishes formal link between the entity and Shell Corp Ltd.",
      tags: ["HUMINT", "VERIFIED"]
    },
    {
      id: "ev_903",
      date: "2023-10-12",
      time: "14:23:19 UTC",
      type: "BLOCKCHAIN FORENSICS",
      icon: <Hash size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />,
      title: "Wallet Address Attribution",
      description: "Chainalysis confirms wallet 0x3aF belongs to a known darknet mixer. Transaction traces map directly to the entity's primary holdings.",
      tags: ["FININT", "ON-CHAIN"]
    },
    {
      id: "ev_904",
      date: "2023-10-19",
      time: "03:11:00 UTC",
      type: "DEVICE EXTRACTION",
      icon: <LockKey size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />,
      title: "Recovered Keys & Credentials",
      description: "Forensic image of a seized laptop revealed hidden volumes containing SSH keys and access tokens for offshore servers.",
      tags: ["CYBER", "CRITICAL"]
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans bg-black text-white min-h-full">
      <div className="mb-10 border-b border-white pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl tracking-tighter font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Evidence Dossier</h2>
          <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest font-mono">Chronological Collection Timeline</p>
        </div>
        <div className="text-right font-mono text-xs text-gray-400">
          <p>Total Exhibits: 24</p>
          <p className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Admissibility: PENDING REVIEW</p>
        </div>
      </div>

      <div className="relative border-l border-white/20 ml-4 md:ml-8 space-y-12 pb-12">
        {evidenceTimeline.map((item, index) => (
          <div key={item.id} className="relative pl-10 md:pl-16 group">
            {/* Timeline node */}
            <div className="absolute -left-[17px] top-1 w-8 h-8 bg-black border border-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-shadow">
              {item.icon}
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-2">
              <div className="font-mono text-sm tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                {item.date} <span className="text-gray-500 ml-2 text-xs">{item.time}</span>
              </div>
              <div className="font-mono text-[10px] uppercase text-gray-400 tracking-widest border border-white/20 px-2 py-0.5 inline-block bg-white/5 group-hover:bg-white/10 transition-colors">
                {item.type}
              </div>
            </div>

            <div className="bg-black border border-white/20 p-5 group-hover:border-white/50 transition-colors mt-3">
              <h3 className="text-lg font-medium mb-3 tracking-tight text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
                {item.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-sans mb-4">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="font-mono text-xs text-gray-500">ID: {item.id}</div>
                <div className="flex gap-2 ml-auto">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono uppercase tracking-widest border border-white/30 text-gray-300 px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* End of timeline indicator */}
        <div className="absolute -left-[5px] bottom-0 w-2 h-2 bg-white rounded-full drop-shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
      </div>
    </div>
  );
}
