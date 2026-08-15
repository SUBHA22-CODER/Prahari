import React from 'react';
import { Database, CheckCircle2, Clock, Server, RefreshCw } from 'lucide-react';

export default function DataSourceStatus({ dataSources = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span><span>LIVE</span></span>;
      case 'CACHED':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span><span>CACHED</span></span>;
      case 'STATIC':
        return <span className="bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span><span>STATIC</span></span>;
      case 'OFFLINE':
      default:
        return <span className="bg-red-100 text-red-800 border border-red-300 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-red-600"></span><span>OFFLINE</span></span>;
    }
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            TELEMETRY & GEOSPATIAL DATA SOURCES
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Live Synchronization Grid</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider">
              <th className="py-2.5 px-3">Data Provider</th>
              <th className="py-2.5 px-3">Data Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Last Sync</th>
              <th className="py-2.5 px-3">Fallback Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataSources.map((ds) => (
              <tr key={ds.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{ds.name}</div>
                  <div className="text-[10px] text-slate-400">{ds.provider}</div>
                </td>
                <td className="py-3 px-3 text-slate-700 font-medium">{ds.data_type}</td>
                <td className="py-3 px-3">{getStatusBadge(ds.status)}</td>
                <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{ds.last_updated}</td>
                <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">{ds.fallback_mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
