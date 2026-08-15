import React from 'react';
import { Info } from 'lucide-react';

export default function ConfidenceScore({ confidence = 84 }) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
          DATA CONFIDENCE SCORE
        </span>
        <span className="font-mono font-extrabold text-blue-700 text-sm">
          {confidence}%
        </span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${confidence}%` }}
        />
      </div>

      <div className="flex items-start space-x-1.5 pt-1 text-[10px] text-slate-500">
        <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
        <span>Confidence reflects data availability and freshness across rainfall gauges & CWC sensors.</span>
      </div>
    </div>
  );
}
