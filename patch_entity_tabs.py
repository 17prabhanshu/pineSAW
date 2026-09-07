import re

with open('src/app/entities/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace the fallback block
fallback_regex = r'\{\!\["OVERVIEW", "LEGAL", "ACTIONS"\]\.includes\(activeTab\) && \(\s*<div className="p-8 flex items-center justify-center h-64 text-zinc-400 text-sm font-mono flex-col gap-4">\s*<Folder size=\{48\} className="opacity-50" />\s*No records available for \{activeTab\} in this demo slice\.\s*<button onClick=\{\(\) => setActiveTab\("OVERVIEW"\)\} className="text-nexus-cyan hover:underline">Return to Overview</button>\s*</div>\s*\)\}'

new_tabs = """
        {activeTab === "RELATIONSHIPS" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4 px-2">
              <div>
                <h3 className="text-lg font-display font-semibold text-white">GNN Link Prediction & Property Graph</h3>
                <p className="text-xs font-mono text-zinc-400">Powered by PyTorch Geometric // Rendering 1st & 2nd degree connections</p>
              </div>
            </div>
            <div className="h-[600px] w-full relative bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <NetworkGraph />
            </div>
          </div>
        )}

        {activeTab === "ACTIVITY" && (
          <div className="mt-6 space-y-6">
            <div className="px-2">
              <h3 className="text-lg font-display font-semibold text-white">Temporal Clustering & Behavioral Drift</h3>
              <p className="text-xs font-mono text-zinc-400">HDBSCAN applied over Time-Series Activity (AIL Intercepts)</p>
            </div>
            <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] space-y-6">
              <div className="flex gap-4 items-start relative before:absolute before:left-3 before:top-8 before:bottom-0 before:w-px before:bg-white/10">
                <div className="w-6 h-6 rounded-full bg-red-900/50 border border-red-500/50 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono text-red-400 mb-1">CURRENT // VELOCITY BURST ANOMALY</div>
                  <div className="text-sm text-zinc-200">System detected a 400% increase in darknet chatter mentioning {entity?.label} within a 2-hour sliding window.</div>
                </div>
              </div>
              <div className="flex gap-4 items-start relative before:absolute before:left-3 before:top-8 before:bottom-0 before:w-px before:bg-white/10">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-zinc-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-zinc-400 mb-1">- 2 DAYS // IP GEO-DRIFT</div>
                  <div className="text-sm text-zinc-300">Tor exit node rotation detected. Primary cluster moved from RU to NL endpoints.</div>
                </div>
              </div>
              <div className="flex gap-4 items-start relative">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-zinc-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-zinc-400 mb-1">- 5 DAYS // CROSS-PLATFORM MIGRATION</div>
                  <div className="text-sm text-zinc-300">Account '{entity?.label}' first observed bridging operations from Telegram to GenesisMarket.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!["OVERVIEW", "LEGAL", "ACTIONS", "RELATIONSHIPS", "ACTIVITY"].includes(activeTab) && (
          <div className="p-8 flex items-center justify-center h-64 text-zinc-400 text-sm font-mono flex-col gap-4">
            <Folder size={48} className="opacity-50" />
            No records available for {activeTab} in this demo slice.
            <button onClick={() => setActiveTab("OVERVIEW")} className="text-nexus-cyan hover:underline">Return to Overview</button>
          </div>
        )}
"""

content = re.sub(fallback_regex, new_tabs, content)

with open('src/app/entities/[id]/page.tsx', 'w') as f:
    f.write(content)
