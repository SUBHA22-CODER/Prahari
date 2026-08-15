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

  return (
    <div className="space-y-4">
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
          />
        </div>

        {/* Selected Ward Details Panel (1 Col on Desktop) */}
        <div className="lg:col-span-1">
          <WardDetails
            ward={selectedWard}
            onViewAlert={(ward) => {
              const matchedAlert = dashboardData?.alerts?.find(a => a.ward_id === ward.ward_id) || {
                id: `PRAHARI-${ward.ward_id}-001`,
                severity: ward.risk_band,
                hazard_type: 'Flood + Landslide Fusion',
                ward_id: ward.ward_id,
                ward_name: ward.ward_name,
                risk_score: ward.risk_score,
                confidence: ward.confidence,
                issued_at: new Date().toISOString(),
                recommended_action: ward.recommended_action,
                affected_population: ward.exposure?.population || 2500
              };
              setActiveModalAlert(matchedAlert);
            }}
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
            onSelectWard={handleSelectWard}
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
