/**
 * PRAHARI-AI Mock Data Service Layer
 * Pilot District: Wayanad, Kerala
 */

export const PILOT_DISTRICTS = [
  { id: 'wayanad', name: 'Wayanad', state: 'Kerala', code: 'KL-WYD', lat: 11.605, lng: 76.083, zoom: 11 },
  { id: 'cachar', name: 'Cachar (Silchar)', state: 'Assam', code: 'AS-CAC', lat: 24.833, lng: 92.778, zoom: 11 },
  { id: 'kamrup', name: 'Kamrup Metro (Guwahati)', state: 'Assam', code: 'AS-KMR', lat: 26.144, lng: 91.736, zoom: 11 },
  { id: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', code: 'AS-DIB', lat: 27.472, lng: 94.912, zoom: 11 },
  { id: 'idukki', name: 'Idukki', state: 'Kerala', code: 'KL-IDK', lat: 9.849, lng: 76.972, zoom: 11 },
  { id: 'pathanamthitta', name: 'Pathanamthitta', state: 'Kerala', code: 'KL-PTA', lat: 9.264, lng: 76.787, zoom: 11 },
  { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', code: 'HP-SML', lat: 31.104, lng: 77.173, zoom: 11 }
];

export function getDistrictWards(districtId = 'wayanad') {
  const dist = PILOT_DISTRICTS.find(d => d.id === districtId) || PILOT_DISTRICTS[0];
  
  if (dist.id === 'wayanad') {
    return MOCK_WARDS;
  }

  const wardConfigs = {
    kamrup: [
      { id: 'W04', name: 'Ward 04 (Chandmari / Zoo Road)', score: 85, band: 'CRITICAL', pop: 3420, action: 'EVACUATE URBAN FLASH FLOOD ZONE', dx: 0.01, dy: 0.01 },
      { id: 'W12', name: 'Ward 12 (Guwahati Club / Dispur)', score: 78, band: 'CRITICAL', pop: 4100, action: 'PREPARE EVACUATION OF LOW-LYING DISPUR', dx: -0.01, dy: -0.01 },
      { id: 'W08', name: 'Ward 08 (Jalukbari / Pandu)', score: 74, band: 'CRITICAL', pop: 2900, action: 'MONITOR BRAHMAPUTRA EMBANKMENT BREACH', dx: -0.02, dy: 0.02 },
      { id: 'W01', name: 'Ward 01 (Bharalumukh / Fancy Bazar)', score: 71, band: 'CRITICAL', pop: 5200, action: 'ISSUE URBAN WATERLOGGING ADVISORY', dx: 0.02, dy: -0.02 },
      { id: 'W06', name: 'Ward 06 (Ganeshguri / Narengi)', score: 55, band: 'ALERT', pop: 3800, action: 'CLEAR DRAINAGE OUTFLOW CORRIDORS', dx: 0.03, dy: 0.01 },
      { id: 'W10', name: 'Ward 10 (Hatigaon / Kahilipara)', score: 48, band: 'ALERT', pop: 2600, action: 'SURVEIL HILLSIDE EROSION', dx: -0.03, dy: -0.01 },
      { id: 'W03', name: 'Ward 03 (Khanapara / GS Road)', score: 34, band: 'MONITOR', pop: 1800, action: 'ROUTINE TELEMETRY SURVEILLANCE', dx: 0.01, dy: -0.03 },
      { id: 'W15', name: 'Ward 15 (Maligaon / Gotanagar)', score: 28, band: 'MONITOR', pop: 2100, action: 'NORMAL MONITORING', dx: -0.01, dy: 0.03 }
    ],
    dibrugarh: [
      { id: 'W03', name: 'Ward 03 (Brahmaputra Embankment / Maijan)', score: 84, band: 'CRITICAL', pop: 2950, action: 'EVACUATE EMBANKMENT SETTLEMENTS', dx: 0.01, dy: 0.01 },
      { id: 'W07', name: 'Ward 07 (Chowkidinghee / Town)', score: 75, band: 'CRITICAL', pop: 3600, action: 'PREPARE FLOOD RELIEF SHELTERS', dx: -0.01, dy: -0.01 },
      { id: 'W01', name: 'Ward 01 (Graham Bazar / Tinkunia)', score: 62, band: 'ALERT', pop: 2100, action: 'MONITOR DIB RU RIVER OUTFLOW', dx: -0.02, dy: 0.02 },
      { id: 'W05', name: 'Ward 05 (Naliapool / Milan Nagar)', score: 58, band: 'ALERT', pop: 4100, action: 'ISSUE RIVERBANK INUNDATION WARNING', dx: 0.02, dy: -0.02 },
      { id: 'W02', name: 'Ward 02 (Amolapatty / Santipoor)', score: 38, band: 'MONITOR', pop: 2800, action: 'STANDBY EMERGENCY BARRIERS', dx: 0.03, dy: 0.01 },
      { id: 'W09', name: 'Ward 09 (Bairagimath / Kadamoni)', score: 33, band: 'MONITOR', pop: 2300, action: 'SURVEIL CANAL WATER LEVELS', dx: -0.03, dy: -0.01 },
      { id: 'W04', name: 'Ward 04 (Barbari / Medical College)', score: 29, band: 'MONITOR', pop: 3100, action: 'ROUTINE SURVEILLANCE', dx: 0.01, dy: -0.03 },
      { id: 'W08', name: 'Ward 08 (Jalannagar / Boiragimath)', score: 25, band: 'MONITOR', pop: 1900, action: 'NORMAL MONITORING', dx: -0.01, dy: 0.03 }
    ],
    shimla: [
      { id: 'W05', name: 'Ward 05 (Summer Hill / University)', score: 86, band: 'CRITICAL', pop: 2150, action: 'EVACUATE SLOPE COLLAPSE ZONE', dx: 0.01, dy: 0.01 },
      { id: 'W11', name: 'Ward 11 (Mall Road / Ridge)', score: 79, band: 'CRITICAL', pop: 3100, action: 'PREPARE CLOUDBURST RELIEF CAMPS', dx: -0.01, dy: -0.01 },
      { id: 'W02', name: 'Ward 02 (Sanjauli / Dhalli)', score: 73, band: 'CRITICAL', pop: 2700, action: 'CLOSE VULNERABLE HILL ROADS', dx: -0.02, dy: 0.02 },
      { id: 'W08', name: 'Ward 08 (Chotta Shimla / Jakhoo)', score: 68, band: 'ALERT', pop: 1900, action: 'ISSUE LANDSLIDE SLIP ADVISORY', dx: 0.02, dy: -0.02 },
      { id: 'W01', name: 'Ward 01 (Totu / Boileauganj)', score: 62, band: 'ALERT', pop: 2400, action: 'SURVEIL DRAINAGE CHANNELS', dx: 0.03, dy: 0.01 },
      { id: 'W04', name: 'Ward 04 (Kasumpti / Panthaghati)', score: 55, band: 'ALERT', pop: 3200, action: 'MONITOR SOIL PRE-SATURATION', dx: -0.03, dy: -0.01 },
      { id: 'W07', name: 'Ward 07 (New Shimla / BCS)', score: 48, band: 'ALERT', pop: 2800, action: 'ROUTINE MONITORING', dx: 0.01, dy: -0.03 },
      { id: 'W10', name: 'Ward 10 (Lakkar Bazar / Kaithu)', score: 29, band: 'MONITOR', pop: 1700, action: 'NORMAL BASELINE', dx: -0.01, dy: 0.03 }
    ],
    cachar: [
      { id: 'W06', name: 'Ward 06 (Barak Riverbank / Tarapur)', score: 83, band: 'CRITICAL', pop: 3100, action: 'EVACUATE BARAK EMBANKMENT HOUSES', dx: 0.01, dy: 0.01 },
      { id: 'W02', name: 'Ward 02 (Rangirkhari / Silchar Town)', score: 77, band: 'CRITICAL', pop: 4200, action: 'PREPARE TOWN INUNDATION CAMPS', dx: -0.01, dy: -0.01 },
      { id: 'W08', name: 'Ward 08 (Ambicapatty / Public School)', score: 71, band: 'CRITICAL', pop: 2600, action: 'DEPLOY EMERGENCY PUMPING UNITS', dx: -0.02, dy: 0.02 },
      { id: 'W04', name: 'Ward 04 (Malugram / Ghoniwala)', score: 61, band: 'ALERT', pop: 3500, action: 'ISSUE SLUICE GATE OVERFLOW ADVISORY', dx: 0.02, dy: -0.02 },
      { id: 'W01', name: 'Ward 01 (Meherpur / NIT Road)', score: 53, band: 'ALERT', pop: 2900, action: 'MONITOR WATERLOGGING CORRIDORS', dx: 0.03, dy: 0.01 },
      { id: 'W05', name: 'Ward 05 (Public School Road / Sonai)', score: 47, band: 'ALERT', pop: 2100, action: 'STANDBY DISASTER SURVEILLANCE', dx: -0.03, dy: -0.01 },
      { id: 'W03', name: 'Ward 03 (Singari / Kanakpur)', score: 33, band: 'MONITOR', pop: 1900, action: 'ROUTINE SURVEILLANCE', dx: 0.01, dy: -0.03 },
      { id: 'W07', name: 'Ward 07 (Srikona / Cantonment)', score: 26, band: 'MONITOR', pop: 1500, action: 'NORMAL MONITORING', dx: -0.01, dy: 0.03 }
    ],
    idukki: [
      { id: 'W12', name: 'Ward 12 (Munnar / Gap Road)', score: 87, band: 'CRITICAL', pop: 2400, action: 'EVACUATE HIGH-SLOPE TEA PLANTATION HOUSES', dx: 0.01, dy: 0.01 },
      { id: 'W04', name: 'Ward 04 (Kattappana / Town)', score: 78, band: 'CRITICAL', pop: 3300, action: 'PREPARE HILLSIDE LANDSLIDE SHELTERS', dx: -0.01, dy: -0.01 },
      { id: 'W08', name: 'Ward 08 (Cheruthoni Dam Site)', score: 72, band: 'CRITICAL', pop: 1800, action: 'COORDINATE SPILLWAY OUTFLOW ADVISORY', dx: -0.02, dy: 0.02 },
      { id: 'W01', name: 'Ward 01 (Adimali / Valara)', score: 63, band: 'ALERT', pop: 2700, action: 'ISSUE GHAT ROAD TRAFFIC RESTRICTION', dx: 0.02, dy: -0.02 },
      { id: 'W06', name: 'Ward 06 (Nedumkandam / Thookkupalam)', score: 54, band: 'ALERT', pop: 2100, action: 'SURVEIL STREAM BANK EROSION', dx: 0.03, dy: 0.01 },
      { id: 'W03', name: 'Ward 03 (Vagamon / Elappara)', score: 46, band: 'ALERT', pop: 1900, action: 'STANDBY EMERGENCY CIVIL DEFENSE', dx: -0.03, dy: -0.01 },
      { id: 'W09', name: 'Ward 09 (Thodupuzha / Vannappuram)', score: 36, band: 'MONITOR', pop: 3500, action: 'ROUTINE SURVEILLANCE', dx: 0.01, dy: -0.03 },
      { id: 'W05', name: 'Ward 05 (Peermade / Vandiperiyar)', score: 27, band: 'MONITOR', pop: 1600, action: 'NORMAL BASELINE', dx: -0.01, dy: 0.03 }
    ],
    pathanamthitta: [
      { id: 'W08', name: 'Ward 08 (Ranni / Pamba Basin)', score: 85, band: 'CRITICAL', pop: 2900, action: 'EVACUATE PAMBA RIVERBANK HOUSEHOLDS', dx: 0.01, dy: 0.01 },
      { id: 'W03', name: 'Ward 03 (Konni / Elephant Reserve)', score: 76, band: 'CRITICAL', pop: 2200, action: 'PREPARE FLASH FLOOD RELIEF CAMPS', dx: -0.01, dy: -0.01 },
      { id: 'W05', name: 'Ward 05 (Adoor / Koodal)', score: 71, band: 'CRITICAL', pop: 3600, action: 'ISSUE LOW-LAND INUNDATION ADVISORY', dx: -0.02, dy: 0.02 },
      { id: 'W01', name: 'Ward 01 (Thiruvalla / Manimala Basin)', score: 62, band: 'ALERT', pop: 4100, action: 'DEPLOY EMERGENCY BARRIERS AT RIVERBANKS', dx: 0.02, dy: -0.02 },
      { id: 'W06', name: 'Ward 06 (Mallappally / Anicadu)', score: 53, band: 'ALERT', pop: 2500, action: 'SURVEIL CANAL RUNOFF LEVELS', dx: 0.03, dy: 0.01 },
      { id: 'W04', name: 'Ward 04 (Kozhencherry / Aranmula)', score: 45, band: 'ALERT', pop: 2800, action: 'MONITOR PRE-SATURATION INDEX', dx: -0.03, dy: -0.01 },
      { id: 'W02', name: 'Ward 02 (Pandalam / Kulanada)', score: 33, band: 'MONITOR', pop: 3100, action: 'ROUTINE SURVEILLANCE', dx: 0.01, dy: -0.03 },
      { id: 'W07', name: 'Ward 07 (Seethathode / Moozhiyar)', score: 28, band: 'MONITOR', pop: 1400, action: 'NORMAL BASELINE', dx: -0.01, dy: 0.03 }
    ]
  };

  const cfgList = wardConfigs[dist.id] || wardConfigs['kamrup'];

  return cfgList.map(cfg => {
    const lat = dist.lat + cfg.dy;
    const lng = dist.lng + cfg.dx;
    return {
      ward_id: cfg.id,
      ward_name: cfg.name,
      district: dist.name,
      risk_score: cfg.score,
      risk_band: cfg.band,
      confidence: Math.floor(80 + Math.random() * 10),
      contributions: {
        rainfall: Math.floor(cfg.score * 0.38),
        river_trend: Math.floor(cfg.score * 0.26),
        slope_saturation: Math.floor(cfg.score * 0.18),
        historical_incidents: Math.floor(cfg.score * 0.18)
      },
      exposure: {
        population: cfg.pop,
        schools: Math.floor(cfg.pop / 500) + 1,
        hospitals: Math.floor(cfg.pop / 1500) + 1,
        shelters: Math.floor(cfg.pop / 1000) + 1
      },
      recommended_action: cfg.action,
      supporting_actions: [
        `Prepare local relief shelters in ${cfg.name}`,
        'Deploy emergency response & civil defense units',
        'Issue targeted public warning alert via CAP'
      ],
      coordinates: [lat, lng],
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng - 0.02, lat - 0.02],
          [lng + 0.02, lat - 0.02],
          [lng + 0.02, lat + 0.02],
          [lng - 0.02, lat + 0.02],
          [lng - 0.02, lat - 0.02]
        ]]
      }
    };
  });
}

export const MOCK_WARDS = [
  {
    ward_id: 'W14',
    ward_name: 'Ward 14 (Meppadi / Vellarimala)',
    district: 'Wayanad',
    risk_score: 82,
    risk_band: 'CRITICAL',
    confidence: 84,
    contributions: {
      rainfall: 32,
      river_trend: 21,
      slope_saturation: 14,
      historical_incidents: 15
    },
    exposure: {
      population: 2840,
      schools: 7,
      hospitals: 2,
      shelters: 3
    },
    recommended_action: 'EVACUATE LOW-LYING HOUSEHOLDS',
    supporting_actions: [
      'Close vulnerable schools immediately',
      'Prepare emergency response teams at Meppadi High School shelter',
      'Activate local response & civil defense units',
      'Issue targeted public warning alert via CAP'
    ],
    coordinates: [11.551, 76.124],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.10, 11.53],
        [76.15, 11.53],
        [76.16, 11.58],
        [76.11, 11.57],
        [76.10, 11.53]
      ]]
    }
  },
  {
    ward_id: 'W09',
    ward_name: 'Ward 09 (Vythiri)',
    district: 'Wayanad',
    risk_score: 76,
    risk_band: 'CRITICAL',
    confidence: 81,
    contributions: {
      rainfall: 28,
      river_trend: 19,
      slope_saturation: 18,
      historical_incidents: 11
    },
    exposure: {
      population: 1920,
      schools: 4,
      hospitals: 1,
      shelters: 2
    },
    recommended_action: 'PREPARE EVACUATION OF SLOPE HOUSEHOLDS',
    supporting_actions: [
      'Deploy NDRF team to standby position',
      'Clear landslide-vulnerable ghat road corridors',
      'Issue early advisory to hill communities'
    ],
    coordinates: [11.552, 76.041],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.01, 11.53],
        [76.07, 11.53],
        [76.08, 11.58],
        [76.02, 11.57],
        [76.01, 11.53]
      ]]
    }
  },
  {
    ward_id: 'W18',
    ward_name: 'Ward 18 (Thariode / Banasura)',
    district: 'Wayanad',
    risk_score: 72,
    risk_band: 'CRITICAL',
    confidence: 83,
    contributions: {
      rainfall: 29,
      river_trend: 22,
      slope_saturation: 13,
      historical_incidents: 8
    },
    exposure: {
      population: 1650,
      schools: 3,
      hospitals: 1,
      shelters: 2
    },
    recommended_action: 'EVACUATE DAM DOWNSTREAM HOUSES',
    supporting_actions: [
      'Coordinate Banasura Sagar spillway outflow advisory',
      'Deploy emergency flood barriers along riverbanks',
      'Establish food & medicine supply at Thariode shelter'
    ],
    coordinates: [11.670, 75.960],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [75.92, 11.64],
        [75.99, 11.64],
        [75.98, 11.70],
        [75.93, 11.69],
        [75.92, 11.64]
      ]]
    }
  },
  {
    ward_id: 'W02',
    ward_name: 'Ward 02 (Panamaram)',
    district: 'Wayanad',
    risk_score: 68,
    risk_band: 'ALERT',
    confidence: 79,
    contributions: {
      rainfall: 26,
      river_trend: 20,
      slope_saturation: 12,
      historical_incidents: 10
    },
    exposure: {
      population: 2100,
      schools: 5,
      hospitals: 1,
      shelters: 2
    },
    recommended_action: 'ALERT RIVERBANK COMMUNITIES',
    supporting_actions: [
      'Position rescue inflatable boats at Panamaram bridge',
      'Open primary relief center at St. Jude School',
      'Monitor Kabini river gauge levels every 30 mins'
    ],
    coordinates: [11.720, 76.070],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.04, 11.69],
        [76.10, 11.69],
        [76.11, 11.75],
        [76.05, 11.74],
        [76.04, 11.69]
      ]]
    }
  },
  {
    ward_id: 'W21',
    ward_name: 'Ward 21 (Kalpetta Town)',
    district: 'Wayanad',
    risk_score: 64,
    risk_band: 'ALERT',
    confidence: 78,
    contributions: {
      rainfall: 24,
      river_trend: 18,
      slope_saturation: 12,
      historical_incidents: 10
    },
    exposure: {
      population: 4150,
      schools: 12,
      hospitals: 4,
      shelters: 4
    },
    recommended_action: 'MONITOR URBAN DRAINAGE & SLUICE GATES',
    supporting_actions: [
      'Inspect low-lying urban culverts and storm drains',
      'Issue traffic rerouting advisory near bypass road',
      'Place municipal dewatering pumps on standby'
    ],
    coordinates: [11.609, 76.082],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.06, 11.58],
        [76.11, 11.58],
        [76.12, 11.64],
        [76.07, 11.63],
        [76.06, 11.58]
      ]]
    }
  },
  {
    ward_id: 'W05',
    ward_name: 'Ward 05 (Sulthan Bathery)',
    district: 'Wayanad',
    risk_score: 48,
    risk_band: 'ALERT',
    confidence: 82,
    contributions: {
      rainfall: 18,
      river_trend: 14,
      slope_saturation: 9,
      historical_incidents: 7
    },
    exposure: {
      population: 3600,
      schools: 9,
      hospitals: 2,
      shelters: 3
    },
    recommended_action: 'RESTRICT WATERWAY ACCESS & MONITOR SWELL',
    supporting_actions: [
      'Issue riverbank access warnings',
      'Inspect community flood shelters'
    ],
    coordinates: [11.660, 76.250],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.20, 11.63],
        [76.28, 11.63],
        [76.29, 11.69],
        [76.21, 11.68],
        [76.20, 11.63]
      ]]
    }
  },
  {
    ward_id: 'W11',
    ward_name: 'Ward 11 (Mananthavady)',
    district: 'Wayanad',
    risk_score: 32,
    risk_band: 'MONITOR',
    confidence: 88,
    contributions: {
      rainfall: 12,
      river_trend: 10,
      slope_saturation: 6,
      historical_incidents: 4
    },
    exposure: {
      population: 2900,
      schools: 6,
      hospitals: 2,
      shelters: 2
    },
    recommended_action: 'ROUTINE WEATHER MONITORING',
    supporting_actions: [
      'Maintain standard 6-hour data update cycle',
      'Verify wireless communication links'
    ],
    coordinates: [11.800, 76.000],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [75.95, 11.76],
        [76.04, 11.76],
        [76.05, 11.83],
        [75.96, 11.82],
        [75.95, 11.76]
      ]]
    }
  },
  {
    ward_id: 'W07',
    ward_name: 'Ward 07 (Thirunelly)',
    district: 'Wayanad',
    risk_score: 28,
    risk_band: 'MONITOR',
    confidence: 85,
    contributions: {
      rainfall: 10,
      river_trend: 8,
      slope_saturation: 6,
      historical_incidents: 4
    },
    exposure: {
      population: 1400,
      schools: 4,
      hospitals: 1,
      shelters: 1
    },
    recommended_action: 'MONITOR WEATHER ADVISORIES',
    supporting_actions: [
      'Normal operational status'
    ],
    coordinates: [11.900, 75.980],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [75.93, 11.85],
        [76.02, 11.85],
        [76.03, 11.93],
        [75.94, 11.92],
        [75.93, 11.85]
      ]]
    }
  }
];

export function getDistrictExposurePoints(districtId = 'wayanad') {
  const dist = PILOT_DISTRICTS.find(d => d.id === districtId) || PILOT_DISTRICTS[0];
  
  if (dist.id === 'wayanad') {
    return MOCK_EXPOSURE_POINTS;
  }

  const exposureProfiles = {
    kamrup: [
      { id: 'exp-kmr-1', name: 'Chandmari Higher Secondary School', type: 'school', ward_id: 'W04', lat: dist.lat + 0.012, lng: dist.lng + 0.011, capacity: 750 },
      { id: 'exp-kmr-2', name: 'Guwahati Medical College & Hospital (GMCH)', type: 'hospital', ward_id: 'W12', lat: dist.lat - 0.008, lng: dist.lng - 0.009, beds: 500 },
      { id: 'exp-kmr-3', name: 'Dispur Emergency Relief Shelter', type: 'shelter', ward_id: 'W12', lat: dist.lat - 0.011, lng: dist.lng - 0.012, capacity: 400 },
      { id: 'exp-kmr-4', name: 'Jalukbari Primary Health Centre', type: 'hospital', ward_id: 'W08', lat: dist.lat - 0.018, lng: dist.lng + 0.019, beds: 45 },
      { id: 'exp-kmr-5', name: 'Cotton University Emergency Shelter', type: 'school', ward_id: 'W01', lat: dist.lat + 0.019, lng: dist.lng - 0.018, capacity: 900 }
    ],
    dibrugarh: [
      { id: 'exp-dib-1', name: 'Assam Medical College & Hospital (AMCH)', type: 'hospital', ward_id: 'W04', lat: dist.lat + 0.008, lng: dist.lng - 0.028, beds: 400 },
      { id: 'exp-dib-2', name: 'Maijan Embankment Relief Camp', type: 'shelter', ward_id: 'W03', lat: dist.lat + 0.011, lng: dist.lng + 0.009, capacity: 600 },
      { id: 'exp-dib-3', name: 'Chowkidinghee Higher Secondary School', type: 'school', ward_id: 'W07', lat: dist.lat - 0.009, lng: dist.lng - 0.011, capacity: 550 },
      { id: 'exp-dib-4', name: 'Graham Bazar Primary Health Center', type: 'hospital', ward_id: 'W01', lat: dist.lat - 0.018, lng: dist.lng + 0.018, beds: 30 }
    ],
    shimla: [
      { id: 'exp-sml-1', name: 'Indira Gandhi Medical College (IGMC Shimla)', type: 'hospital', ward_id: 'W11', lat: dist.lat - 0.008, lng: dist.lng - 0.009, beds: 350 },
      { id: 'exp-sml-2', name: 'Himachal Pradesh University Relief Shelter', type: 'school', ward_id: 'W05', lat: dist.lat + 0.011, lng: dist.lng + 0.011, capacity: 800 },
      { id: 'exp-sml-3', name: 'Sanjauli Civil Hospital', type: 'hospital', ward_id: 'W02', lat: dist.lat - 0.019, lng: dist.lng + 0.018, beds: 60 },
      { id: 'exp-sml-4', name: 'Chotta Shimla Govt Senior Secondary School', type: 'school', ward_id: 'W08', lat: dist.lat + 0.018, lng: dist.lng - 0.019, capacity: 450 }
    ],
    cachar: [
      { id: 'exp-cac-1', name: 'Silchar Civil Hospital', type: 'hospital', ward_id: 'W02', lat: dist.lat - 0.009, lng: dist.lng - 0.011, beds: 200 },
      { id: 'exp-cac-2', name: 'Tarapur Barak Embankment Shelter', type: 'shelter', ward_id: 'W06', lat: dist.lat + 0.011, lng: dist.lng + 0.009, capacity: 500 },
      { id: 'exp-cac-3', name: 'NIT Silchar Disaster Response Center', type: 'school', ward_id: 'W01', lat: dist.lat + 0.028, lng: dist.lng + 0.011, capacity: 700 }
    ],
    idukki: [
      { id: 'exp-idk-1', name: 'Munnar High Altitude Relief Hospital', type: 'hospital', ward_id: 'W12', lat: dist.lat + 0.011, lng: dist.lng + 0.009, beds: 80 },
      { id: 'exp-idk-2', name: 'Kattappana St. George Higher Secondary School', type: 'school', ward_id: 'W04', lat: dist.lat - 0.009, lng: dist.lng - 0.011, capacity: 600 },
      { id: 'exp-idk-3', name: 'Cheruthoni Dam Emergency Operations Center', type: 'shelter', ward_id: 'W08', lat: dist.lat - 0.018, lng: dist.lng + 0.019, capacity: 350 }
    ],
    pathanamthitta: [
      { id: 'exp-pta-1', name: 'Ranni Pamba Relief Shelter', type: 'shelter', ward_id: 'W08', lat: dist.lat + 0.011, lng: dist.lng + 0.009, capacity: 650 },
      { id: 'exp-pta-2', name: 'Konni Govt General Hospital', type: 'hospital', ward_id: 'W03', lat: dist.lat - 0.009, lng: dist.lng - 0.011, beds: 120 },
      { id: 'exp-pta-3', name: 'Adoor St. Mary High School', type: 'school', ward_id: 'W05', lat: dist.lat - 0.018, lng: dist.lng + 0.019, capacity: 500 }
    ]
  };

  return exposureProfiles[dist.id] || exposureProfiles['kamrup'];
}

export const MOCK_EXPOSURE_POINTS = [
  { id: 'exp-1', name: 'Meppadi Higher Secondary School', type: 'school', ward_id: 'W14', lat: 11.553, lng: 76.126, capacity: 600 },
  { id: 'exp-2', name: 'Vellarimala Primary Health Center', type: 'hospital', ward_id: 'W14', lat: 11.550, lng: 76.122, beds: 25 },
  { id: 'exp-3', name: 'Vythiri Community Hospital', type: 'hospital', ward_id: 'W09', lat: 11.554, lng: 76.043, beds: 40 },
  { id: 'exp-4', name: 'Kalpetta General Hospital', type: 'hospital', ward_id: 'W21', lat: 11.611, lng: 76.084, beds: 150 },
  { id: 'exp-5', name: 'St. Joseph Higher Secondary School', type: 'school', ward_id: 'W21', lat: 11.607, lng: 76.080, capacity: 850 },
  { id: 'exp-6', name: 'Panamaram Govt High School', type: 'school', ward_id: 'W02', lat: 11.722, lng: 76.072, capacity: 500 }
];

export const MOCK_ALERTS = [
  {
    id: 'PRAHARI-W14-001',
    severity: 'CRITICAL',
    hazard_type: 'Flood + Landslide Fusion',
    ward_id: 'W14',
    ward_name: 'Ward 14 (Meppadi / Vellarimala)',
    risk_score: 82,
    confidence: 84,
    issued_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    recommended_action: 'Evacuate low-lying households & slope areas immediately',
    affected_population: 2840,
    status: 'ACTIVE',
    dissemination_status: 'SIMULATED',
    cap_structure: {
      identifier: 'PRAHARI-W14-001',
      sender: 'prahari-ai@ndma.gov.in',
      sent: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: {
        category: 'Safety',
        event: 'Severe Flood and Landslide Hazard',
        urgency: 'Immediate',
        severity: 'Extreme',
        certainty: 'Observed',
        headline: 'CRITICAL RISK: Evacuate low-lying & steep slope households in Ward 14 Meppadi',
        description: 'Cumulative 24hr rainfall exceeding 240mm with river gauge crossing warning mark and high slope soil moisture saturation.',
        instruction: 'Evacuate immediately to designated relief shelter at Meppadi High School. Avoid riverbanks and vulnerable landslide paths.',
        area: {
          areaDesc: 'Ward 14 (Meppadi / Vellarimala), Wayanad District, Kerala',
          circle: '11.551,76.124,3000'
        }
      }
    }
  },
  {
    id: 'PRAHARI-W09-002',
    severity: 'CRITICAL',
    hazard_type: 'Landslide Risk',
    ward_id: 'W09',
    ward_name: 'Ward 09 (Vythiri)',
    risk_score: 76,
    confidence: 81,
    issued_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    recommended_action: 'Prepare evacuation of slope households',
    affected_population: 1920,
    status: 'ACTIVE',
    dissemination_status: 'SIMULATED',
    cap_structure: {
      identifier: 'PRAHARI-W09-002',
      sender: 'prahari-ai@ndma.gov.in',
      sent: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: {
        category: 'Safety',
        event: 'Slope Saturation Landslide Threat',
        urgency: 'Expected',
        severity: 'Severe',
        certainty: 'Likely',
        headline: 'PREPARE EVACUATION: High landslide hazard in Ward 09 Vythiri slope zones',
        description: 'Continuous heavy rainfall has saturated slope soils near Vythiri ghat corridor.',
        instruction: 'High ground slope residents move to designated relief shelters.',
        area: {
          areaDesc: 'Ward 09 (Vythiri), Wayanad',
          circle: '11.552,76.041,2500'
        }
      }
    }
  },
  {
    id: 'PRAHARI-W18-003',
    severity: 'CRITICAL',
    hazard_type: 'Dam Outflow Flood',
    ward_id: 'W18',
    ward_name: 'Ward 18 (Thariode / Banasura)',
    risk_score: 72,
    confidence: 83,
    issued_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    recommended_action: 'Evacuate dam downstream riverbank households',
    affected_population: 1650,
    status: 'ACTIVE',
    dissemination_status: 'SIMULATED',
    cap_structure: {
      identifier: 'PRAHARI-W18-003',
      sender: 'prahari-ai@ndma.gov.in',
      sent: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: {
        category: 'Safety',
        event: 'Downstream Inundation Hazard',
        urgency: 'Expected',
        severity: 'Severe',
        certainty: 'Likely',
        headline: 'EVACUATE RIVERBANK: Banasura Sagar dam spillway discharge alert',
        description: 'Controlled release from Banasura reservoir expected to elevate river level by 1.8 meters in Ward 18.',
        instruction: 'Move livestock and personnel 100m away from river channels.',
        area: {
          areaDesc: 'Ward 18 (Thariode), Wayanad',
          circle: '11.670,75.960,2000'
        }
      }
    }
  },
  {
    id: 'PRAHARI-W02-004',
    severity: 'ALERT',
    hazard_type: 'Riverine Flood',
    ward_id: 'W02',
    ward_name: 'Ward 02 (Panamaram)',
    risk_score: 68,
    confidence: 79,
    issued_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    recommended_action: 'Alert riverbank communities & position rescue inflatable boats',
    affected_population: 2100,
    status: 'ACTIVE',
    dissemination_status: 'SIMULATED',
    cap_structure: {
      identifier: 'PRAHARI-W02-004',
      sender: 'prahari-ai@ndma.gov.in',
      sent: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: {
        category: 'Safety',
        event: 'River Flood Advisory',
        urgency: 'Future',
        severity: 'Moderate',
        certainty: 'Possible',
        headline: 'RIVER FLOOD ADVISORY: Kabini river level rising in Ward 02 Panamaram',
        description: 'Upstream rainfall causing steady rise in Kabini river gauge.',
        instruction: 'Riverbank residents keep emergency kits ready.',
        area: {
          areaDesc: 'Ward 02 (Panamaram), Wayanad',
          circle: '11.720,76.070,2500'
        }
      }
    }
  },
  {
    id: 'PRAHARI-W21-005',
    severity: 'ALERT',
    hazard_type: 'Urban Waterlogging',
    ward_id: 'W21',
    ward_name: 'Ward 21 (Kalpetta Town)',
    risk_score: 64,
    confidence: 78,
    issued_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    recommended_action: 'Monitor drainage sluice gates and prepare urban pumps',
    affected_population: 4150,
    status: 'ACTIVE',
    dissemination_status: 'SIMULATED',
    cap_structure: {
      identifier: 'PRAHARI-W21-005',
      sender: 'prahari-ai@ndma.gov.in',
      sent: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: {
        category: 'Safety',
        event: 'Urban Waterlogging Advisory',
        urgency: 'Future',
        severity: 'Moderate',
        certainty: 'Possible',
        headline: 'URBAN ADVISORY: Kalpetta town low-lying culvert drainage bottleneck',
        description: 'Intensity of rainfall exceeding urban drainage capacity near main town market.',
        instruction: 'Avoid parking vehicles in low-lying bypass road segments.',
        area: {
          areaDesc: 'Ward 21 (Kalpetta Town), Wayanad',
          circle: '11.609,76.082,2000'
        }
      }
    }
  }
];

export const HISTORICAL_EVENTS_LIST = [
  { id: 'wayanad-2024', title: 'Wayanad July 2024 (Landslides & Floods)' },
  { id: 'kamrup-2022', title: 'Guwahati June 2022 (Urban Flash Floods & Landslides)' },
  { id: 'shimla-2023', title: 'Shimla August 2023 (Cloudburst & Slope Failures)' },
  { id: 'dibrugarh-2020', title: 'Dibrugarh July 2020 (Brahmaputra Embankment Breach)' },
  { id: 'cachar-2022', title: 'Silchar June 2022 (Great Barak Valley Inundation)' },
  { id: 'idukki-2020', title: 'Pettimudi Idukki August 2020 (Landslide)' },
  { id: 'pathanamthitta-2018', title: 'Pathanamthitta August 2018 (Pamba River Overflow)' }
];

export function getBacktestData(eventId = 'wayanad-2024') {
  const events = {
    'wayanad-2024': {
      id: 'wayanad-2024',
      title: 'Wayanad Landslides & Floods (July 2024)',
      district: 'Wayanad',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 18,
      official_event_time: '2024-07-30T02:00:00Z',
      critical_crossed_time: '2024-07-29T08:00:00Z',
      summary: 'PRAHARI-AI risk fusion engine crossed the Critical threshold 18 hours prior to official NDRF deployment and event confirmation in Meppadi & Chooralmala.',
      timeline: [
        { time: '2024-07-28 00:00', risk_score: 24, rainfall_mm: 35, threshold: 70 },
        { time: '2024-07-28 06:00', risk_score: 32, rainfall_mm: 58, threshold: 70 },
        { time: '2024-07-28 12:00', risk_score: 41, rainfall_mm: 92, threshold: 70 },
        { time: '2024-07-28 18:00', risk_score: 53, rainfall_mm: 140, threshold: 70 },
        { time: '2024-07-29 00:00', risk_score: 62, rainfall_mm: 195, threshold: 70 },
        { time: '2024-07-29 06:00', risk_score: 68, rainfall_mm: 260, threshold: 70 },
        { time: '2024-07-29 08:00', risk_score: 74, rainfall_mm: 310, threshold: 70, is_threshold_cross: true },
        { time: '2024-07-29 12:00', risk_score: 83, rainfall_mm: 380, threshold: 70 },
        { time: '2024-07-29 18:00', risk_score: 89, rainfall_mm: 440, threshold: 70 },
        { time: '2024-07-30 02:00', risk_score: 96, rainfall_mm: 510, threshold: 70, is_event_time: true },
        { time: '2024-07-30 06:00', risk_score: 94, rainfall_mm: 480, threshold: 70 },
        { time: '2024-07-30 12:00', risk_score: 86, rainfall_mm: 320, threshold: 70 }
      ]
    },
    'kamrup-2022': {
      id: 'kamrup-2022',
      title: 'Guwahati Urban Flash Floods & Landslides (June 2022)',
      district: 'Kamrup Metro (Guwahati)',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 14,
      official_event_time: '2022-06-14T04:00:00Z',
      critical_crossed_time: '2022-06-13T14:00:00Z',
      summary: 'PRAHARI-AI identified severe urban drainage saturation and hillside slope erosion 14 hours ahead of major waterlogging in Chandmari & Zoo Road.',
      timeline: [
        { time: '2022-06-12 12:00', risk_score: 28, rainfall_mm: 22, threshold: 70 },
        { time: '2022-06-12 18:00', risk_score: 36, rainfall_mm: 45, threshold: 70 },
        { time: '2022-06-13 00:00', risk_score: 48, rainfall_mm: 88, threshold: 70 },
        { time: '2022-06-13 06:00', risk_score: 59, rainfall_mm: 125, threshold: 70 },
        { time: '2022-06-13 14:00', risk_score: 72, rainfall_mm: 180, threshold: 70, is_threshold_cross: true },
        { time: '2022-06-13 20:00', risk_score: 81, rainfall_mm: 220, threshold: 70 },
        { time: '2022-06-14 04:00', risk_score: 92, rainfall_mm: 285, threshold: 70, is_event_time: true },
        { time: '2022-06-14 10:00', risk_score: 85, rainfall_mm: 210, threshold: 70 }
      ]
    },
    'shimla-2023': {
      id: 'shimla-2023',
      title: 'Shimla Cloudburst & Slope Failures (August 2023)',
      district: 'Shimla',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 22,
      official_event_time: '2023-08-14T07:00:00Z',
      critical_crossed_time: '2023-08-13T09:00:00Z',
      summary: 'PRAHARI-AI slope saturation telemetry crossed the critical threshold 22 hours prior to the Summer Hill Shiv Temple landslide.',
      timeline: [
        { time: '2023-08-12 06:00', risk_score: 22, rainfall_mm: 18, threshold: 70 },
        { time: '2023-08-12 18:00', risk_score: 35, rainfall_mm: 42, threshold: 70 },
        { time: '2023-08-13 00:00', risk_score: 52, rainfall_mm: 95, threshold: 70 },
        { time: '2023-08-13 09:00', risk_score: 73, rainfall_mm: 160, threshold: 70, is_threshold_cross: true },
        { time: '2023-08-13 18:00', risk_score: 84, rainfall_mm: 240, threshold: 70 },
        { time: '2023-08-14 07:00', risk_score: 97, rainfall_mm: 340, threshold: 70, is_event_time: true },
        { time: '2023-08-14 15:00', risk_score: 88, rainfall_mm: 280, threshold: 70 }
      ]
    },
    'dibrugarh-2020': {
      id: 'dibrugarh-2020',
      title: 'Dibrugarh Brahmaputra Embankment Breach (July 2020)',
      district: 'Dibrugarh',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 16,
      official_event_time: '2020-07-10T12:00:00Z',
      critical_crossed_time: '2020-07-09T20:00:00Z',
      summary: 'PRAHARI-AI river gauge trend model flagged critical inundation risk 16 hours before Maijan embankment breach.',
      timeline: [
        { time: '2020-07-08 12:00', risk_score: 30, rainfall_mm: 40, threshold: 70 },
        { time: '2020-07-09 00:00', risk_score: 45, rainfall_mm: 85, threshold: 70 },
        { time: '2020-07-09 12:00', risk_score: 61, rainfall_mm: 140, threshold: 70 },
        { time: '2020-07-09 20:00', risk_score: 75, rainfall_mm: 195, threshold: 70, is_threshold_cross: true },
        { time: '2020-07-10 04:00', risk_score: 86, rainfall_mm: 260, threshold: 70 },
        { time: '2020-07-10 12:00', risk_score: 94, rainfall_mm: 310, threshold: 70, is_event_time: true },
        { time: '2020-07-10 20:00', risk_score: 89, rainfall_mm: 270, threshold: 70 }
      ]
    },
    'cachar-2022': {
      id: 'cachar-2022',
      title: 'Silchar Great Barak Valley Inundation (June 2022)',
      district: 'Cachar (Silchar)',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 24,
      official_event_time: '2022-06-20T06:00:00Z',
      critical_crossed_time: '2022-06-19T06:00:00Z',
      summary: 'PRAHARI-AI predicted catastrophic 100% town submergence 24 hours prior to Bethukandi dyke breach in Silchar.',
      timeline: [
        { time: '2022-06-18 00:00', risk_score: 32, rainfall_mm: 50, threshold: 70 },
        { time: '2022-06-18 12:00', risk_score: 46, rainfall_mm: 110, threshold: 70 },
        { time: '2022-06-19 00:00', risk_score: 63, rainfall_mm: 190, threshold: 70 },
        { time: '2022-06-19 06:00', risk_score: 76, rainfall_mm: 240, threshold: 70, is_threshold_cross: true },
        { time: '2022-06-19 18:00', risk_score: 88, rainfall_mm: 330, threshold: 70 },
        { time: '2022-06-20 06:00', risk_score: 98, rainfall_mm: 450, threshold: 70, is_event_time: true },
        { time: '2022-06-20 18:00', risk_score: 95, rainfall_mm: 410, threshold: 70 }
      ]
    },
    'idukki-2020': {
      id: 'idukki-2020',
      title: 'Pettimudi Idukki Landslide Disaster (August 2020)',
      district: 'Idukki',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 20,
      official_event_time: '2020-08-06T22:00:00Z',
      critical_crossed_time: '2020-08-06T02:00:00Z',
      summary: 'PRAHARI-AI soil moisture saturation index crossed 70 critical mark 20 hours prior to Pettimudi tea estate landslide.',
      timeline: [
        { time: '2020-08-05 06:00', risk_score: 25, rainfall_mm: 30, threshold: 70 },
        { time: '2020-08-05 18:00', risk_score: 42, rainfall_mm: 85, threshold: 70 },
        { time: '2020-08-06 02:00', risk_score: 73, rainfall_mm: 175, threshold: 70, is_threshold_cross: true },
        { time: '2020-08-06 12:00', risk_score: 85, rainfall_mm: 260, threshold: 70 },
        { time: '2020-08-06 22:00', risk_score: 95, rainfall_mm: 370, threshold: 70, is_event_time: true },
        { time: '2020-08-07 08:00', risk_score: 90, rainfall_mm: 310, threshold: 70 }
      ]
    },
    'pathanamthitta-2018': {
      id: 'pathanamthitta-2018',
      title: 'Pathanamthitta Pamba River Inundation (August 2018)',
      district: 'Pathanamthitta',
      critical_threshold: 70,
      critical_crossed: true,
      lead_time_hours: 19,
      official_event_time: '2018-08-16T08:00:00Z',
      critical_crossed_time: '2018-08-15T13:00:00Z',
      summary: 'PRAHARI-AI multi-dam discharge model issued 19-hour early warning for Ranni & Kozhencherry downstream flooding.',
      timeline: [
        { time: '2018-08-14 12:00', risk_score: 28, rainfall_mm: 45, threshold: 70 },
        { time: '2018-08-15 00:00', risk_score: 44, rainfall_mm: 105, threshold: 70 },
        { time: '2018-08-15 13:00', risk_score: 74, rainfall_mm: 210, threshold: 70, is_threshold_cross: true },
        { time: '2018-08-15 22:00', risk_score: 86, rainfall_mm: 310, threshold: 70 },
        { time: '2018-08-16 08:00', risk_score: 96, rainfall_mm: 420, threshold: 70, is_event_time: true },
        { time: '2018-08-16 18:00', risk_score: 91, rainfall_mm: 380, threshold: 70 }
      ]
    }
  };

  const selectedEvent = events[eventId] || events['wayanad-2024'];

  return {
    events_list: HISTORICAL_EVENTS_LIST,
    active_event: selectedEvent
  };
}

export const MOCK_BACKTEST = getBacktestData('wayanad-2024');

export const MOCK_DATA_SOURCES = [
  {
    id: 'open-meteo',
    name: 'Open-Meteo Weather API',
    data_type: 'Rainfall & Atmospheric Telemetry',
    status: 'LIVE',
    last_updated: '2 minutes ago',
    latency_ms: 180,
    provider: 'Open-Meteo GFS/ECMWF Ensemble',
    fallback_mode: 'Cached 3-hour ensemble forecast'
  },
  {
    id: 'cwc',
    name: 'Central Water Commission (CWC)',
    data_type: 'River Basin Levels & Flow Telemetry',
    status: 'LIVE',
    last_updated: '14 minutes ago',
    latency_ms: 420,
    provider: 'CWC Telemetric Hydrological Station Network',
    fallback_mode: 'Last known good river stage snapshot'
  },
  {
    id: 'bhuvan',
    name: 'ISRO Bhuvan Geo-Portal',
    data_type: 'High-Res DEM & Soil Slope Saturation',
    status: 'CACHED',
    last_updated: '6 hours ago',
    latency_ms: 650,
    provider: 'ISRO Cartosat DEM + Bhuvan Slope',
    fallback_mode: 'Cached 10m spatial DEM raster'
  },
  {
    id: 'osm-overpass',
    name: 'OpenStreetMap / Overpass API',
    data_type: 'Schools, Hospitals & Road Infrastructure',
    status: 'LIVE',
    last_updated: '1 hour ago',
    latency_ms: 310,
    provider: 'Overpass API Infrastructure Query',
    fallback_mode: 'Local PostGIS spatial feature cache'
  },
  {
    id: 'census-secc',
    name: 'Census & SECC Demographics',
    data_type: 'Ward-level Vulnerable Population Counts',
    status: 'STATIC',
    last_updated: 'Static Baseline',
    latency_ms: 5,
    provider: 'Office of the Registrar General & Census Commissioner',
    fallback_mode: 'Static baseline population database'
  }
];

export const MOCK_SYSTEM_STATUS = {
  overall: 'OPERATIONAL',
  last_ingestion: {
    rainfall: '2 mins ago (Open-Meteo)',
    river: '14 mins ago (CWC)',
    bhuvan_sync: '6 hours ago'
  },
  services: [
    { name: 'FastAPI Microservice Engine', status: 'OPERATIONAL', uptime: '99.98%', latency: '24ms' },
    { name: 'PostgreSQL / PostGIS Database', status: 'OPERATIONAL', uptime: '100.00%', latency: '12ms' },
    { name: 'Risk Fusion Pipeline Scheduler', status: 'RUNNING', uptime: '99.95%', latency: '8ms' },
    { name: 'CAP Alert Broadcast Gateway', status: 'OPERATIONAL (SIMULATED)', uptime: '100.00%', latency: '45ms' },
    { name: 'Vite React Web Frontend', status: 'OPERATIONAL', uptime: '100.00%', latency: '2ms' }
  ]
};

export const MOCK_FEEDBACK_HISTORY = [
  {
    id: 'FB-901',
    ward_id: 'W14',
    ward_name: 'Ward 14 (Meppadi)',
    predicted_impact: 'CRITICAL (82)',
    actual_outcome: 'CONFIRMED',
    official_notes: 'Landslide occurred at Vellarimala slope as anticipated by rainfall-slope saturation fusion.',
    timestamp: '2026-08-10T14:30:00Z'
  },
  {
    id: 'FB-902',
    ward_id: 'W09',
    ward_name: 'Ward 09 (Vythiri)',
    predicted_impact: 'CRITICAL (76)',
    actual_outcome: 'PARTIALLY_CONFIRMED',
    official_notes: 'Minor slope slippage recorded; road blocked but no residential damages.',
    timestamp: '2026-08-11T09:15:00Z'
  }
];
