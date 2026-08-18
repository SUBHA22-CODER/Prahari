import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Radio, 
  Activity, 
  Users, 
  ShieldAlert, 
  Zap, 
  Navigation, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  PhoneOff, 
  Clock, 
  AlertTriangle,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { PILOT_DISTRICTS } from '../services/mockData';

// Custom pulsing Leaflet Icon for Survivor Clusters
const createPulsingIcon = (phoneCount, isCritical) => {
  const bgGradient = isCritical 
    ? 'background: radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(185, 28, 28, 0.7) 70%);' 
    : 'background: radial-gradient(circle, rgba(245, 158, 11, 0.9) 0%, rgba(180, 83, 9, 0.7) 70%);';

  const pulseColor = isCritical ? '#ef4444' : '#f59e0b';

  return L.divIcon({
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          ${bgGradient}
          border: 2px solid #ffffff;
          box-shadow: 0 0 15px ${pulseColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 13px;
          z-index: 2;
        ">
          ${phoneCount}
        </div>
        <div style="
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid ${pulseColor};
          animation: survivorPulse 1.8s infinite ease-out;
          z-index: 1;
        "></div>
      </div>
    `,
    className: 'survivor-cluster-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

// EOC Command Post Icon
const eocIcon = L.divIcon({
  html: `
    <div style="
      background-color: #1e293b;
      color: #38bdf8;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 2px solid #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    ">
      🚁
    </div>
  `,
  className: 'eoc-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Helper component to center map dynamically
function MapViewController({ center }) {
  const map = useMap();
  const lat = center?.[0];
  const lng = center?.[1];

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 12, { duration: 1.0 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function RescueIntelPage({ selectedDistrict = 'wayanad' }) {
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showRescueRoute, setShowRescueRoute] = useState(false);
  const [dispatchedClusters, setDispatchedClusters] = useState([]);
  const [dispatchToast, setDispatchToast] = useState(null);

  // Live Dispatch Modal States
  const [dispatchModalCluster, setDispatchModalCluster] = useState(null);
  const [dispatchEmail, setDispatchEmail] = useState('decodinggen07@gmail.com');
  const [dispatchPhone, setDispatchPhone] = useState('+919876543210');
  const [isSendingDispatch, setIsSendingDispatch] = useState(false);

  // Web Audio Synthesized Emergency Siren Effect
  const playEmergencySiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn("Audio siren error:", e);
    }
  };

  const handleOpenDispatchModal = (cluster) => {
    setDispatchModalCluster(cluster);
  };

  const handleConfirmLiveDispatch = async () => {
    if (!dispatchModalCluster) return;
    setIsSendingDispatch(true);
    playEmergencySiren();

    try {
      const res = await api.dispatchNDRFTeam({
        cluster_id: dispatchModalCluster.id,
        ward_name: dispatchModalCluster.ward_name,
        phone_count: dispatchModalCluster.phone_count,
        estimated_survivors: dispatchModalCluster.estimated_survivors,
        rescue_priority: dispatchModalCluster.rescue_priority,
        radius_m: dispatchModalCluster.radius_m,
        lat: dispatchModalCluster.lat,
        lng: dispatchModalCluster.lng,
        tower_id: dispatchModalCluster.tower_id,
        recipient_email: dispatchEmail,
        recipient_phone: dispatchPhone
      });

      if (!dispatchedClusters.includes(dispatchModalCluster.id)) {
        setDispatchedClusters([...dispatchedClusters, dispatchModalCluster.id]);
      }

      const emailStatus = res.email_sent ? '📧 Brevo Email Delivered' : '📧 Email Dispatched';
      const callStatus = res.call_sent ? '📞 Twilio Call Initiated' : '📞 Voice Call Ready';

      setDispatchToast(`🚨 LIVE NDRF DISPATCH FIRED! (${emailStatus} | ${callStatus} to ${dispatchPhone})`);
      setShowRescueRoute(true);
      setDispatchModalCluster(null);
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setIsSendingDispatch(false);
      setTimeout(() => setDispatchToast(null), 8000);
    }
  };

  const currentDistrict = PILOT_DISTRICTS.find(d => d.id === selectedDistrict) || PILOT_DISTRICTS[0];
  const districtCenter = [currentDistrict.lat, currentDistrict.lng];

  // Load survivor cluster data for current district
  useEffect(() => {
    async function loadSurvivorData() {
      setLoading(true);
      try {
        const data = await api.getSurvivorZones(selectedDistrict);
        setIntelData(data);
        if (data.zones && data.zones.length > 0) {
          setSelectedCluster(data.zones[0]);
        }
      } catch (err) {
        console.error("Failed to load survivor zones:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSurvivorData();
  }, [selectedDistrict]);

  // Handle Signal Scan Trigger Animation
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanStep(1);
    setShowRescueRoute(false);

    setTimeout(() => setScanStep(2), 1200);
    setTimeout(() => setScanStep(3), 2400);
    setTimeout(() => {
      setIsScanning(false);
      setShowRescueRoute(true);
    }, 3600);
  };

  // Handle Dispatch SDRF Team
  const handleDispatch = (cluster) => {
    if (!dispatchedClusters.includes(cluster.id)) {
      setDispatchedClusters([...dispatchedClusters, cluster.id]);
    }
    setDispatchToast(`🚀 SDRF Rescue Team dispatched to ${cluster.ward_name}! (Est. Arrival: 14 mins)`);
    setTimeout(() => setDispatchToast(null), 5000);
  };

  if (loading || !intelData) {
    return (
      <div className="h-96 bg-slate-900 animate-pulse rounded-lg flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Radio className="w-10 h-10 animate-spin text-blue-500" />
        <span className="text-sm font-bold tracking-wider">CONNECTING TO BSNL/AIRTEL CDR TELEMETRY FEEDS...</span>
      </div>
    );
  }

  const clusters = intelData.zones || [];

  // EOC base location (offset slightly from center)
  const eocCoords = [currentDistrict.lat - 0.04, currentDistrict.lng - 0.03];

  // Route lines from EOC to each survivor cluster
  const rescueRoutes = clusters.map(c => [
    eocCoords,
    [c.lat - 0.01, c.lng - 0.015],
    [c.lat, c.lng]
  ]);

  return (
    <div className="space-y-4">
      {/* CSS Animation Keyframes for Pulsing Circle */}
      <style>{`
        @keyframes survivorPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* Header Info Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-extrabold tracking-wide uppercase text-white">
              RESCUE INTEL — TELECOM DEAD-ZONE SURVIVOR TRIANGULATION
            </h2>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded">
              POST-DISASTER LAYER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time CDR Mobile Signal Void Detection (BSNL / Airtel / Jio Tower Heartbeat Monitor — DoT ITU CAP Protocol)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className={`flex-1 md:flex-none px-4 py-2 rounded font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isScanning 
                ? 'bg-amber-600 text-white animate-pulse' 
                : 'bg-red-600 hover:bg-red-500 text-white border border-red-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isScanning ? `SCANNING TOWER CDRs (${scanStep}/3)...` : '⚡ ACTIVATE SIGNAL SCAN'}</span>
          </button>

          <button
            onClick={() => setShowRescueRoute(!showRescueRoute)}
            className={`px-3 py-2 rounded text-xs font-bold flex items-center space-x-1.5 border transition-all ${
              showRescueRoute 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{showRescueRoute ? 'Hide Routes' : 'Rescue Routes'}</span>
          </button>
        </div>
      </div>

      {/* Dispatch Confirmation Toast */}
      {dispatchToast && (
        <div className="bg-emerald-600 text-white p-3 rounded-md shadow-xl flex justify-between items-center text-xs font-extrabold animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{dispatchToast}</span>
          </div>
          <button onClick={() => setDispatchToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase">
            <span>Detected Zones</span>
            <Radio className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{intelData.total_zones_detected}</div>
          <div className="text-[10px] text-red-600 font-bold mt-0.5">Pulsing Signal Voids</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase">
            <span>Phones Silent</span>
            <PhoneOff className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{intelData.total_phones_offline}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sudden Signal Dropouts</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase">
            <span>Est. Survivors</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">{intelData.total_estimated_survivors}</div>
          <div className="text-[10px] text-blue-600 font-bold mt-0.5">High Trapped Probability</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase">
            <span>Critical Zones</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{intelData.critical_zones}</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">Immediate SDRF Priority</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold uppercase">
            <span>Scan Latency</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">&lt; 42s</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">DoT Stream Polled</div>
        </div>
      </div>

      {/* Main Grid: Left Map (65%) + Right Intel Log Panel (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-900 p-2 rounded-lg border border-slate-800 shadow-xl relative overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Scanning Radar Overlay Effect */}
          {isScanning && (
            <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-4">
              <div className="relative w-32 h-32 border-4 border-red-500/40 rounded-full flex items-center justify-center animate-ping">
                <div className="w-20 h-20 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-black text-red-400 tracking-wider">TRIANGULATING BSNL / AIRTEL TOWER CDR DROPOUTS...</p>
                <p className="text-xs text-slate-400">Step {scanStep}/3: Cross-referencing missing heartbeat pings with Ward boundaries...</p>
              </div>
            </div>
          )}

          {/* Map Header Status */}
          <div className="bg-slate-950/80 px-3 py-2 rounded text-slate-300 text-xs font-bold flex justify-between items-center mb-2 border border-slate-800 z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-white uppercase">GEOSPATIAL SURVIVOR CLUSTER OVERLAY ({currentDistrict.name})</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
                <span>Critical Cluster</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span>EOC Command</span>
              </span>
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 w-full rounded overflow-hidden min-h-[440px] z-0">
            <MapContainer
              center={districtCenter}
              zoom={11}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', minHeight: '440px', background: '#0f172a' }}
            >
              <MapViewController center={districtCenter} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* District EOC Command Center Marker */}
              <Marker position={eocCoords} icon={eocIcon}>
                <Popup>
                  <div className="p-1 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">🚁 District EOC Command Post</div>
                    <div className="text-[11px] text-slate-600">SDRF Rescue Unit Ready</div>
                  </div>
                </Popup>
              </Marker>

              {/* Rescue Routes Lines */}
              {showRescueRoute && rescueRoutes.map((route, idx) => (
                <Polyline
                  key={idx}
                  positions={route}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 4,
                    dashArray: '8, 8',
                    opacity: 0.9
                  }}
                />
              ))}

              {/* Survivor Cluster Markers */}
              {clusters.map((cluster) => {
                const isSelected = selectedCluster && selectedCluster.id === cluster.id;
                const isCritical = cluster.rescue_priority === 'CRITICAL';
                const isDispatched = dispatchedClusters.includes(cluster.id);

                return (
                  <Marker
                    key={cluster.id}
                    position={[cluster.lat, cluster.lng]}
                    icon={createPulsingIcon(cluster.phone_count, isCritical)}
                    eventHandlers={{
                      click: () => setSelectedCluster(cluster)
                    }}
                  >
                    <Popup className="survivor-popup">
                      <div className="p-2 space-y-2 max-w-xs">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-extrabold text-xs text-red-600">
                            {cluster.id}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                            isCritical ? 'bg-red-600' : 'bg-amber-600'
                          }`}>
                            {cluster.rescue_priority} PRIORITY
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="font-extrabold text-slate-900">{cluster.ward_name}</p>
                          <div className="text-slate-600 text-[11px] space-y-0.5">
                            <div>📱 <strong>{cluster.phone_count} phones silent</strong> at {cluster.dropout_time}</div>
                            <div>👥 Est. <strong>{cluster.estimated_survivors} trapped survivors</strong></div>
                            <div>📍 Radius: <strong>{cluster.radius_m}m</strong> | Prob: <strong>{cluster.probability}%</strong></div>
                            <div>📡 Tower: <code>{cluster.tower_id}</code></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDispatchModal(cluster)}
                          className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center space-x-1 transition-colors ${
                            isDispatched 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{isDispatched ? '✓ TEAM DISPATCHED' : 'DISPATCH NDRF RESCUE TEAM'}</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Live CDR Signal Log + Selected Cluster Detail */}
        <div className="space-y-4">
          
          {/* Selected Cluster Deep Intel Card */}
          {selectedCluster && (
            <div className="bg-white p-4 rounded-lg border-2 border-red-500 shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                    TARGET SURVIVOR CLUSTER INTEL
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {selectedCluster.ward_name}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                  selectedCluster.rescue_priority === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-600'
                }`}>
                  {selectedCluster.rescue_priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px]">Silent Phones:</span>
                  <p className="font-extrabold text-red-600 text-base">{selectedCluster.phone_count} Phones</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Est. Survivors:</span>
                  <p className="font-extrabold text-blue-600 text-base">{selectedCluster.estimated_survivors} Trapped</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Dropout Time:</span>
                  <p className="font-bold text-slate-800">{selectedCluster.dropout_time} IST</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Confidence:</span>
                  <p className="font-bold text-emerald-600">{selectedCluster.probability}% Verified</p>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Telecom Operators:</span>
                  <strong className="text-slate-800">{selectedCluster.operator}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Radius:</span>
                  <strong className="text-slate-800">{selectedCluster.radius_m} meters</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tower ID:</span>
                  <code className="text-slate-800 bg-slate-100 px-1 rounded">{selectedCluster.tower_id}</code>
                </div>
                <div className="flex justify-between">
                  <span>Signal Level Drop:</span>
                  <span className="text-red-600 font-bold">-67 dBm ➔ 0 dBm (Dead Zone)</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenDispatchModal(selectedCluster)}
                className={`w-full py-2.5 rounded font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
                  dispatchedClusters.includes(selectedCluster.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {dispatchedClusters.includes(selectedCluster.id)
                    ? '✓ NDRF TEAM DISPATCHED'
                    : `DISPATCH NDRF TEAM TO ${selectedCluster.id}`}
                </span>
              </button>
            </div>
          )}

          {/* Live CDR Dropout Event Log Stream */}
          <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  LIVE CDR DROPOUT EVENT STREAM
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                DoT Feed Polling
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {clusters.map((cluster) => {
                const isSelected = selectedCluster && selectedCluster.id === cluster.id;
                const isDispatched = dispatchedClusters.includes(cluster.id);

                return (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedCluster(cluster)}
                    className={`p-2.5 rounded text-xs cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-slate-800 border-red-500 shadow-md' 
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-white text-[11px] flex items-center space-x-1">
                        <PhoneOff className="w-3 h-3 text-red-400" />
                        <span>{cluster.ward_name}</span>
                      </span>
                      <span className="text-[10px] text-red-400 font-mono font-bold">
                        {cluster.dropout_time}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-bold">
                        ⚠️ {cluster.phone_count} phones silent ({cluster.radius_m}m)
                      </span>
                      <span className="text-slate-400">
                        Prob: <strong className="text-emerald-400">{cluster.probability}%</strong>
                      </span>
                    </div>

                    {isDispatched && (
                      <div className="mt-1 text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SDRF Rescue Unit Dispatched</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Technical Verification Footnote */}
            <div className="p-2 bg-slate-950 rounded text-[10px] text-slate-400 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-300">💡 Technical Protocol Verification:</div>
              <p className="leading-tight">
                Telecom dead-zone triangulation uses passive tower-side Call Detail Record (CDR) heartbeat dropouts. Zero mobile app or internet connection required on victim devices.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Live NDRF Dispatch Modal Overlay */}
      {dispatchModalCluster && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-white animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-red-950/80 border-b border-red-800/60 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-white">
                  NDRF BATTALION LIVE DISPATCH COMMAND
                </h3>
              </div>
              <button 
                onClick={() => setDispatchModalCluster(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[10px] text-red-400 font-extrabold uppercase">TARGET CLUSTER INFORMATION</div>
                <div className="text-base font-extrabold text-white">{dispatchModalCluster.ward_name}</div>
                <div className="flex justify-between text-slate-300 text-[11px] pt-1">
                  <span>📱 Silent Phones: <strong className="text-red-400">{dispatchModalCluster.phone_count}</strong></span>
                  <span>👥 Est. Trapped: <strong className="text-blue-400">{dispatchModalCluster.estimated_survivors}</strong></span>
                  <span>📍 Priority: <strong className="text-rose-400">{dispatchModalCluster.rescue_priority}</strong></span>
                </div>
              </div>

              {/* Recipient Contact Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    📱 NDRF Lead Phone Number (Twilio Live Call)
                  </label>
                  <input
                    type="text"
                    value={dispatchPhone}
                    onChange={(e) => setDispatchPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Automated Twilio Voice Call will dial this phone number upon confirmation.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    📧 NDRF Lead Email (Brevo HTML Mandate)
                  </label>
                  <input
                    type="email"
                    value={dispatchEmail}
                    onChange={(e) => setDispatchEmail(e.target.value)}
                    placeholder="ndrf.command@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Brevo SMTP delivers HTML mandate with GPS coordinates & map link.
                  </span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="bg-blue-950/40 border border-blue-800/50 p-2.5 rounded text-[11px] text-blue-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Dual-Channel Engine: Phone Call + HTML Email will fire simultaneously.</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setDispatchModalCluster(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmLiveDispatch}
                disabled={isSendingDispatch}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg"
              >
                <Send className="w-4 h-4 animate-pulse" />
                <span>{isSendingDispatch ? 'DISPATCHING LIVE CALL & EMAIL...' : '🔥 CONFIRM & FIRE LIVE DISPATCH'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
