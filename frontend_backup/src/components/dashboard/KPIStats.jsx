import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, BellRing } from 'lucide-react';

export default function KPIStats({ summary }) {
  const stats = [
    {
      id: 'critical',
      label: 'CRITICAL WARDS',
      count: summary?.critical_wards ?? 3,
      description: 'Impact score >= 70 (Evacuation)',
      icon: AlertCircle,
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      indicatorBg: 'bg-red-600'
    },
    {
      id: 'alert',
      label: 'ALERT WARDS',
      count: summary?.alert_wards ?? 3,
      description: 'Impact score 40–70 (Preparedness)',
      icon: AlertTriangle,
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      indicatorBg: 'bg-amber-600'
    },
    {
      id: 'monitor',
      label: 'MONITOR WARDS',
      count: summary?.monitor_wards ?? 2,
      description: 'Impact score < 40 (Routine)',
      icon: ShieldCheck,
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      indicatorBg: 'bg-emerald-600'
    },
    {
      id: 'active_alerts',
      label: 'ACTIVE ALERTS',
      count: summary?.active_alerts ?? 5,
      description: 'Dissemination-ready CAP alerts',
      icon: BellRing,
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      indicatorBg: 'bg-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.id}
            className={`
              relative p-3.5 rounded-md border shadow-xs transition-all ${stat.bgColor} ${stat.borderColor}
            `}
          >
            {/* Top Indicator Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-md ${stat.indicatorBg}`} />
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
                {stat.label}
              </span>
              <Icon className={`w-4 h-4 ${stat.textColor}`} />
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${stat.textColor}`}>
                {stat.count}
              </span>
              <span className="text-[10px] text-slate-500 font-medium ml-2 text-right">
                {stat.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
