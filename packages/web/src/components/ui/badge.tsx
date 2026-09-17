import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'status' | 'severity' | 'confidence' | 'outline';
  status?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export function Badge({ className, variant = 'default', status, ...props }: BadgeProps) {
  let statusClasses = 'bg-slate-100 text-slate-800';
  
  if (status === 'HIGH') statusClasses = 'bg-success/10 text-success';
  if (status === 'MEDIUM') statusClasses = 'bg-warning/10 text-warning';
  if (status === 'LOW') statusClasses = 'bg-error/10 text-error';
  if (status === 'UNKNOWN') statusClasses = 'bg-slate-100 text-slate-500';

  if (variant === 'outline') {
     statusClasses = 'border border-slate-300 bg-transparent text-slate-700';
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        statusClasses,
        className
      )}
      {...props}
    />
  );
}
