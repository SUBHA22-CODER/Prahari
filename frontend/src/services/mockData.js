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

export const MOCK_BACKTEST = {
  events_list: [
    { id: 'wayanad-2024', title: 'Wayanad July 2024 (Landslides & Floods)' },
    { id: 'kerala-2018', title: 'Kerala August 2018 (Great Floods)' }
  ],
  active_event: {
    id: 'wayanad-2024',
    title: 'Wayanad Landslides & Floods (July 2024)',
    district: 'Wayanad',
    critical_threshold: 70,
    critical_crossed: true,
    lead_time_hours: 18,
    official_event_time: '2024-07-30T02:00:00Z',
    critical_crossed_time: '2024-07-29T08:00:00Z',
    summary: 'PRAHARI-AI risk fusion engine crossed the Critical threshold 18 hours prior to official NDRF deployment and event confirmation.',
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
  }
};

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
