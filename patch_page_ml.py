import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

widget = """
        {/* ML Engine Status Widget */}
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 flex-1 shadow-sm shrink-0 min-w-[200px]">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Ingestion Stream</div>
              <div className="text-sm font-semibold text-white">AIL / ZeroMQ</div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 flex-1 shadow-sm shrink-0 min-w-[200px]">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Semantic Search</div>
              <div className="text-sm font-semibold text-white">FAISS + BM25</div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 flex-1 shadow-sm shrink-0 min-w-[200px]">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Graph Engine</div>
              <div className="text-sm font-semibold text-white">PyTorch GNN</div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 flex-1 shadow-sm shrink-0 min-w-[200px]">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Explainability</div>
              <div className="text-sm font-semibold text-white">SHAP XGBoost</div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
"""

content = content.replace('{/* Breadcrumb */}', widget)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
