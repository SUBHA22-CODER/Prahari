import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import RiskMapPage from './pages/RiskMapPage';
import AlertsPage from './pages/AlertsPage';
import BacktestPage from './pages/BacktestPage';
import FeedbackPage from './pages/FeedbackPage';
import DataSourcesPage from './pages/DataSourcesPage';
import SystemStatusPage from './pages/SystemStatusPage';
import { Menu } from 'lucide-react';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('wayanad');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* Global Persistent Header */}
        <Header 
          selectedDistrict={selectedDistrict} 
          onDistrictChange={(id) => setSelectedDistrict(id)}
          lastUpdated="12:40 PM IST"
        />

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
          />

          {/* Main View Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100">
            <div className="max-w-7xl mx-auto space-y-4">
              <Routes>
                <Route path="/" element={<Dashboard selectedDistrict={selectedDistrict} />} />
                <Route path="/risk-map" element={<RiskMapPage selectedDistrict={selectedDistrict} />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/backtest" element={<BacktestPage />} />
                <Route path="/feedback" element={<FeedbackPage selectedDistrict={selectedDistrict} />} />
                <Route path="/data-sources" element={<DataSourcesPage />} />
                <Route path="/system" element={<SystemStatusPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
