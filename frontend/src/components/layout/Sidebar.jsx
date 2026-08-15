import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  History, 
  MessageSquareDiff, 
  Database, 
  Activity,
  ShieldAlert,
  ChevronRight,
  Mail
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, selectedDistrict = 'wayanad' }) {
  const DISTRICT_ALERTS_MAP = {
    wayanad: 6,
    kamrup: 6,
    cachar: 8,
    dibrugarh: 5,
    shimla: 5,
    idukki: 7,
    pathanamthitta: 4
  };

  const DISTRICT_NAMES_MAP = {
    wayanad: "Wayanad (Kerala)",
    cachar: "Cachar (Assam)",
    kamrup: "Kamrup Metro (Assam)",
    dibrugarh: "Dibrugarh (Assam)",
    idukki: "Idukki (Kerala)",
    pathanamthitta: "Pathanamthitta (Kerala)",
    shimla: "Shimla (Himachal Pradesh)"
  };

  const activeAlertsCount = DISTRICT_ALERTS_MAP[selectedDistrict.lower?.() || selectedDistrict] || 6;
  const activeDistrictName = DISTRICT_NAMES_MAP[selectedDistrict.lower?.() || selectedDistrict] || "Wayanad (Kerala)";

  const navSections = [
    {
      title: 'OVERVIEW',
      subtitle: 'Risk Intelligence',
      items: [
        { path: '/', label: 'Overview', icon: LayoutDashboard, exact: true }
      ]
    },
    {
      title: 'OPERATIONS',
      subtitle: 'Real-time Command',
      items: [
        { path: '/risk-map', label: 'Risk Map', icon: Map },
        { path: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount.toString() },
        { path: '/email-alerts', label: 'Email Alerts', icon: Mail }
      ]
    },
    {
      title: 'ANALYSIS',
      subtitle: 'Evaluation & Tuning',
      items: [
        { path: '/backtest', label: 'Backtest', icon: History },
        { path: '/feedback', label: 'Feedback', icon: MessageSquareDiff }
      ]
    },
    {
      title: 'SYSTEM',
      subtitle: 'Infrastructure & Data',
      items: [
        { path: '/data-sources', label: 'Data Sources', icon: Database },
        { path: '/system', label: 'System Status', icon: Activity }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1050] bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-[1100] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation Top Section */}
        <div className="overflow-y-auto py-4 px-3 space-y-6">
          <div className="px-3 pb-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-white tracking-wide">NAVIGATION</span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{section.title}</span>
                <span className="text-[10px] text-slate-600 font-normal capitalize">{section.subtitle}</span>
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {item.badge && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Metadata */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center font-semibold text-slate-300">
            <span>PRAHARI-AI MVP</span>
            <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-blue-400">v1.0.0</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Pilot District: <strong className="text-slate-300">{activeDistrictName}</strong>
          </div>
          <div className="text-[10px] text-slate-500">
            Engine: <span className="text-emerald-400 font-mono">FastAPI + PostGIS</span>
          </div>
        </div>
      </aside>
    </>
  );
}
