'use client';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeepOnboarding() {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const questions = [
    { id: 'q1', text: "What's the hardest operational rule your staff always gets wrong?", category: "Operations" },
    { id: 'q2', text: "Do you have any undocumented return exceptions for specific loyal customers?", category: "Returns" },
    { id: 'q3', text: "Which supplier causes the most logistics headaches, and how do you usually resolve it?", category: "Logistics" }
  ];

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        businessName,
        ownerName,
        knowledge: Object.entries(answers).map(([qId, ans]) => ({
          question: questions.find(q => q.id === qId)?.text || qId,
          answer: ans,
          category: questions.find(q => q.id === qId)?.category || 'General',
          source: 'Owner Onboarding'
        }))
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Failed to save to real database');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save real data to SQLite database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-md w-full animate-fade-in text-center space-y-6">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-200">
            <CheckCircle2 className="w-8 h-8 text-zinc-900" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900">Knowledge Base Seeded</h1>
          <p className="text-zinc-500 leading-relaxed text-sm">
            Your foundational knowledge has been written to the real SQLite database. DukaanOS is now aware of your business context.
          </p>
          
          <div className="pt-8 border-t border-zinc-100 mt-8 space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest text-left">Real-Time Phone Integrations</h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900">WhatsApp Webhook Active</p>
                <p className="text-xs text-zinc-500">Listening at /api/whatsapp/webhook</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900">Call Log Sync Ready</p>
                <p className="text-xs text-zinc-500">Awaiting OAuth Companion App Sync</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col font-sans">
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-24 flex flex-col justify-center">
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-12">
          {[0, 1, ...questions.map((_, i) => i + 2)].map((i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500", i <= step ? "bg-zinc-900" : "bg-zinc-200")} />
          ))}
        </div>

        {step === 0 && (
          <div className="animate-slide-up space-y-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900">Let's build your persistent memory.</h1>
            <p className="text-zinc-500 text-lg leading-relaxed">Most ERPs ask for your GST number. We ask for the unwritten rules of your business that only you know.</p>
            <div className="space-y-4 pt-4">
              <input type="text" placeholder="Your Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all shadow-sm" />
              <input type="text" placeholder="Your Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all shadow-sm" />
            </div>
            <button onClick={handleNext} disabled={!businessName || !ownerName} className="mt-8 flex items-center justify-between w-full bg-zinc-900 text-white rounded-xl px-6 py-4 hover:bg-zinc-800 transition-all disabled:opacity-50 font-medium">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slide-up space-y-8">
            <h1 className="text-3xl font-medium tracking-tight text-zinc-900">We're going to ask a few deep operational questions.</h1>
            <p className="text-zinc-500 text-lg leading-relaxed">This data won't just sit in a dashboard. It goes straight into the temporal knowledge graph, serving as the foundational context for the AI agents.</p>
            <button onClick={handleNext} className="mt-8 flex items-center justify-between w-full bg-zinc-900 text-white rounded-xl px-6 py-4 hover:bg-zinc-800 transition-all font-medium">
              Start <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step >= 2 && step < questions.length + 2 && (
          <div className="animate-slide-up space-y-8" key={step}>
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">{questions[step - 2]?.category} Context</span>
            <h1 className="text-3xl font-medium tracking-tight text-zinc-900 leading-snug">{questions[step - 2]?.text}</h1>
            <textarea 
              autoFocus
              placeholder="Type your answer here..." 
              value={answers[questions[step - 2]?.id] || ''} 
              onChange={e => setAnswers({...answers, [questions[step - 2]?.id]: e.target.value})} 
              className="w-full bg-white border border-zinc-200 rounded-2xl p-6 min-h-[160px] text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all shadow-sm resize-none text-lg leading-relaxed" 
            />
            <button 
              onClick={step === questions.length + 1 ? handleSubmit : handleNext} 
              disabled={!(answers[questions[step - 2]?.id]?.length > 5) || isSubmitting} 
              className="mt-8 flex items-center justify-between w-full bg-zinc-900 text-white rounded-xl px-6 py-4 hover:bg-zinc-800 transition-all disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Saving to SQLite...' : step === questions.length + 1 ? 'Save Knowledge Base' : 'Next Question'} 
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
