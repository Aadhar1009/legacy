import * as React from 'react';
import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Ultra-minimalist header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-xl border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
          <span className="text-sm font-mono tracking-widest text-muted-foreground group-hover:text-white transition-colors uppercase">Back to Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-white" />
          <span className="font-bold tracking-tight text-white">DukaanOS</span>
        </div>
        <div className="w-[100px]" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
