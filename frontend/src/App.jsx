import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import RiskMapPage from './pages/RiskMapPage';
import AlertsPage from './pages/AlertsPage';
import BacktestPage from './pages/BacktestPage';
import FeedbackPage from './pages/FeedbackPage';
import DataSourcesPage from './pages/DataSourcesPage';
import SystemStatusPage from './pages/SystemStatusPage';
import EmailBroadcastPage from './pages/EmailBroadcastPage';
import RescueIntelPage from './pages/RescueIntelPage';
import { Menu, BellRing, X, ArrowRight } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('wayanad');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const lastFeedbackIdRef = useRef(null);

  const getLiveTelemetryTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';
  };

  const [telemetrySyncTime, setTelemetrySyncTime] = useState(getLiveTelemetryTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetrySyncTime(getLiveTelemetryTime());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll for incoming EOC Officer Feedback responses every 3 seconds
  useEffect(() => {
    let timer;
    async function checkNewFeedback() {
      try {
        const history = await api.getFeedbackHistory();
        if (history && history.length > 0) {
          const latest = history[0];
          if (lastFeedbackIdRef.current === null) {
            // First load baseline
            lastFeedbackIdRef.current = latest.id;
          } else if (lastFeedbackIdRef.current !== latest.id) {
            // New feedback response detected!
            lastFeedbackIdRef.current = latest.id;
            setToast(latest);

            // Auto-dismiss toast after 8 seconds
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
              setToast(null);
            }, 8000);
          }
        }
      } catch (err) {
        console.error("Feedback polling error:", err);
      }
    }

    checkNewFeedback();
    const pollInterval = setInterval(checkNewFeedback, 3000);
    return () => {
      clearInterval(pollInterval);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
        {/* Global Persistent Header */}
        <Header 
          selectedDistrict={selectedDistrict} 
          onDistrictChange={(id) => setSelectedDistrict(id)}
          lastUpdated={telemetrySyncTime}
        />

        {/* Live EOC Officer Feedback Push Toast Notification */}
        {toast && (() => {
          const outcomeText = (toast.actual_outcome || '').toLowerCase();
          const isFalseAlarm = outcomeText.includes('false') || outcomeText.includes('penalty') || outcomeText.includes('no');
          const isPartial = outcomeText.includes('partial') || outcomeText.includes('monitored');
          
          const borderColor = isFalseAlarm ? 'border-rose-500' : (isPartial ? 'border-amber-500' : 'border-emerald-500');
          const badgeBg = isFalseAlarm ? 'bg-rose-600' : (isPartial ? 'bg-amber-600' : 'bg-emerald-600');
          const iconBg = isFalseAlarm ? 'bg-rose-500/20 text-rose-400' : (isPartial ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400');
          const headerText = isFalseAlarm ? 'text-rose-400' : (isPartial ? 'text-amber-400' : 'text-emerald-400');

          return (
            <div className={`fixed top-16 right-4 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-lg shadow-2xl border-2 ${borderColor} transition-all duration-300 transform translate-y-0 animate-bounce`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 ${iconBg} rounded-full flex-shrink-0 mt-0.5`}>
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className={`font-extrabold ${headerText} uppercase tracking-wider text-[11px] flex items-center space-x-1`}>
                      <span>📩 EOC OFFICER RESPONSE RECEIVED</span>
                    </span>
                    <button 
                      onClick={() => setToast(null)} 
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-extrabold text-white text-sm">
                    {toast.ward_name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`${badgeBg} text-white font-extrabold text-[10px] px-2 py-0.5 rounded`}>
                      {toast.actual_outcome}
                    </span>
                    <span className="text-slate-300 text-[10px]">({toast.official_role})</span>
                  </div>
                  <p className="text-slate-300 text-[11px] italic pt-0.5">
                    "{toast.official_notes || toast.feedback_type}"
                  </p>
                  <div className="pt-1.5 flex justify-between items-center">
                    <span className="text-[10px] text-blue-400 font-semibold">
                      ⚡ {toast.feedback_type}
                    </span>
                    <Link 
                      to="/feedback" 
                      onClick={() => setToast(null)}
                      className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded flex items-center space-x-1"
                    >
                      <span>View Logs</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Mobile Header Bar Trigger */}
        <div className="lg:hidden bg-slate-800 text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 text-xs font-bold">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded"
          >
            <Menu className="w-4 h-4" />
            <span>COMMAND MENU</span>
          </button>
          <span className="text-slate-300">Wayanad Pilot Command</span>
        </div>

        {/* Application Shell Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            selectedDistrict={selectedDistrict}
          />

          {/* Main View Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100">
            <div className="max-w-7xl mx-auto space-y-4">
              <Routes>
                <Route path="/" element={<Dashboard selectedDistrict={selectedDistrict} />} />
                <Route path="/risk-map" element={<RiskMapPage selectedDistrict={selectedDistrict} />} />
                <Route path="/alerts" element={<AlertsPage selectedDistrict={selectedDistrict} />} />
                <Route path="/backtest" element={<BacktestPage selectedDistrict={selectedDistrict} />} />
                <Route path="/feedback" element={<FeedbackPage selectedDistrict={selectedDistrict} />} />
                <Route path="/email-alerts" element={<EmailBroadcastPage selectedDistrict={selectedDistrict} />} />
                <Route path="/rescue-intel" element={<RescueIntelPage selectedDistrict={selectedDistrict} />} />
                <Route path="/data-sources" element={<DataSourcesPage selectedDistrict={selectedDistrict} />} />
                <Route path="/system" element={<SystemStatusPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
