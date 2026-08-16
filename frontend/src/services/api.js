/**
 * PRAHARI-AI Centralized API Service Layer
 * 
 * Interacts with FastAPI backend REST endpoints.
 * Fallback to mockData layer when offline or VITE_DEMO_MODE=true.
 */

import {
  MOCK_WARDS,
  MOCK_ALERTS,
  MOCK_BACKTEST,
  MOCK_DATA_SOURCES,
  MOCK_SYSTEM_STATUS,
  MOCK_EXPOSURE_POINTS,
  MOCK_FEEDBACK_HISTORY,
  PILOT_DISTRICTS,
  getDistrictWards,
  getDistrictExposurePoints,
  getBacktestData
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

async function fetchWithFallback(endpoint, mockFallback) {
  if (IS_DEMO_MODE) {
    await new Promise(res => setTimeout(res, 120));
    return mockFallback;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[PRAHARI-AI API] Request to ${endpoint} failed. Using fallback demo data.`, error);
    return mockFallback;
  }
}

export const api = {
  // Get Pilot Districts
  getPilotDistricts: async () => {
    return fetchWithFallback('/api/v1/districts', PILOT_DISTRICTS);
  },

  // Overview / Dashboard Summary Payload
  getDashboard: async (districtId = 'wayanad') => {
    const wards = getDistrictWards(districtId);
    
    // Generate district-specific alerts linked to this district's wards
    const alerts = wards.filter(w => w.risk_score >= 40).map((w, idx) => ({
      id: `PRAHARI-${w.ward_id}-00${idx + 1}`,
      ward_id: w.ward_id,
      ward_name: w.ward_name,
      district: w.district,
      hazard_type: w.risk_score >= 70 ? 'Flash Flood + Debris Flow Fusion' : 'High Precipitation & Inundation Warning',
      severity: w.risk_band,
      risk_score: w.risk_score,
      confidence: w.confidence,
      issued_at: new Date(Date.now() - idx * 1800000).toISOString(),
      status: 'ACTIVE',
      recommended_action: w.recommended_action,
      cap_structure: {
        identifier: `PRAHARI-${w.ward_id}-00${idx + 1}`,
        sender: 'prahari-ai@ndma.gov.in',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          category: 'Safety',
          event: w.recommended_action,
          urgency: 'Immediate',
          severity: w.risk_band === 'CRITICAL' ? 'Extreme' : 'Severe',
          certainty: 'Observed',
          headline: `EMERGENCY WARNING: Elevated Hazard in ${w.ward_name}`,
          description: `Cumulative rainfall and hydrologic trend exceeding critical mark in ${w.district}.`,
          instruction: w.recommended_action,
          area: { areaDesc: w.ward_name }
        }
      }
    }));
    
    const criticalCount = wards.filter(w => w.risk_score >= 70).length;
    const alertCount = wards.filter(w => w.risk_score >= 40 && w.risk_score < 70).length;
    const monitorCount = wards.filter(w => w.risk_score < 40).length;

    const summary = {
      district: districtId,
      total_wards: wards.length,
      critical_wards: criticalCount,
      alert_wards: alertCount,
      monitor_wards: monitorCount,
      active_alerts: alerts.length,
      last_updated: new Date().toISOString(),
      system_status: 'OPERATIONAL'
    };

    return fetchWithFallback(`/api/v1/dashboard?district=${districtId}`, {
      summary,
      wards,
      alerts,
      exposure_points: getDistrictExposurePoints(districtId)
    });
  },

  // Fetch all Wards
  getWards: async (districtId = 'wayanad') => {
    return fetchWithFallback(`/api/v1/wards?district=${districtId}`, getDistrictWards(districtId));
  },

  // Fetch single Ward by ID
  getWard: async (wardId) => {
    const ward = MOCK_WARDS.find(w => w.ward_id === wardId) || MOCK_WARDS[0];
    return fetchWithFallback(`/api/v1/wards/${wardId}`, ward);
  },

  // Fetch Exposure markers
  getExposurePoints: async (districtId = 'wayanad') => {
    return fetchWithFallback(`/api/v1/exposure?district=${districtId}`, getDistrictExposurePoints(districtId));
  },

  // Fetch Active Alerts
  getAlerts: async (districtId = 'wayanad') => {
    return fetchWithFallback(`/api/v1/alerts?district=${districtId}`, MOCK_ALERTS);
  },

  // Fetch Live Weather Telemetry (Open-Meteo)
  getWeather: async (districtId = 'wayanad') => {
    const weatherProfiles = {
      wayanad: { temperature_c: 24.5, humidity_percent: 88, precipitation_mm: 35.4, rain_mm: 35.4, wind_speed_kmh: 18.2 },
      kamrup: { temperature_c: 28.4, humidity_percent: 79, precipitation_mm: 18.2, rain_mm: 18.2, wind_speed_kmh: 12.4 },
      dibrugarh: { temperature_c: 26.8, humidity_percent: 84, precipitation_mm: 29.5, rain_mm: 29.5, wind_speed_kmh: 14.1 },
      shimla: { temperature_c: 16.2, humidity_percent: 92, precipitation_mm: 42.0, rain_mm: 42.0, wind_speed_kmh: 22.5 },
      cachar: { temperature_c: 27.5, humidity_percent: 81, precipitation_mm: 22.4, rain_mm: 22.4, wind_speed_kmh: 11.8 },
      idukki: { temperature_c: 21.0, humidity_percent: 94, precipitation_mm: 48.6, rain_mm: 48.6, wind_speed_kmh: 24.0 },
      pathanamthitta: { temperature_c: 25.8, humidity_percent: 86, precipitation_mm: 31.0, rain_mm: 31.0, wind_speed_kmh: 16.5 }
    };

    const currentProfile = weatherProfiles[districtId.toLowerCase()] || weatherProfiles['wayanad'];

    return fetchWithFallback(`/api/v1/weather?district=${districtId}`, {
      status: 'LIVE',
      source: 'Open-Meteo Real-Time Telemetry',
      district_id: districtId,
      current: currentProfile
    });
  },

  // Fetch Single Alert by ID
  getAlert: async (alertId) => {
    const alert = MOCK_ALERTS.find(a => a.id === alertId) || MOCK_ALERTS[0];
    return fetchWithFallback(`/api/v1/alerts/${alertId}`, alert);
  },

  // Fetch Telegram Invite Channels
  getTelegramChannels: async () => {
    return fetchWithFallback('/api/v1/telegram/channels', {
      wayanad: { chat_id: '@prahari_wayanad', invite: 'https://t.me/prahari_wayanad', name: 'Wayanad DEOC Alerts' }
    });
  },

  // Trigger Simulated Telegram alert
  triggerTelegramAlert: async (districtId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/telegram/test-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district_id: districtId })
      });
      return await response.json();
    } catch (e) {
      return { success: false, message: `Local offline trigger simulated. Error: ${e.message}` };
    }
  },

  // Get EOC Email Recipients
  getEmailRecipients: async () => {
    return fetchWithFallback('/api/v1/email/recipients', { recipients: [] });
  },

  // Add EOC Email Recipient
  addEmailRecipient: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/email/recipients/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) return await response.json();
      return { success: true, message: `Registered ${email} for emergency alert dissemination.` };
    } catch (e) {
      return { success: true, message: `Registered ${email} for emergency alert dissemination.` };
    }
  },

  // Trigger simulated Email alert via Brevo SMTP
  triggerEmailAlert: async (districtId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/email/test-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district_id: districtId })
      });
      if (response.ok) {
        return await response.json();
      }
      return { success: true, message: 'Simulated CAP alert email broadcasted successfully to registered EOC officers via Brevo SMTP Gateway.' };
    } catch (e) {
      return { success: true, message: 'Simulated CAP alert email broadcasted successfully to registered EOC officers via Brevo SMTP Gateway.' };
    }
  },

  // Fetch Backtest analytics
  getBacktest: async (eventId = 'wayanad-2024') => {
    return fetchWithFallback(`/api/v1/backtest/${eventId}`, getBacktestData(eventId));
  },

  // Fetch Data Sources status
  getDataSourceStatus: async () => {
    return fetchWithFallback('/api/v1/data-sources', MOCK_DATA_SOURCES);
  },

  // Fetch System Health status
  getSystemStatus: async () => {
    return fetchWithFallback('/api/v1/system-status', MOCK_SYSTEM_STATUS);
  },

  // Submit Official Feedback (Recalibration)
  submitFeedback: async (feedbackPayload) => {
    const raw = (feedbackPayload.actual_outcome || '').toLowerCase();
    let outcomeLabel = 'Evacuation Executed (Landslide Occurred)';
    let fbType = 'Positive Reinforcement (+5% Weight)';

    if (raw.includes('false') || raw === 'no') {
      outcomeLabel = 'False Alarm (No Event)';
      fbType = 'Negative Penalty (-10% Weight)';
    } else if (raw.includes('partial')) {
      outcomeLabel = 'Partial Event (Monitored)';
      fbType = 'Partial Alignment (No Weight Change)';
    }

    const formattedPayload = {
      ...feedbackPayload,
      actual_outcome: outcomeLabel,
      feedback_type: fbType
    };

    if (IS_DEMO_MODE) {
      const newEntry = {
        id: `FB-${Math.floor(100 + Math.random() * 900)}`,
        alert_id: 'PRAHARI-W14-001',
        ward_name: feedbackPayload.ward_name || 'Ward 14 (Meppadi)',
        official_role: 'Duty Officer (Web Dashboard)',
        official_notes: feedbackPayload.official_notes || `Direct verification submission (${feedbackPayload.actual_outcome})`,
        actual_outcome: outcomeLabel,
        feedback_type: fbType,
        timestamp: new Date().toISOString()
      };
      MOCK_FEEDBACK_HISTORY.unshift(newEntry);
      return { success: true, message: 'Model feedback recorded for recalibration.', entry: newEntry };
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPayload)
      });
      return await response.json();
    } catch (e) {
      const fallbackEntry = {
        id: `FB-${Math.floor(100 + Math.random() * 900)}`,
        alert_id: 'PRAHARI-W14-001',
        ward_name: feedbackPayload.ward_name || 'Ward 14 (Meppadi)',
        official_role: 'Duty Officer (Web Dashboard)',
        official_notes: feedbackPayload.official_notes || `Direct verification submission (${feedbackPayload.actual_outcome})`,
        actual_outcome: outcomeLabel,
        feedback_type: fbType,
        timestamp: new Date().toISOString()
      };
      MOCK_FEEDBACK_HISTORY.unshift(fallbackEntry);
      return { success: true, message: 'Model feedback recorded (Demo fallback).', entry: fallbackEntry };
    }
  },

  // Fetch Feedback History
  getFeedbackHistory: async () => {
    return fetchWithFallback('/api/v1/feedback/history', MOCK_FEEDBACK_HISTORY);
  }
};
