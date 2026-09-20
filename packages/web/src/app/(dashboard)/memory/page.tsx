'use client';

import * as React from 'react';
import { useState } from 'react';
import { Search, CornerDownLeft, ShieldAlert, FileText, Loader2, Link2, Clock, CheckCircle2 } from 'lucide-react';
import { queryLoreEngine, LoreResponse } from '@/lib/mock-lore-engine';
import { cn } from '@/lib/utils';

export default function MemoryEngine() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<LoreResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent, presetQuery?: string) => {
    e?.preventDefault();
    const q = presetQuery || query;
    if (!q.trim()) return;

    if (presetQuery) setQuery(presetQuery);
    setIsSearching(true);
    setHasSearched(true);
    
    const res = await queryLoreEngine(q);
    setResponse(res);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans selection:bg-zinc-200">
      
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-zinc-950 rounded-md" />
          <span className="font-semibold tracking-tight text-sm">DukaanOS</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs font-mono">v2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Memory Connected
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-24 pb-32 flex flex-col">
        
        {/* Clean, Linear-style Header */}
        <div className={cn("transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", hasSearched ? "mb-8 opacity-0 h-0 overflow-hidden" : "mb-16 opacity-100 h-auto")}>
          <h1 className="font-medium tracking-tight text-4xl md:text-5xl text-zinc-900 mb-4">
            Search your business memory
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl font-normal leading-relaxed">
            Query across WhatsApp chats, call logs, supplier invoices, and your custom onboarding knowledge base.
          </p>
        </div>

        {/* The Search Bar (Command Palette Style) */}
        <form onSubmit={handleSearch} className={cn("relative w-full transition-all duration-700 z-20", hasSearched ? "mb-12" : "")}>
          <div className="relative flex items-center bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow overflow-hidden group focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400">
            <Search className="w-5 h-5 text-zinc-400 ml-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-5 text-lg text-zinc-900 placeholder:text-zinc-400 font-medium"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-5 text-zinc-400 hover:text-zinc-900 transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded text-xs font-medium text-zinc-500 border border-zinc-200">
                  <CornerDownLeft className="w-3 h-3" /> Return
                </div>
              )}
            </button>
          </div>

          {!hasSearched && (
            <div className="mt-8 flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Suggestions</span>
              <button type="button" onClick={() => handleSearch(undefined, "Who knows how we handle returns from Gupta Traders?")} className="text-left text-sm text-zinc-600 hover:text-zinc-900 py-2 transition-colors flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-300" /> "Who knows how we handle returns from Gupta Traders?"
              </button>
              <button type="button" onClick={() => handleSearch(undefined, "What is our policy on delayed logistics?")} className="text-left text-sm text-zinc-600 hover:text-zinc-900 py-2 transition-colors flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-300" /> "What is our policy on delayed logistics?"
              </button>
            </div>
          )}
        </form>

        {isSearching && hasSearched && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 animate-fade-in">
            <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mb-4" />
            <p className="text-sm font-medium text-zinc-500">Querying Knowledge Base & WhatsApp Logs...</p>
          </div>
        )}

        {/* Results Area */}
        {!isSearching && response && (
          <div className="flex-1 animate-slide-up space-y-12 pb-20 w-full">
            
            {/* Answer Block */}
            <div className="prose prose-zinc max-w-none">
              <p className="text-xl leading-relaxed text-zinc-800 font-normal">
                {response.answer}
              </p>
            </div>

            {/* Critical Alert */}
            {response.busFactorAlert && (
              <div className="p-5 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-4">
                <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-red-900 font-medium text-sm mb-1">Operational Concentration Risk</h3>
                  <p className="text-red-700 text-sm leading-relaxed">{response.busFactorAlert.message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
              {/* Evidence Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Link2 className="w-4 h-4" /> <span>Source Evidence</span>
                </div>
                <div className="space-y-4">
                  {response.sources.map(source => (
                    <div key={source.id} className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-900">{source.documentName}</span>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">{source.date}</span>
                      </div>
                      <p className="text-sm text-zinc-600 italic border-l-2 border-zinc-200 pl-3 leading-relaxed">
                        "{source.excerpt}"
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md text-[10px] font-mono tracking-widest bg-zinc-100 text-zinc-500 uppercase">
                          {source.type}
                        </span>
                        {source.confidence === 'HIGH' && (
                          <span className="flex items-center gap-1 text-[10px] font-mono tracking-widest text-emerald-600 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topology / Entities */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Clock className="w-4 h-4" /> <span>Related Entities</span>
                </div>
                <div className="grid gap-3">
                  {response.entities.map((entity) => (
                    <div key={entity.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{entity.name}</p>
                        <p className="text-xs text-zinc-500">{entity.relation}</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-white border border-zinc-200 text-[10px] font-mono tracking-widest text-zinc-500 uppercase shadow-sm">
                        {entity.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
