import React, { useState, useEffect } from 'react';
import BacktestChart from '../components/backtest/BacktestChart';
import BacktestSummary from '../components/backtest/BacktestSummary';
import { api } from '../services/api';
import { History, Calendar } from 'lucide-react';

export default function BacktestPage({ selectedDistrict = 'wayanad' }) {
  const [selectedEventId, setSelectedEventId] = useState('wayanad-2024');
  const [backtestData, setBacktestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-select event matching selected district
    if (selectedDistrict === 'cachar') setSelectedEventId('cachar-2022');
    else if (selectedDistrict === 'kamrup') setSelectedEventId('kamrup-2022');
    else if (selectedDistrict === 'shimla') setSelectedEventId('shimla-2023');
    else if (selectedDistrict === 'idukki') setSelectedEventId('idukki-2020');
    else if (selectedDistrict === 'dibrugarh') setSelectedEventId('dibrugarh-2020');
    else if (selectedDistrict === 'pathanamthitta') setSelectedEventId('pathanamthitta-2018');
    else if (selectedDistrict === 'wayanad') setSelectedEventId('wayanad-2024');
  }, [selectedDistrict]);

  useEffect(() => {
    async function loadBacktest() {
      setLoading(true);
      const data = await api.getBacktest(selectedEventId);
      setBacktestData(data);
      setLoading(false);
    }
    loadBacktest();
  }, [selectedEventId]);

  if (loading) return <div className="h-96 bg-slate-200 animate-pulse rounded-md"></div>;

  const eventsList = backtestData?.events_list || [];
  const activeEvent = backtestData?.active_event;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              HISTORICAL BACKTEST EVALUATION
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate whether PRAHARI-AI risk fusion engine would have identified elevated risk before a known historical disaster event.
          </p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-xs font-bold text-slate-800 bg-slate-50 focus:ring-1 focus:ring-blue-500"
          >
            {eventsList.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backtest KPI Summary */}
      <BacktestSummary eventData={activeEvent} />

      {/* Main Backtest Timeline Chart */}
      <BacktestChart eventData={activeEvent} />
    </div>
  );
}
