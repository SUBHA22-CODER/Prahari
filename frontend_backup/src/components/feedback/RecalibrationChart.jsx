import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { SlidersHorizontal, Info } from 'lucide-react';

export default function RecalibrationChart() {
  const data = [
    { metric: 'Accuracy', Before: 78, After: 89 },
    { metric: 'Recall (Critical)', Before: 82, After: 94 },
    { metric: 'False Alarm Rate', Before: 24, After: 11 },
    { metric: 'F1 Score', Before: 80, After: 91 }
  ];

  return (
    <div className="bg-white p-4 rounded-md border border-slate-200 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b pb-2 border-slate-100">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
            BEFORE vs AFTER RECALIBRATION
          </h3>
        </div>
        <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
          DEMONSTRATION OF RECALIBRATION
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Before" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="After" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] text-slate-600">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <span>
          <strong>Demonstration of Recalibration:</strong> When officials log ground-truth feedback, risk weights are recalibrated to minimize false alarms while maximizing critical hazard recall.
        </span>
      </div>
    </div>
  );
}
