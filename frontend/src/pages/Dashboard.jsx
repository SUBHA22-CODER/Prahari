import React, { useState, useEffect } from 'react';
import KPIStats from '../components/dashboard/KPIStats';
import RiskMap from '../components/dashboard/RiskMap';
import WardDetails from '../components/dashboard/WardDetails';
import AlertFeed from '../components/dashboard/AlertFeed';
import TriageTable from '../components/dashboard/TriageTable';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import { api } from '../services/api';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function Dashboard({ selectedDistrict }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeModalAlert, setActiveModalAlert] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setLoading(true);
      try {
        const data = await api.getDashboard(selectedDistrict);
        if (isMounted) {
          setDashboardData(data);
          // Set Ward 14 (Meppadi - Critical) as initial selected ward for max judge impact
          const initialWard = data.wards?.find(w => w.ward_id === 'W14') || data.wards?.[0];
          setSelectedWard(initialWard);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  const handleSelectWard = (ward) => {
    setSelectedWard(ward);
  };

  const handleInspectWard = (ward) => {
    setSelectedWard(ward);
    const matchedAlert = dashboardData?.alerts?.find(a => a.ward_id === ward.ward_id) || {
      id: `PRAHARI-${ward.ward_id}-001`,
      severity: ward.risk_band,
      hazard_type: 'Flash Flood + Debris Flow Fusion',
      ward_id: ward.ward_id,
      ward_name: ward.ward_name,
      risk_score: ward.risk_score,
      confidence: ward.confidence,
      issued_at: new Date().toISOString(),
      recommended_action: ward.recommended_action,
      affected_population: ward.exposure?.population || 2500,
      cap_structure: {
        identifier: `PRAHARI-${ward.ward_id}-001`,
        sender: 'prahari-ai@ndma.gov.in',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          category: 'Safety',
          event: ward.recommended_action,
          urgency: 'Immediate',
          severity: ward.risk_band === 'CRITICAL' ? 'Extreme' : 'Severe',
          certainty: 'Observed',
          headline: `EVACUATION WARNING: Elevated Hazard in ${ward.ward_name}`,
          description: `Cumulative rainfall exceeding warning mark with elevated risk score (${ward.risk_score}/100).`,
          instruction: ward.recommended_action,
          area: { areaDesc: ward.ward_name }
        }
      }
    };
    setActiveModalAlert(matchedAlert);
  };

  const handleSelectAlert = (alert) => {
    setActiveModalAlert(alert);
    const linkedWard = dashboardData?.wards?.find(w => w.ward_id === alert.ward_id);
    if (linkedWard) {
      setSelectedWard(linkedWard);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-2">
        <div className="h-20 bg-slate-200 rounded-md"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-md"></div>
          <div className="h-[500px] bg-slate-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  const criticalWard = dashboardData?.wards?.find(w => w.risk_score >= 70);

  return (
    <div className="space-y-4">
      {/* Top Emergency Broadcast Push Notification Banner */}
      {criticalWard && (
        <div className="bg-slate-900 border border-red-600/40 p-3 rounded-md shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-full animate-bounce shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"></span>
                <span>LIVE CAP DISSEMINATION PUSH NOTIFICATION (SENT TO SACHET / NDMA GATEWAY)</span>
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5">
                CRITICAL WARNING: {criticalWard.ward_name} (Impact Score: {criticalWard.risk_score}/100) — {criticalWard.recommended_action}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleInspectWard(criticalWard)}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded shadow-xs transition-colors shrink-0 uppercase tracking-wide cursor-pointer"
          >
            Inspect CAP Alert
          </button>
        </div>
      )}

      {/* Top 4 KPI Summary Cards */}
      <KPIStats summary={dashboardData?.summary} />

      {/* Main Map + Selected Ward Detail Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Centerpiece (2 Cols on Desktop) */}
        <div className="lg:col-span-2">
          <RiskMap
            wards={dashboardData?.wards || []}
            selectedWard={selectedWard}
            onSelectWard={handleSelectWard}
            exposurePoints={dashboardData?.exposure_points || []}
            selectedDistrict={selectedDistrict}
          />
        </div>

        {/* Selected Ward Details Panel (1 Col on Desktop) */}
        <div className="lg:col-span-1">
          <WardDetails
            ward={selectedWard}
            onViewAlert={(ward) => handleInspectWard(ward)}
          />
        </div>
      </div>

      {/* Active Alerts Feed + Official Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Alert Feed */}
        <div className="lg:col-span-1">
          <AlertFeed
            alerts={dashboardData?.alerts || []}
            onSelectAlert={handleSelectAlert}
          />
        </div>

        {/* Official Response Triage Table */}
        <div className="lg:col-span-2">
          <TriageTable
            wards={dashboardData?.wards || []}
            onSelectWard={handleInspectWard}
          />
        </div>
      </div>

      {/* CAP Alert Modal */}
      {activeModalAlert && (
        <AlertDetailsModal
          alert={activeModalAlert}
          onClose={() => setActiveModalAlert(null)}
          onFocusOnMap={(alert) => {
            const ward = dashboardData?.wards?.find(w => w.ward_id === alert.ward_id);
            if (ward) setSelectedWard(ward);
          }}
        />
      )}
    </div>
  );
}
