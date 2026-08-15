import React from 'react';
import { Clock, ShieldCheck, Target, Calendar } from 'lucide-react';

export default function BacktestSummary({ eventData }) {
  if (!eventData) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
          <span>CRITICAL CROSSED</span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className={`text-xl font-mono font-extrabold mt-1 ${eventData.critical_crossed ? 'text-emerald-700' : 'text-slate-500'}`}>
          {eventData.critical_crossed ? 'YES' : 'NO'}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Threshold &ge; {eventData.critical_threshold}</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
          <span>EARLY LEAD TIME</span>
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-mono font-extrabold text-blue-900 mt-1">
          {eventData.critical_crossed ? `${eventData.lead_time_hours} Hours` : 'N/A'}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Prior to event confirmation</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
          <span>CRITICAL THRESHOLD</span>
          <Target className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-xl font-mono font-extrabold text-red-700 mt-1">
          {eventData.critical_threshold} / 100
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Evacuation mandate trigger</div>
      </div>

      <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
          <span>HISTORICAL EVENT</span>
          <Calendar className="w-4 h-4 text-slate-600" />
        </div>
        <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
          {eventData.district}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Hourly resolution model</div>
      </div>
    </div>
  );
}
