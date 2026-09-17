import * as React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export function ConfidenceBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' }) {
  const iconMap = {
    HIGH: <CheckCircle2 className="w-3 h-3 mr-1 text-success" />,
    MEDIUM: <AlertTriangle className="w-3 h-3 mr-1 text-warning" />,
    LOW: <AlertCircle className="w-3 h-3 mr-1 text-error" />,
    UNKNOWN: <HelpCircle className="w-3 h-3 mr-1 text-slate-500" />
  };

  return (
    <Badge status={level} className="flex items-center">
      {iconMap[level]}
      {level} Confidence
    </Badge>
  );
}
