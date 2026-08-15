import React from 'react';
import { getRiskBadgeStyle, getRiskBand } from '../../utils/riskBands';

export default function RiskScore({ score = 0, band }) {
  const currentBand = band || getRiskBand(score);
  const badgeStyle = getRiskBadgeStyle(score);

  return (
    <div className={`p-3.5 rounded-md border flex items-center justify-between ${badgeStyle.bg} ${badgeStyle.border}`}>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          IMPACT RISK SCORE
        </div>
        <div className="flex items-baseline space-x-2 mt-0.5">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${badgeStyle.text}`}>
            {score}
          </span>
          <span className="text-xs text-slate-500 font-bold">/ 100</span>
        </div>
      </div>

      <div className="text-right">
        <span className={`inline-block px-3 py-1 rounded text-xs font-black tracking-wider uppercase ${badgeStyle.badgeBg} ${badgeStyle.badgeText} shadow-xs`}>
          {currentBand}
        </span>
        <div className="text-[10px] font-medium text-slate-500 mt-1">
          {score >= 70 ? 'Immediate Action Required' : score >= 40 ? 'Heightened Preparedness' : 'Routine Surveillance'}
        </div>
      </div>
    </div>
  );
}
