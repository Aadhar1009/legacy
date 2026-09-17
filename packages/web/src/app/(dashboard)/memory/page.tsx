'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EvidenceCard } from '@/components/business/evidence-card';
import { ConfidenceBadge } from '@/components/business/confidence-badge';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default function Memory() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowResult(false);
    
    setTimeout(() => {
      setIsSearching(false);
      setShowResult(true);
    }, 1500);
  };

  const suggestions = [
    'What did we pay Sharma last time?',
    'Which warranties expire this month?',
    'Show me the lowest price for Samsung 55" TV'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4 md:mt-10">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Ask DukaanOS</h1>
        <p className="text-slate-500">Search through invoices, warranties, supplier terms and more.</p>
      </div>

      <form onSubmit={handleSearch} className="relative shadow-sm rounded-lg max-w-2xl mx-auto">
        <Input 
          className="pl-12 pr-12 h-14 text-lg bg-white border-slate-300 shadow-sm" 
          placeholder="Ask anything about your business..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
        <button type="submit" className="absolute right-2 top-2 p-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {!showResult && !isSearching && (
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          <span className="text-sm text-slate-500 mt-2 mr-2">Suggestions:</span>
          {suggestions.map(s => (
            <Button 
              key={s} 
              variant="outline" 
              size="sm" 
              className="rounded-full bg-white hover:bg-slate-50"
              onClick={() => {
                setQuery(s);
                setTimeout(() => handleSearch(), 100);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="mt-12 p-8 text-center bg-white border border-slate-200 rounded-lg shadow-sm animate-pulse max-w-3xl mx-auto">
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
          <p className="text-sm text-slate-400 mt-6">Searching your business memory...</p>
        </div>
      )}
      
      {showResult && (
        <div className="mt-12 p-6 md:p-8 bg-white border border-slate-200 rounded-lg shadow-sm max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-lg text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Answer
            </h3>
            <ConfidenceBadge level="HIGH" />
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg">
              The lowest price you have recorded for a Samsung 55" Smart TV is <strong>₹36,000</strong> from <strong className="text-primary cursor-pointer hover:underline">Sharma Electronics</strong> on Oct 12, 2023.
            </p>
          </div>
          
          <div className="mt-8">
            <h4 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supporting Evidence</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <EvidenceCard 
                source="Invoice #4992" 
                page="1" 
                excerpt="Samsung 55 inch Smart TV - Qty 10 @ ₹36,000 each" 
                date="2023-10-12" 
                confidence="HIGH" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
