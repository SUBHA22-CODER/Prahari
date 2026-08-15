import React from 'react';
import { CloudRain, Waves, Mountain, History } from 'lucide-react';

export default function RiskContribution({ contributions }) {
  const defaultContribs = {
    rainfall: contributions?.rainfall ?? 32,
    river_trend: contributions?.river_trend ?? 21,
    slope_saturation: contributions?.slope_saturation ?? 14,
    historical_incidents: contributions?.historical_incidents ?? 15
  };

  const items = [
    { label: 'Rainfall', value: defaultContribs.rainfall, max: 40, icon: CloudRain, color: 'bg-blue-600' },
    { label: 'River Trend', value: defaultContribs.river_trend, max: 30, icon: Waves, color: 'bg-cyan-600' },
    { label: 'Slope Saturation', value: defaultContribs.slope_saturation, max: 20, icon: Mountain, color: 'bg-amber-600' },
    { label: 'Historical Incidents', value: defaultContribs.historical_incidents, max: 20, icon: History, color: 'bg-slate-600' }
  ];

  return (
    <div className="bg-white p-3.5 rounded-md border border-slate-200 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
          RISK CONTRIBUTIONS
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Backend Risk Fusion Engine</span>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const percentage = Math.min(100, Math.round((item.value / item.max) * 100));
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">{item.value}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
