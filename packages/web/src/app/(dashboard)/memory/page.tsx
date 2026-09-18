'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EvidenceCard } from '@/components/business/evidence-card';
import { ConfidenceBadge } from '@/components/business/confidence-badge';
import { Search, Sparkles, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function Memory() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const q = presetQuery || query;
    if (!q.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setQuery(q);
    
    try {
      const response = await apiClient.queryMemory(q);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setResult({
        answer: "I encountered an error retrieving that information.",
        confidence: "LOW",
        claims: [],
        evidence_ids: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const suggestions = [
    'What did we pay Sharma last time?',
    'Which warranties expire this month?',
    'Show me the latest price for Samsung 55" TV'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4 md:mt-10">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Ask DukaanOS</h1>
        <p className="text-slate-500">Search through verified business memory, invoices, and temporal history.</p>
      </div>

      <form onSubmit={(e) => handleSearch(e)} className="relative shadow-sm rounded-lg max-w-2xl mx-auto">
        <Input 
          className="pl-12 pr-12 h-14 text-lg bg-white border-slate-300 shadow-sm" 
          placeholder="Ask anything about your business..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
        <button type="submit" disabled={isSearching} className="absolute right-2 top-2 p-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50">
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {!result && !isSearching && (
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          <span className="text-sm text-slate-500 mt-2 mr-2">Suggestions:</span>
          {suggestions.map(s => (
            <Button 
              key={s} 
              variant="outline" 
              size="sm" 
              className="rounded-full bg-white hover:bg-slate-50"
              onClick={() => handleSearch(undefined, s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="mt-12 p-8 text-center bg-white border border-slate-200 rounded-lg shadow-sm animate-pulse max-w-3xl mx-auto">
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto"></div>
          <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Verifying evidence ledger...
          </p>
        </div>
      )}
      
      {result && (
        <div className="mt-12 p-6 md:p-8 bg-white border border-slate-200 rounded-lg shadow-sm max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-lg text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Verified Answer
            </h3>
            <ConfidenceBadge level={result.confidence} />
          </div>
          
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-slate-800 text-lg leading-relaxed">{result.answer}</p>
          </div>

          {result.warnings && result.warnings.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <ul className="list-disc pl-5">
                {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {result.claims && result.claims.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h4 className="mb-4 text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-600" /> 
                Evidence Ledger
              </h4>
              <div className="space-y-4">
                {result.claims.map((claim: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{claim.type}</span>
                      <ConfidenceBadge level={claim.confidence} />
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{claim.statement}</p>
                    <div className="flex flex-wrap gap-2">
                      {claim.evidence_ids.map((id: string) => (
                        <div key={id} className="inline-flex items-center text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                          <FileText className="w-3 h-3 mr-1" /> {id}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
