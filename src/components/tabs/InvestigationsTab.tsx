import React from 'react';

interface CaseFile {
  id: string;
  title: string;
  lead: string;
  lastUpdated: string;
  findings: string;
}

interface Entity {
  id?: string;
  name?: string;
  type?: string;
  [key: string]: any;
}

interface InvestigationsTabProps {
  entity?: Entity;
}

const mockCases: CaseFile[] = [
  {
    id: "INV-993-A",
    title: "Lateral Movement via Compromised Service Account",
    lead: "SecOps-Alpha",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    findings: "Attacker utilized hardcoded credentials to pivot into production subnet. Exfiltration attempt blocked at firewall. Payload isolated."
  },
  {
    id: "INV-882-B",
    title: "Anomalous Endpoint Telemetry (Suspicious PowerShell)",
    lead: "Threat-Hunt-Omega",
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    findings: "Obfuscated script executed from temp directory. Discovered C2 beaconing. Endpoint quarantined pending forensic image capture."
  }
];

export const InvestigationsTab: React.FC<InvestigationsTabProps> = ({ entity }) => {
  return (
    <div className="w-full bg-black text-white p-6 font-mono selection:bg-white selection:text-black min-h-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          Active Investigations
        </h2>
        <div className="w-16 h-px bg-white mt-4 drop-shadow-[0_0_5px_rgba(255,255,255,1)]"></div>
        <p className="text-zinc-500 mt-4 text-sm max-w-2xl leading-relaxed">
          Linked case files and forensic dossiers associated with <span className="text-white tracking-widest uppercase">{entity?.name || "the target entity"}</span>. All records are classified.
        </p>
      </div>

      <div className="space-y-6">
        {mockCases.map((caseFile) => (
          <div key={caseFile.id} className="group relative border border-zinc-800 p-6 bg-zinc-950/30 hover:border-zinc-500 transition-colors duration-300">
            {/* Corner brackets aesthetic */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="text-xs text-zinc-500 tracking-[0.2em] mb-1 uppercase">Case File // {caseFile.id}</div>
                <h3 className="text-xl font-bold text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
                  {caseFile.title}
                </h3>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-xs text-zinc-600 uppercase tracking-widest">Lead Investigator</div>
                <div className="text-sm font-semibold text-zinc-300">{caseFile.lead}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="md:col-span-3">
                <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Executive Summary</div>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {caseFile.findings}
                </p>
              </div>
              <div className="md:col-span-1 md:text-right">
                <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Last Updated</div>
                <div className="text-sm text-zinc-500 tabular-nums">
                  {new Date(caseFile.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestigationsTab;
