import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, RotateCcw, Crosshair, GraduationCap, Building2, Info, ShieldAlert } from 'lucide-react';
import { getRiskBandColor, getRiskBand, getRiskBadgeStyle } from '../../utils/riskBands';

import { PILOT_DISTRICTS } from '../../services/mockData';

// Custom SVG Icons for Leaflet markers
const schoolIcon = L.divIcon({
  html: `<div style="background-color: #2563EB; color: white; padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; font-size: 12px;">🎓</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const hospitalIcon = L.divIcon({
  html: `<div style="background-color: #DC2626; color: white; padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; font-size: 12px;">🏥</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to center map dynamically when selected ward or district changes
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 11, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function RiskMap({ 
  wards = [], 
  selectedWard, 
  onSelectWard, 
  exposurePoints = [],
  selectedDistrict = 'wayanad'
}) {
  const currentDistrict = PILOT_DISTRICTS.find(d => d.id === selectedDistrict) || PILOT_DISTRICTS[0];
  const districtCenter = [currentDistrict.lat, currentDistrict.lng];

  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    landslide: true,
    schools: true,
    hospitals: true,
    wildfire: false,  // Tier 3
    tsunami: false,   // Tier 3
    earthquake: false // Tier 3
  });

  const [showLayerControl, setShowLayerControl] = useState(false);

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Convert ward polygons into Leaflet GeoJSON objects
  const geoJsonData = {
    type: 'FeatureCollection',
    features: wards.map(ward => ({
      type: 'Feature',
      id: ward.ward_id,
      properties: { ...ward },
      geometry: ward.geometry
    }))
  };

  // Style function for ward polygons
  const styleWardFeature = (feature) => {
    const isSelected = selectedWard && selectedWard.ward_id === feature.properties.ward_id;
    const riskScore = feature.properties.risk_score;
    const fillColor = getRiskBandColor(riskScore);

    return {
      fillColor: fillColor,
      fillOpacity: isSelected ? 0.75 : 0.45,
      color: isSelected ? '#0F172A' : fillColor,
      weight: isSelected ? 3 : 1.5,
      dashArray: isSelected ? '' : '3'
    };
  };

  const onEachWardFeature = (feature, layer) => {
    const props = feature.properties;
    const band = getRiskBand(props.risk_score);
    const badgeStyle = getRiskBadgeStyle(props.risk_score);

    // Tooltip content on hover
    layer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; padding: 2px;">
        <div style="font-weight: 700; font-size: 12px; color: #0F172A;">${props.ward_name}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <span style="background-color: ${badgeStyle.hex}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 11px;">
            ${props.risk_score}
          </span>
          <span style="font-weight: 600; font-size: 11px; color: ${badgeStyle.hex};">
            ${band}
          </span>
        </div>
      </div>
    `, { sticky: true });

    // Click handler to select ward
    layer.on({
      click: () => {
        onSelectWard(props);
      }
    });
  };

  return (
    <div className="relative w-full h-[520px] rounded-md border border-slate-300 overflow-hidden bg-slate-100 shadow-inner flex flex-col">
      {/* Map Header Toolbar */}
      <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span className="font-bold tracking-wide">{currentDistrict.name.toUpperCase()} PILOT DISTRICT — IMPACT RISK MAP</span>
          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
            {wards.length} WARDS LOADED
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowLayerControl(!showLayerControl)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-xs transition-colors ${
              showLayerControl 
                ? 'bg-blue-600 border-blue-500 text-white font-semibold' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="relative w-full h-[470px]">
        <MapContainer
          center={districtCenter}
          zoom={currentDistrict.zoom || 11}
          scrollWheelZoom={true}
          zoomControl={true}
          doubleClickZoom={true}
          touchZoom={true}
          style={{ width: '100%', height: '100%' }}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic Map Controller for District or Selected Ward */}
          <MapViewController 
            center={selectedWard?.coordinates || districtCenter} 
            zoom={selectedWard ? 12 : (currentDistrict.zoom || 11)} 
          />

          {/* Ward Risk GeoJSON Polygon Layer */}
          {wards.length > 0 && (
            <GeoJSON
              key={JSON.stringify(wards.map(w => w.ward_id + '_' + (selectedWard?.ward_id === w.ward_id)))}
              data={geoJsonData}
              style={styleWardFeature}
              onEachFeature={onEachWardFeature}
            />
          )}

          {/* Exposure Point Markers (Schools) */}
          {activeLayers.schools && exposurePoints.filter(p => p.type === 'school').map(school => (
            <Marker key={school.id} position={[school.lat, school.lng]} icon={schoolIcon}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-blue-900">{school.name}</div>
                  <div className="text-slate-600 mt-1">Type: School Shelter</div>
                  <div className="text-slate-600">Capacity: {school.capacity} persons</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Exposure Point Markers (Hospitals) */}
          {activeLayers.hospitals && exposurePoints.filter(p => p.type === 'hospital').map(hosp => (
            <Marker key={hosp.id} position={[hosp.lat, hosp.lng]} icon={hospitalIcon}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-red-900">{hosp.name}</div>
                  <div className="text-slate-600 mt-1">Type: Primary Health Care</div>
                  <div className="text-slate-600">Emergency Beds: {hosp.beds}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md p-2.5 shadow-md text-xs space-y-1.5 min-w-[150px]">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide border-b pb-1">
            RISK LEVEL BANDS
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block"></span>
              <span className="font-medium text-slate-800">Critical</span>
            </div>
            <span className="font-mono text-slate-500 font-bold">70–100</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-600 inline-block"></span>
              <span className="font-medium text-slate-800">Alert</span>
            </div>
            <span className="font-mono text-slate-500 font-bold">40–70</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
              <span className="font-medium text-slate-800">Monitor</span>
            </div>
            <span className="font-mono text-slate-500 font-bold">0–40</span>
          </div>
        </div>

        {/* Layer Controls Floating Panel */}
        {showLayerControl && (
          <div className="absolute top-3 right-3 z-30 bg-slate-900/95 text-white border border-slate-700 rounded-md p-3 shadow-xl w-64 text-xs space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 font-bold text-slate-200">
              <span>MAP LAYER CONTROLS</span>
              <button onClick={() => setShowLayerControl(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {/* Active Hazard Layers */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HAZARD FUSION LAYERS</div>
              <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeLayers.flood} 
                  onChange={() => toggleLayer('flood')}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Flood Impact Risk</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeLayers.landslide} 
                  onChange={() => toggleLayer('landslide')}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Landslide Susceptibility</span>
              </label>
            </div>

            {/* Exposure Layers */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EXPOSURE & INFRASTRUCTURE</div>
              <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeLayers.schools} 
                  onChange={() => toggleLayer('schools')}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Schools & Relief Centers (🎓)</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeLayers.hospitals} 
                  onChange={() => toggleLayer('hospitals')}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Hospitals & Healthcare (🏥)</span>
              </label>
            </div>

            {/* Disabled Tier 3 Modules */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>TIER 3 MODULES</span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">UNAVAILABLE</span>
              </div>
              <div className="text-slate-500 line-through text-[11px]">Wildfire Hazard (Tier 3)</div>
              <div className="text-slate-500 line-through text-[11px]">Tsunami Inundation (Tier 3)</div>
              <div className="text-slate-500 line-through text-[11px]">Earthquake Seismicity (Tier 3)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
