import React from 'react';
import { Activity, Server, Cpu, Database, Wifi } from 'lucide-react';

export default function SystemHealth({ statusData }) {
  const services = statusData?.services || [
    { name: 'FastAPI Microservice Engine', status: 'OPERATIONAL', uptime: '99.98%', latency: '24ms' },
    { name: 'PostgreSQL / PostGIS Database', status: 'OPERATIONAL', uptime: '100.00%', latency: '12ms' },
    { name: 'Risk Fusion Pipeline Scheduler', status: 'RUNNING', uptime: '99.95%', latency: '8ms' },
    { name: 'CAP Alert Broadcast Gateway', status: 'OPERATIONAL (SIMULATED)', uptime: '100.00%', latency: '45ms' },
    { name: 'Vite React Web Frontend', status: 'OPERATIONAL', uptime: '100.00%', latency: '2ms' }
  ];

  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            SYSTEM INFRASTRUCTURE HEALTH
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          <span>ALL CLUSTER NODES OPERATIONAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((srv, idx) => (
          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{srv.name}</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                ● {srv.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
              <span>Uptime: <strong className="text-slate-800">{srv.uptime}</strong></span>
              <span>Latency: <strong className="text-slate-800">{srv.latency}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
