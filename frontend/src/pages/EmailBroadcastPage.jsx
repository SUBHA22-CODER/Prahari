import React, { useState, useEffect } from 'react';
import { Mail, Plus, ShieldAlert, CheckCircle, Radio, Users } from 'lucide-react';
import { api } from '../services/api';

export default function EmailBroadcastPage({ selectedDistrict }) {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [logs, setLogs] = useState([
    { time: '09:00:00', type: 'SYSTEM', message: 'Daily telemetry status sync broadcast - SUCCESS', status: 'OK' },
    { time: '06:00:00', type: 'METEO', message: 'Rainfall threshold check: Normal limits', status: 'OK' }
  ]);

  useEffect(() => {
    async function loadRecipients() {
      try {
        const res = await api.getEmailRecipients();
        if (res && res.recipients) {
          setRecipients(res.recipients);
        }
      } catch (err) {
        console.warn('Failed to load email recipients:', err);
      }
    }
    loadRecipients();
  }, []);

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!newEmail.strip?.() && !newEmail) return;
    try {
      const res = await api.addEmailRecipient(newEmail);
      if (res && res.recipients) {
        setRecipients(res.recipients);
        setNewEmail('');
        const currentTime = new Date().toTimeString().split(' ')[0];
        setLogs(prev => [
          { time: currentTime, type: 'CONFIG', message: `Added new recipient: ${newEmail}`, status: 'UPDATED' },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerBroadcast = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.triggerEmailAlert(selectedDistrict);
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      if (res.success) {
        setSuccess(true);
        setSuccessMsg(res.message);
        setLogs(prev => [
          { time: currentTime, type: 'EMAIL_ALERT', message: `Critical warning email broadcasted to ${res.recipients?.length || 0} officers`, status: 'SENT' },
          ...prev
        ]);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setLogs(prev => [
          { time: currentTime, type: 'ERROR', message: `Failed to broadcast email: ${res.message}`, status: 'FAILED' },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-md shadow-md text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2.5 rounded-md text-white shadow-inner">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
              EOC EMAIL BROADCAST CENTRE
            </h2>
            <p className="text-[10px] text-slate-400">
              Brevo SMTP Integration — Real-time Emergency Alert Dissemination
            </p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase">
          BREVO NODE: ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recipient Management & Control (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-md shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span>EOC Recipients Registry</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Emails registered to receive critical CAP alert broadcasts.
              </p>
            </div>
            {success && (
              <span className="text-[9px] bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-emerald-700 font-bold uppercase tracking-wider animate-bounce">
                {successMsg}
              </span>
            )}
          </div>

          {/* Add Recipient Form */}
          <form onSubmit={handleAddRecipient} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter official email address..."
              required
              className="flex-1 border border-slate-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Recipients List Grid */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Currently Registered ({recipients.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipients.map((email, idx) => (
                <div key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-slate-700 font-medium truncate">{email}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleTriggerBroadcast}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded shadow-sm transition-colors uppercase tracking-wide cursor-pointer flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? "Broadcasting Warning Email..." : "Broadcast Simulated Email Alert"}</span>
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
              Live SMTP transmission telemetry.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-mono">
                  <span>{log.time}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[8px] ${log.status === 'SENT' ? 'bg-emerald-100 text-emerald-700' : log.status === 'UPDATED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
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
