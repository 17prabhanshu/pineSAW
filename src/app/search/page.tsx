"use client";

import { useState } from "react";
import { MagnifyingGlass, User, Folder, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{entities: any[], investigations: any[]}>({ entities: [], investigations: [] });
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setSearching(false);
  };

  return (
    <div className="flex h-full overflow-hidden flex-col">
      {/* Header */}
      <header className="px-8 py-6 glass border-b border-white/10 shrink-0">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1 text-white">Global Search</h1>
        <p className="text-zinc-300 font-mono text-[10px] uppercase tracking-widest">Cross-Network Entity & Investigation Query</p>
      </header>

      <div className="p-8 flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
        <form onSubmit={handleSearch} className="mb-6 relative shrink-0">
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, username, alias..."
            className="w-full glass border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-white placeholder:text-zinc-400 focus:outline-none focus:border-gov-blue focus:ring-1 focus:ring-gov-blue transition-all font-mono text-sm shadow-sm"
          />
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-gov">
            Search
          </button>
        </form>

        <div className="flex-1 overflow-auto">
          {searching && (
            <div className="flex items-center justify-center p-12 text-sm font-mono text-zinc-400 gap-2">
              <div className="w-4 h-4 border-2 border-gov-blue border-t-transparent rounded-2xl-full animate-spin"></div> QUERYING NETWORK...
            </div>
          )}
          
          {!searching && results.entities.length === 0 && results.investigations.length === 0 && query && (
            <div className="text-center font-mono text-zinc-400 text-xs mt-8 glass py-8 rounded-2xl border border-white/5">
              NO MATCHING RECORDS FOUND IN INDEX.
            </div>
          )}

          {!searching && (results.entities.length > 0 || results.investigations.length > 0) && (
            <div className="space-y-8">
              {results.entities.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold border-b border-white/10 pb-2">
                    Entities ({results.entities.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.entities.map(ent => (
                      <Link key={ent.id} href={`/entities/${ent.id}`} className="flex items-start gap-3 glass border border-white/5 rounded-2xl p-4 hover:bg-zinc-800/30 hover:border-white/10 transition-colors group">
                        <User className="text-zinc-400 group-hover:text-gov-blue mt-0.5 transition-colors" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white group-hover:text-gov-blue transition-colors mb-1">{ent.label}</div>
                          <div className="flex gap-2">
                            <span className="badge-neutral">{ent.type}</span>
                            <span className={ent.priorityScore >= 80 ? 'badge-critical' : 'badge-warning'}>
                              RISK {ent.priorityScore}
                            </span>
                          </div>
                        </div>
                        <CaretRight className="text-zinc-300 group-hover:text-gov-blue" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.investigations.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold border-b border-white/10 pb-2">
                    Investigations ({results.investigations.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.investigations.map(inv => (
                      <Link key={inv.id} href={`/investigations/${inv.id}`} className="flex items-start gap-3 glass border border-white/5 rounded-2xl p-4 hover:bg-zinc-800/30 hover:border-white/10 transition-colors group">
                        <Folder className="text-zinc-400 group-hover:text-gov-blue mt-0.5 transition-colors" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white group-hover:text-gov-blue transition-colors mb-1">{inv.title}</div>
                          <div className="text-[10px] font-mono text-gov-blue uppercase tracking-widest">{inv.caseId}</div>
                        </div>
                        <CaretRight className="text-zinc-300 group-hover:text-gov-blue" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
