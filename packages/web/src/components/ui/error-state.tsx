import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

export function ErrorState({ title, description, onRetry }: { title: string, description: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-white shadow-sm h-64">
      <AlertCircle className="mb-4 h-10 w-10 text-error" />
      <h3 className="mb-1 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
