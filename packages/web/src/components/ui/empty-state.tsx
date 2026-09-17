import * as React from 'react';
import { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon: ReactNode, title: string, description: string, action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-white shadow-sm h-64">
      <div className="mb-4 text-slate-400">{icon}</div>
      <h3 className="mb-1 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
