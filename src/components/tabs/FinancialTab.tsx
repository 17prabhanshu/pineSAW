import React from 'react';
import { ArrowDownRight, ArrowUpRight } from '@phosphor-icons/react';

export default function FinancialTab({ entity }: { entity: any }) {
  // Use mock data to ensure no empty states
  const transactions = [
    { id: "tx_8f739a1", date: "2023-10-12 14:22:01", amount: "4.5 BTC", from: "Unknown Wallet (0x3aF)", to: entity?.label || "Target Entity", type: "CRYPTO IN", status: "CONFIRMED" },
    { id: "tx_1b3c9a2", date: "2023-10-13 09:15:30", amount: "$150,000", from: entity?.label || "Target Entity", to: "Shell Corp Ltd.", type: "FIAT WIRE", status: "CLEARED" },
    { id: "tx_9c2a1f4", date: "2023-10-15 11:05:44", amount: "12.0 ETH", from: "Mixer Service", to: entity?.label || "Target Entity", type: "CRYPTO IN", status: "CONFIRMED" },
    { id: "tx_4d5e6f7", date: "2023-10-18 16:45:12", amount: "$85,000", from: entity?.label || "Target Entity", to: "Offshore Account (KY)", type: "FIAT WIRE", status: "PENDING" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans bg-black text-white min-h-full">
      <div className="mb-10 border-b border-white pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl tracking-tighter font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Financial Ledger & Flows</h2>
          <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest font-mono">Fiat & Cryptographic Transaction Analysis</p>
        </div>
        <div className="text-right font-mono text-xs text-gray-400">
          <p>Total Volume: $385,000+ (Est)</p>
          <p>Risk Score: CRITICAL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Flowchart Panel */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm uppercase tracking-widest border-b border-white/20 pb-2 mb-4 font-mono">Flow Topography</h3>
          <div className="flex flex-col items-center space-y-4 p-6 border border-white/20 bg-black">
            <div className="border border-white/40 p-4 text-center w-full shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-xs font-mono uppercase text-gray-400 block mb-1">Source Node</span>
              <span className="font-semibold tracking-wide text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Mixers / Unknown</span>
            </div>
            
            <div className="flex flex-col items-center text-white/50">
              <ArrowDownRight size={24} className="mb-1 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
              <span className="text-[10px] font-mono text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">CRYPTO INFLOW</span>
            </div>

            <div className="border border-white p-4 text-center w-full shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/5">
              <span className="text-xs font-mono uppercase text-gray-300 block mb-1">Target Entity</span>
              <span className="font-semibold tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">{entity?.label || "Unknown"}</span>
            </div>

            <div className="flex flex-col items-center text-white/50">
              <ArrowDownRight size={24} className="mb-1 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
              <span className="text-[10px] font-mono text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">FIAT OUTFLOW</span>
            </div>

            <div className="border border-white/40 p-4 text-center w-full shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-xs font-mono uppercase text-gray-400 block mb-1">Destination Nodes</span>
              <span className="font-semibold tracking-wide text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Shell Corps / Offshore</span>
            </div>
          </div>

          <div className="p-4 border border-white/20 bg-black">
            <h4 className="text-xs uppercase font-mono tracking-widest text-white mb-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">AI Analysis</h4>
            <p className="text-xs leading-relaxed text-gray-300">
              Transaction topography indicates rapid layering. Crypto assets are received and almost immediately liquidated or wired to secondary fiat institutions, a pattern highly indicative of obfuscation.
            </p>
          </div>
        </div>

        {/* Ledger Panel */}
        <div className="lg:col-span-2">
          <h3 className="text-sm uppercase tracking-widest border-b border-white/20 pb-2 mb-4 font-mono">Transaction Ledger</h3>
          
          <div className="border border-white/20 bg-black overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/20">
                <tr className="font-mono text-[10px] uppercase text-gray-400">
                  <th className="p-4 font-normal">Date / ID</th>
                  <th className="p-4 font-normal">Direction</th>
                  <th className="p-4 font-normal">Counterparty</th>
                  <th className="p-4 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono text-xs">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all">{tx.date}</div>
                      <div className="text-gray-500 mt-1">{tx.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type.includes("IN") ? <ArrowDownRight className="text-white" /> : <ArrowUpRight className="text-white" />}
                        <span className="tracking-widest text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]">{tx.type}</span>
                      </div>
                      <div className="text-gray-500 mt-1">{tx.status}</div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div>{tx.type.includes("IN") ? `From: ${tx.from}` : `To: ${tx.to}`}</div>
                    </td>
                    <td className="p-4 text-right font-medium text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all">
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
