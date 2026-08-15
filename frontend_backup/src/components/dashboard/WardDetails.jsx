import React from 'react';
import RiskScore from './RiskScore';
import RiskContribution from './RiskContribution';
import ConfidenceScore from './ConfidenceScore';
import ActionRecommendation from './ActionRecommendation';
import { Users, GraduationCap, Building2, ExternalLink, Shield } from 'lucide-react';
import { formatNumber } from '../../utils/formatting';

export default function WardDetails({ ward, onViewAlert }) {
  if (!ward) {
    return (
      <div className="bg-white rounded-md border border-slate-200 p-6 text-center text-slate-500 h-full flex flex-col justify-center items-center space-y-3">
        <Shield className="w-10 h-10 text-slate-300 stroke-1" />
        <div className="font-semibold text-slate-700 text-sm">No Ward Selected</div>
        <p className="text-xs text-slate-500 max-w-xs">
          Select a ward polygon on the map or click an alert from the feed to view detailed risk intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-4 shadow-sm overflow-y-auto max-h-[520px]">
      {/* Ward Title & Header */}
      <div className="border-b border-slate-200 pb-2.5 flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SELECTED WARD RISK INTELLIGENCE
          </div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
            {ward.ward_name}
          </h2>
          <div className="text-xs text-slate-500 font-medium">
            District: <span className="font-semibold text-slate-700">{ward.district}</span> (ID: {ward.ward_id})
          </div>
        </div>
      </div>

      {/* 1. Risk Score Gauge */}
      <RiskScore score={ward.risk_score} band={ward.risk_band} />

      {/* 2. Confidence Indicator */}
      <ConfidenceScore confidence={ward.confidence} />

      {/* 3. Risk Contributions Breakdown */}
      <RiskContribution contributions={ward.contributions} />

      {/* 4. Hyperlocal Exposure Information */}
      <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
          HYPERLOCAL EXPOSURE DATA
        </div>
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white p-2 rounded border border-slate-200">
            <Users className="w-4 h-4 text-slate-500 mx-auto" />
            <div className="text-xs font-mono font-bold text-slate-800 mt-1">
              {formatNumber(ward.exposure?.population)}
            </div>
            <div className="text-[9px] text-slate-500 font-medium">Population</div>
          </div>

          <div className="bg-white p-2 rounded border border-slate-200">
            <GraduationCap className="w-4 h-4 text-blue-600 mx-auto" />
            <div className="text-xs font-mono font-bold text-blue-900 mt-1">
              {ward.exposure?.schools ?? 0}
            </div>
            <div className="text-[9px] text-slate-500 font-medium">Schools</div>
          </div>

          <div className="bg-white p-2 rounded border border-slate-200">
            <Building2 className="w-4 h-4 text-red-600 mx-auto" />
            <div className="text-xs font-mono font-bold text-red-900 mt-1">
              {ward.exposure?.hospitals ?? 0}
            </div>
            <div className="text-[9px] text-slate-500 font-medium">Hospitals</div>
          </div>
        </div>
      </div>

      {/* 5. Recommended Action */}
      <ActionRecommendation 
        primaryAction={ward.recommended_action} 
        supportingActions={ward.supporting_actions}
        riskScore={ward.risk_score}
      />

      {/* Primary Action Button */}
      <button
        onClick={() => onViewAlert && onViewAlert(ward)}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-md text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-colors shadow-xs"
      >
        <span>VIEW ALERT CAP PAYLOAD</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
