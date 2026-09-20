import * as React from 'react';
import { LoreEntity } from '@/lib/mock-lore-engine';
import { User, Building, FileText, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KnowledgeGraphNode({ entity }: { entity: LoreEntity }) {
  const isRisk = entity.isConcentratedRisk;

  const getIcon = () => {
    switch (entity.type) {
      case 'PERSON': return <User className="w-5 h-5" />;
      case 'COMPANY': return <Building className="w-5 h-5" />;
      case 'POLICY': return <ShieldAlert className="w-5 h-5" />;
      case 'DOCUMENT': return <FileText className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn(
      "relative flex items-center p-4 rounded-xl border transition-all duration-300",
      "glass-panel group hover:-translate-y-1 hover:shadow-xl",
      isRisk ? "border-error/50 bg-error/5" : "border-white/10 hover:border-white/30"
    )}>
      {isRisk && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-error"></span>
        </span>
      )}
      
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full mr-4",
        isRisk ? "bg-error/20 text-error" : "bg-white/10 text-muted-foreground group-hover:text-white"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-semibold tracking-tight",
          isRisk ? "text-error" : "text-foreground"
        )}>
          {entity.name}
        </span>
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
          {entity.relation || entity.type}
        </span>
      </div>
    </div>
  );
}
