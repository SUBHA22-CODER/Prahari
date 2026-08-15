import React, { useState, useEffect } from 'react';
import RiskMap from '../components/dashboard/RiskMap';
import WardDetails from '../components/dashboard/WardDetails';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import { api } from '../services/api';

export default function RiskMapPage({ selectedDistrict }) {
  const [wards, setWards] = useState([]);
  const [exposurePoints, setExposurePoints] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeModalAlert, setActiveModalAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      const wardData = await api.getWards(selectedDistrict);
      const expData = await api.getExposurePoints(selectedDistrict);
      setWards(wardData);
      setExposurePoints(expData);
      if (wardData.length > 0) setSelectedWard(wardData[0]);
      setLoading(false);
    }
    loadMapData();
  }, [selectedDistrict]);

  if (loading) {
    return <div className="h-96 bg-slate-200 animate-pulse rounded-md"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-md border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            PILOT DISTRICT WARD RISK GEOSPATIAL MAP
          </h2>
          <p className="text-xs text-slate-500">
            Interactive ward polygons color-coded by impact risk band (Critical 70-100, Alert 40-70, Monitor 0-40).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RiskMap
            wards={wards}
            selectedWard={selectedWard}
            onSelectWard={(w) => setSelectedWard(w)}
            exposurePoints={exposurePoints}
            selectedDistrict={selectedDistrict}
          />
        </div>

        <div className="lg:col-span-1">
          <WardDetails
            ward={selectedWard}
            onViewAlert={(ward) => {
              setActiveModalAlert({
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
              });
            }}
          />
        </div>
      </div>

      {activeModalAlert && (
        <AlertDetailsModal
          alert={activeModalAlert}
          onClose={() => setActiveModalAlert(null)}
          onFocusOnMap={(alert) => {
            const ward = wards.find(w => w.ward_id === alert.ward_id);
            if (ward) setSelectedWard(ward);
          }}
        />
      )}
    </div>
  );
}
