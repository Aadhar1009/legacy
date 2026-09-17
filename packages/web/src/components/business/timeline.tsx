import * as React from 'react';

export function Timeline({ events }: { events: any[] }) {
  return (
    <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4 mt-2">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6">
          <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
          <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
          <time className="block mb-2 text-xs font-normal leading-none text-slate-400">{event.date}</time>
          <p className="text-sm font-normal text-slate-500">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
