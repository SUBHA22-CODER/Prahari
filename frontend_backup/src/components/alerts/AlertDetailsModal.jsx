import React from 'react';
import { X, ShieldAlert, Clock, Users, AlertCircle, FileCheck2 } from 'lucide-react';
import CAPAlertViewer from './CAPAlertViewer';
import { getRiskBadgeStyle } from '../../utils/riskBands';
import { formatTimestamp, formatDate, formatNumber } from '../../utils/formatting';

export default function AlertDetailsModal({ alert, onClose, onFocusOnMap }) {
  if (!alert) return null;

  const badgeStyle = getRiskBadgeStyle(alert.risk_score);

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${badgeStyle.bg} ${badgeStyle.border}`}>
          <div className="flex items-center space-x-3">
            <ShieldAlert className={`w-6 h-6 ${badgeStyle.text}`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-extrabold text-slate-500 uppercase">ALERT ID: {alert.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badgeStyle.badgeBg} ${badgeStyle.badgeText}`}>
                  {alert.severity}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                {alert.ward_name} — {alert.hazard_type}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">RISK SCORE</div>
              <div className={`text-xl font-mono font-extrabold ${badgeStyle.text} mt-0.5`}>
                {alert.risk_score}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">CONFIDENCE</div>
              <div className="text-xl font-mono font-extrabold text-blue-700 mt-0.5">
                {alert.confidence}%
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">AFFECTED POP.</div>
              <div className="text-xl font-mono font-extrabold text-slate-800 mt-0.5">
                {formatNumber(alert.affected_population)}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">ISSUED AT</div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1.5">
                {formatTimestamp(alert.issued_at)}
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-red-50 border border-red-200 p-3 rounded-md space-y-1">
            <div className="font-extrabold text-red-900 uppercase text-[11px]">
              MANDATED EMERGENCY ACTION
            </div>
            <p className="text-xs font-bold text-red-800">
              {alert.recommended_action}
            </p>
          </div>

          {/* CAP Viewer Section */}
          <CAPAlertViewer alert={alert} />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              onFocusOnMap && onFocusOnMap(alert);
              onClose();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded flex items-center space-x-1.5 transition-colors"
          >
            <span>Focus Map on Ward</span>
          </button>

          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
