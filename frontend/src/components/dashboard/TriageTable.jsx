import React, { useState } from 'react';
import { Search, Filter, AlertOctagon, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { getRiskBadgeStyle } from '../../utils/riskBands';
import { formatNumber } from '../../utils/formatting';

export default function TriageTable({ wards = [], onSelectWard }) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort descending by risk score
  const sortedWards = [...wards].sort((a, b) => b.risk_score - a.risk_score);

  const filteredWards = sortedWards.filter(w => {
    const matchesFilter = filter === 'ALL' || w.risk_band === filter;
    const matchesSearch = w.ward_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.ward_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              OFFICIAL RESPONSE TRIAGE — ACTION PRIORITY
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Prioritized ward-level decision matrix. Where should authorities act first?
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              placeholder="Search ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            {['ALL', 'CRITICAL', 'ALERT', 'MONITOR'].map((band) => (
              <button
                key={band}
                onClick={() => setFilter(band)}
                className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide transition-colors ${
                  filter === band 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider">
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Ward Name</th>
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Population</th>
              <th className="py-2.5 px-3">Recommended Action</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredWards.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400">
                  No wards matching criteria.
                </td>
              </tr>
            ) : (
              filteredWards.map((w, idx) => {
                const badgeStyle = getRiskBadgeStyle(w.risk_score);
                return (
                  <tr 
                    key={w.ward_id}
                    onClick={() => onSelectWard && onSelectWard(w)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {/* Priority rank */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      #{idx + 1}
                    </td>

                    {/* Ward Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{w.ward_name}</div>
                      <div className="text-[10px] text-slate-400">{w.district}</div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black font-mono ${badgeStyle.badgeBg} ${badgeStyle.badgeText}`}>
                        {w.risk_score}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                      {w.confidence}%
                    </td>

                    {/* Population */}
                    <td className="py-2.5 px-3 font-mono text-slate-800">
                      {formatNumber(w.exposure?.population)}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {w.recommended_action}
                    </td>

                    {/* View Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWard && onSelectWard(w);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold px-2 py-1 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
