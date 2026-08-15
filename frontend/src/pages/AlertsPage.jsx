import React, { useState, useEffect } from 'react';
import AlertFeed from '../components/dashboard/AlertFeed';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import CAPAlertViewer from '../components/alerts/CAPAlertViewer';
import { api } from '../services/api';
import { Bell, Radio } from 'lucide-react';

export default function AlertsPage({ selectedDistrict = 'wayanad' }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeModalAlert, setActiveModalAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      const data = await api.getAlerts(selectedDistrict);
      setAlerts(data);
      if (data.length > 0) setSelectedAlert(data[0]);
      setLoading(false);
    }
    loadAlerts();
  }, [selectedDistrict]);

  if (loading) return <div className="h-64 bg-slate-200 animate-pulse rounded-md"></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border border-slate-200 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-600 animate-pulse" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              CAP DISSEMINATION ALERTS FEED ({alerts.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard Common Alerting Protocol (CAP v1.2) emergency warnings prepared for SACHET dissemination.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <AlertFeed
            alerts={alerts}
            onSelectAlert={(a) => setSelectedAlert(a)}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedAlert ? (
            <div className="bg-white p-4 rounded-md border border-slate-200 space-y-4 shadow-xs">
              <div className="border-b pb-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SELECTED ALERT DETAILS</span>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedAlert.id} — {selectedAlert.ward_name}</h3>
                </div>
                <button
                  onClick={() => setActiveModalAlert(selectedAlert)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Open Full Modal
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded text-xs space-y-1">
                <div className="font-bold text-red-900">MANDATED ACTION:</div>
                <div className="font-extrabold text-red-800">{selectedAlert.recommended_action}</div>
              </div>

              <CAPAlertViewer alert={selectedAlert} />
            </div>
          ) : (
            <div className="bg-white p-8 text-center text-slate-400 text-xs border rounded">
              Select an alert from the feed to view CAP structure.
            </div>
          )}
        </div>
      </div>

      {activeModalAlert && (
        <AlertDetailsModal
          alert={activeModalAlert}
          onClose={() => setActiveModalAlert(null)}
        />
      )}
    </div>
  );
}
