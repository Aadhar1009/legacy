import * as React from 'react';
import { FileText } from 'lucide-react';

export function SourceCitation({ documentName, onClick }: { documentName: string, onClick?: () => void }) {
  return (
    <span 
      onClick={onClick}
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors mx-1"
    >
      <FileText className="w-3 h-3 mr-1" />
      {documentName}
    </span>
  );
}
