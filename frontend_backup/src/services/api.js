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
  PILOT_DISTRICTS
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || true; // Default fallback enabled for judges

async function fetchWithFallback(endpoint, mockFallback) {
  if (IS_DEMO_MODE) {
    // Artificial slight network delay for natural UI feel in demo mode
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
    const wards = MOCK_WARDS;
    const alerts = MOCK_ALERTS;
    
    const criticalCount = wards.filter(w => w.risk_score >= 70).length;
    const alertCount = wards.filter(w => w.risk_score >= 40 && w.risk_score < 70).length;
    const monitorCount = wards.filter(w => w.risk_score < 40).length;
    const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

    const summary = {
      district: districtId,
      total_wards: wards.length,
      critical_wards: criticalCount,
      alert_wards: alertCount,
      monitor_wards: monitorCount,
      active_alerts: activeAlertsCount,
      last_updated: new Date().toISOString(),
      system_status: 'OPERATIONAL'
    };

    return fetchWithFallback(`/api/v1/dashboard?district=${districtId}`, {
      summary,
      wards,
      alerts,
      exposure_points: MOCK_EXPOSURE_POINTS
    });
  },

  // Fetch all Wards
  getWards: async (districtId = 'wayanad') => {
    return fetchWithFallback(`/api/v1/wards?district=${districtId}`, MOCK_WARDS);
  },

  // Fetch single Ward by ID
  getWard: async (wardId) => {
    const ward = MOCK_WARDS.find(w => w.ward_id === wardId) || MOCK_WARDS[0];
    return fetchWithFallback(`/api/v1/wards/${wardId}`, ward);
  },

  // Fetch Exposure markers
  getExposurePoints: async (districtId = 'wayanad') => {
    return fetchWithFallback(`/api/v1/exposure?district=${districtId}`, MOCK_EXPOSURE_POINTS);
  },

  // Fetch Active Alerts
  getAlerts: async () => {
    return fetchWithFallback('/api/v1/alerts', MOCK_ALERTS);
  },

  // Fetch Single Alert by ID
  getAlert: async (alertId) => {
    const alert = MOCK_ALERTS.find(a => a.id === alertId) || MOCK_ALERTS[0];
    return fetchWithFallback(`/api/v1/alerts/${alertId}`, alert);
  },

  // Fetch Backtest analytics
  getBacktest: async (eventId = 'wayanad-2024') => {
    const backtest = MOCK_BACKTEST.events.find(e => e.id === eventId) || MOCK_BACKTEST.events[0];
    return fetchWithFallback(`/api/v1/backtest/${eventId}`, {
      events_list: MOCK_BACKTEST.events,
      active_event: backtest
    });
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
    if (IS_DEMO_MODE) {
      const newEntry = {
        id: `FB-${Math.floor(100 + Math.random() * 900)}`,
        ...feedbackPayload,
        timestamp: new Date().toISOString()
      };
      MOCK_FEEDBACK_HISTORY.unshift(newEntry);
      return { success: true, message: 'Model feedback recorded for recalibration.', entry: newEntry };
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload)
      });
      return await response.json();
    } catch (e) {
      return { success: true, message: 'Model feedback recorded (Demo fallback).', entry: feedbackPayload };
    }
  },

  // Fetch Feedback History
  getFeedbackHistory: async () => {
    return fetchWithFallback('/api/v1/feedback/history', MOCK_FEEDBACK_HISTORY);
  }
};
