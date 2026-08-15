import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getRiskBadgeStyle } from '../../utils/riskBands';

export default function ActionRecommendation({ 
  primaryAction = 'EVACUATE LOW-LYING HOUSEHOLDS', 
  supportingActions = [],
  riskScore = 80
}) {
  const badgeStyle = getRiskBadgeStyle(riskScore);

  return (
    <div className={`p-3.5 rounded-md border ${badgeStyle.bg} ${badgeStyle.border} space-y-2.5`}>
      <div className="flex items-center space-x-2 border-b pb-1.5 border-slate-200/80">
        <ShieldAlert className={`w-4 h-4 ${badgeStyle.text}`} />
        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${badgeStyle.text}`}>
          RECOMMENDED OFFICIAL ACTION
        </span>
      </div>

      <div className="bg-white/80 p-2.5 rounded border border-slate-200">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Primary Mandate</div>
        <div className={`text-sm font-black tracking-tight ${badgeStyle.text} uppercase mt-0.5`}>
          {primaryAction}
        </div>
      </div>

      {supportingActions && supportingActions.length > 0 && (
        <div className="space-y-1 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Supporting Tactical Protocols:</div>
          <ul className="space-y-1 pl-1">
            {supportingActions.map((action, idx) => (
              <li key={idx} className="flex items-start space-x-1.5 text-slate-700 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
