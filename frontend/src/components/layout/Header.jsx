import React, { useState, useEffect } from 'react';
import { Shield, Bell, CheckCircle2, ChevronDown, UserCheck, CloudRain } from 'lucide-react';
import { PILOT_DISTRICTS } from '../../services/mockData';
import { api } from '../../services/api';

export default function Header({ selectedDistrict, onDistrictChange, lastUpdated }) {
  const currentDistrict = PILOT_DISTRICTS.find(d => d.id === selectedDistrict) || PILOT_DISTRICTS[0];
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await api.getWeather(selectedDistrict);
        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000);
    return () => clearInterval(interval);
  }, [selectedDistrict]);

  return (
    <header className="sticky top-0 z-50 shrink-0 bg-slate-900 text-white border-b border-slate-800 shadow-md px-4 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Branding & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-md flex items-center justify-center text-white shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight text-white uppercase">
                PRAHARI-AI
              </h1>
              <span className="bg-blue-900/80 border border-blue-600 text-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                NDMA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">
              National Multi-Hazard Impact-Based Decision Intelligence Layer
            </p>
          </div>
        </div>

        {/* Status Indicators & District Selector */}
        <div className="flex items-center justify-between md:justify-end space-x-4 text-xs">
          {/* Operational Status */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-md text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">SYSTEM OPERATIONAL</span>
          </div>

          {/* Real-time Weather Telemetry Widget */}
          {weather && (
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-md text-slate-200">
              <CloudRain className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="font-semibold text-[11px]">{weather.current.temperature_c}°C</span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] flex items-center space-x-1">
                <span>🌧️</span>
                <span className="font-semibold font-mono text-blue-300">{weather.current.precipitation_mm.toFixed(1)}mm</span>
                <span className="text-slate-400 text-[10px]">Rain</span>
              </span>
            </div>
          )}



          {/* Last Updated Timestamp */}
          <div className="hidden lg:flex flex-col text-right text-slate-400">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Last Telemetry Sync</span>
            <span className="font-mono text-slate-300 font-medium">{lastUpdated || '12:40 PM IST'}</span>
          </div>

          {/* Pilot District Selector */}
          <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-200 font-medium">
            <span className="text-slate-400 text-[11px] uppercase mr-1.5 hidden xl:inline">Pilot:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange && onDistrictChange(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              {PILOT_DISTRICTS.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Notification Icon */}
          <button className="relative p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <div className="bg-slate-800 p-1.5 rounded-md text-blue-400 border border-slate-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">State EOC Duty Officer</div>
              <div className="text-[10px] text-blue-400 font-medium">{currentDistrict.state} SDMA / NDMA</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
