import * as React from 'react';
import { Loader2 } from 'lucide-react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} {...props} />;
}

export function FullPageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function InlineLoading() {
  return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
}
