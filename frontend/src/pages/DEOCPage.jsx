import React, { useState, useEffect } from 'react';
import { Send, ExternalLink, ShieldAlert, CheckCircle, Radio } from 'lucide-react';
import { api } from '../services/api';

export default function DEOCPage({ selectedDistrict }) {
  const [telegramChannels, setTelegramChannels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logs, setLogs] = useState([
    { time: '09:00:00', type: 'SYSTEM', message: 'Daily telemetry sync broadcast test - SUCCESS', status: 'OK' },
    { time: '06:00:00', type: 'METEO', message: 'Rainfall threshold check: Normal limits', status: 'OK' }
  ]);

  useEffect(() => {
    async function loadTelegramConfig() {
      try {
        const channels = await api.getTelegramChannels();
        setTelegramChannels(channels);
      } catch (err) {
        console.warn('Failed to load telegram configs:', err);
      }
    }
    loadTelegramConfig();
  }, []);

  const handleTriggerBroadcast = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.triggerTelegramAlert(selectedDistrict);
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      if (res.success) {
        setSuccess(true);
        setLogs(prev => [
          { time: currentTime, type: 'CAP_ALERT', message: `Critical evacuation warning sent to ${res.channel_name}`, status: 'DISPATCHED' },
          ...prev
        ]);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setLogs(prev => [
          { time: currentTime, type: 'OFFLINE_SIM', message: `Alert dispatch simulation triggered: ${res.message}`, status: 'SIMULATED' },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const channelInfo = telegramChannels?.[selectedDistrict] || {
    name: `${selectedDistrict.toUpperCase()} DEOC Alerts`,
    chat_id: `@prahari_${selectedDistrict}`,
    invite: 'https://t.me/'
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-md shadow-md text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-md text-white shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
              DEOC COMMAND BROADCAST CENTRE
            </h2>
            <p className="text-[10px] text-slate-400">
              Multi-Channel Emergency Alert Dissemination System (Telegram Bot Integration)
            </p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase">
          Routing Node: ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dissemination Card (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-md shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Broadcast Target
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Scan QR or click link to register EOC officers / receivers.
              </p>
            </div>
            {success && (
              <span className="text-[10px] bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-emerald-700 font-bold uppercase tracking-wider animate-bounce">
                Alert Sent Successfully!
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-md border border-slate-200">
            {/* QR Code Container */}
            <div className="bg-white p-2 rounded shadow-sm border border-slate-200 shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(channelInfo.invite)}`}
                alt="Telegram Invite QR"
                className="w-[120px] h-[120px]"
              />
            </div>

            <div className="text-left space-y-2 flex-1">
              <div className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-sm inline-block">
                <span className="text-[10px] font-bold text-blue-700 uppercase">
                  Telegram Public Group
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">{channelInfo.name}</h4>
              <p className="text-xs text-slate-600 font-mono">{channelInfo.chat_id}</p>
              
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href={channelInfo.invite}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Join EOC Channel</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleTriggerBroadcast}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded shadow-sm transition-colors uppercase tracking-wide cursor-pointer flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Sending Broadcast Alert..." : "Trigger Simulated Broadcast Alert"}</span>
            </button>
          </div>
        </div>

        {/* Transmission logs (1 Column) */}
        <div className="bg-white border border-slate-200 p-5 rounded-md shadow-xs flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dissemination Log
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Live transmission records of EOC alerts.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-mono">
                  <span>{log.time}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[8px] ${log.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-slate-700 font-medium">
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
