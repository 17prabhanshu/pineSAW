import React from 'react';

interface Alert {
  id: string;
  severity: string;
  type: string;
  timestamp: string;
  status: string;
}

interface Entity {
  id?: string;
  name?: string;
  type?: string;
  [key: string]: any;
}

interface AlertsTabProps {
  entity?: Entity;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-8902-1",
    severity: "CRITICAL",
    type: "UNAUTHORIZED_ACCESS_ATTEMPT",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "INVESTIGATING"
  },
  {
    id: "ALT-8902-2",
    severity: "HIGH",
    type: "ANOMALOUS_DATA_EGRESS",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "OPEN"
  },
  {
    id: "ALT-8902-3",
    severity: "MEDIUM",
    type: "PRIVILEGE_ESCALATION",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "RESOLVED"
  }
];

export const AlertsTab: React.FC<AlertsTabProps> = ({ entity }) => {
  return (
    <div className="w-full bg-black text-white p-6 font-mono selection:bg-white selection:text-black min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          Security Incidents
        </h2>
        <p className="text-zinc-400 mt-2 text-sm">
          Tracking anomalous activity for {entity?.name || "the selected entity"}.
        </p>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950">
              <th className="p-4 text-xs tracking-widest text-zinc-500 uppercase font-medium">Incident ID</th>
              <th className="p-4 text-xs tracking-widest text-zinc-500 uppercase font-medium">Severity</th>
              <th className="p-4 text-xs tracking-widest text-zinc-500 uppercase font-medium">Type</th>
              <th className="p-4 text-xs tracking-widest text-zinc-500 uppercase font-medium">Timestamp</th>
              <th className="p-4 text-xs tracking-widest text-zinc-500 uppercase font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {mockAlerts.map((alert) => (
              <tr key={alert.id} className="group hover:bg-zinc-900/50 transition-colors cursor-pointer">
                <td className="p-4 text-sm font-semibold tracking-wide text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.6)] transition-all">
                  {alert.id}
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 text-xs border ${
                    alert.severity === 'CRITICAL' ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 
                    alert.severity === 'HIGH' ? 'border-zinc-300 text-zinc-300' : 'border-zinc-600 text-zinc-500'
                  }`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="p-4 text-sm text-zinc-300">{alert.type}</td>
                <td className="p-4 text-sm text-zinc-500">{new Date(alert.timestamp).toLocaleString()}</td>
                <td className="p-4 text-sm">
                  <span className={`text-xs uppercase tracking-wider ${
                    alert.status === 'INVESTIGATING' ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] animate-pulse' : 'text-zinc-600'
                  }`}>
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTab;
