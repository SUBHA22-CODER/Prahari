import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Bell, ShieldAlert } from 'lucide-react';
import { getRiskBadgeStyle } from '../../utils/riskBands';
import { formatTimestamp } from '../../utils/formatting';

export default function AlertFeed({ alerts = [], onSelectAlert }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            ACTIVE ALERTS FEED ({alerts.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Dissemination Ready</span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs">
          No critical or active alerts at the moment.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const badgeStyle = getRiskBadgeStyle(alert.risk_score);
            return (
              <div 
                key={alert.id}
                className={`p-3 rounded-md border ${badgeStyle.bg} ${badgeStyle.border} transition-all hover:shadow-xs`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${badgeStyle.badgeBg} ${badgeStyle.badgeText}`}>
                      {alert.severity}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{alert.ward_name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-slate-800">
                      Score: {alert.risk_score}
                    </span>
                    <div className="flex items-center text-[10px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {formatTimestamp(alert.issued_at)}
                    </div>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <div className="text-xs text-slate-700 font-medium line-clamp-1">
                    <span className="font-bold text-slate-900">{alert.hazard_type}:</span> {alert.recommended_action}
                  </div>

                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="ml-3 shrink-0 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1 transition-colors"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
