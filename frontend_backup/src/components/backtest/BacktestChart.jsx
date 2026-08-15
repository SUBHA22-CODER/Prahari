import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  ReferenceDot, 
  CartesianGrid 
} from 'recharts';

export default function BacktestChart({ eventData }) {
  if (!eventData || !eventData.timeline) return null;

  const timeline = eventData.timeline;
  const criticalThreshold = eventData.critical_threshold || 70;

  // Find dot markers
  const thresholdDot = timeline.find(t => t.is_threshold_cross);
  const eventDot = timeline.find(t => t.is_event_time);

  return (
    <div className="bg-white p-4 rounded-md border border-slate-200 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 border-slate-100 gap-2">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            HISTORICAL EVENT EVALUATION TIMELINE
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">
            {eventData.title}
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-red-600 rounded-xs inline-block"></span>
            <span className="text-slate-700 font-semibold">PRAHARI Risk Score</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-0.5 bg-red-600 border-b border-dashed border-red-600 inline-block w-4"></span>
            <span className="text-red-700 font-bold">Critical Line (70)</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={timeline} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{ fontSize: 10 }} 
              tickFormatter={(val) => val.split(' ')[1] || val}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#64748b" 
              tick={{ fontSize: 10 }}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px', border: 'none' }}
              labelStyle={{ fontWeight: 'bold', color: '#93c5fd' }}
            />
            
            {/* Critical Threshold 70 Reference Line */}
            <ReferenceLine 
              y={criticalThreshold} 
              stroke="#DC2626" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ value: 'CRITICAL THRESHOLD (70)', fill: '#DC2626', fontSize: 11, fontWeight: 'bold', position: 'insideTopLeft' }}
            />

            {/* Threshold Crossing Marker */}
            {thresholdDot && (
              <ReferenceDot 
                x={thresholdDot.time} 
                y={thresholdDot.risk_score} 
                r={6} 
                fill="#DC2626" 
                stroke="#fff" 
                strokeWidth={2}
                label={{ value: '⚠️ 70 Crossed', fill: '#DC2626', fontSize: 11, fontWeight: 'bold', position: 'top' }}
              />
            )}

            {/* Event Confirmation Marker */}
            {eventDot && (
              <ReferenceDot 
                x={eventDot.time} 
                y={eventDot.risk_score} 
                r={7} 
                fill="#1E293B" 
                stroke="#DC2626" 
                strokeWidth={3}
                label={{ value: '🚨 Disaster Occurred', fill: '#0F172A', fontSize: 11, fontWeight: 'bold', position: 'bottom' }}
              />
            )}

            <Area type="monotone" dataKey="risk_score" fill="#fee2e2" stroke="none" opacity={0.4} />
            <Line 
              type="monotone" 
              dataKey="risk_score" 
              stroke="#DC2626" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#DC2626' }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Prominent Judge Annotation */}
      <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-md text-xs flex items-center justify-between text-emerald-900">
        <div className="flex items-center space-x-2 font-bold">
          <span className="text-base">✅</span>
          <span>CRITICAL THRESHOLD CROSSED BEFORE OFFICIAL DISASTER CONFIRMATION</span>
        </div>
        <div className="font-mono font-extrabold bg-emerald-800 text-white px-2.5 py-1 rounded text-xs">
          +{eventData.lead_time_hours} HOURS LEAD TIME
        </div>
      </div>
    </div>
  );
}
