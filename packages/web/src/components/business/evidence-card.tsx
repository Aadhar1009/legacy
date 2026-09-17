import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

export function EvidenceCard({ source, page, excerpt, date, confidence }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-sm font-medium text-primary">
            <FileText className="w-4 h-4 mr-1" /> {source} (Page {page})
          </div>
          <Badge status={confidence}>{confidence}</Badge>
        </div>
        <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-3 mb-2">"{excerpt}"</p>
        <div className="text-xs text-slate-500 text-right">{formatDate(date)}</div>
      </CardContent>
    </Card>
  );
}
