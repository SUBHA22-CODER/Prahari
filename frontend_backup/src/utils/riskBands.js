/**
 * PRAHARI-AI Risk Band Standard Utilities
 * 
 * Standard bands:
 * 0 - 40   : MONITOR (Green)
 * 40 - 70  : ALERT (Orange)
 * 70 - 100 : CRITICAL (Red)
 */

export const RISK_LEVELS = {
  CRITICAL: 'CRITICAL',
  ALERT: 'ALERT',
  MONITOR: 'MONITOR'
};

export function getRiskBand(score) {
  const numericScore = Number(score) || 0;
  if (numericScore >= 70) return RISK_LEVELS.CRITICAL;
  if (numericScore >= 40) return RISK_LEVELS.ALERT;
  return RISK_LEVELS.MONITOR;
}

export function getRiskBandColor(score) {
  const band = typeof score === 'string' && Object.values(RISK_LEVELS).includes(score) 
    ? score 
    : getRiskBand(score);

  switch (band) {
    case RISK_LEVELS.CRITICAL:
      return '#DC2626'; // Red
    case RISK_LEVELS.ALERT:
      return '#EA580C'; // Orange
    case RISK_LEVELS.MONITOR:
    default:
      return '#16A34A'; // Green
  }
}

export function getRiskBadgeStyle(score) {
  const band = typeof score === 'string' && Object.values(RISK_LEVELS).includes(score) 
    ? score 
    : getRiskBand(score);

  switch (band) {
    case RISK_LEVELS.CRITICAL:
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badgeBg: 'bg-red-700',
        badgeText: 'text-white',
        dot: 'bg-red-600',
        hex: '#DC2626'
      };
    case RISK_LEVELS.ALERT:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-600',
        badgeText: 'text-white',
        dot: 'bg-amber-600',
        hex: '#EA580C'
      };
    case RISK_LEVELS.MONITOR:
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-600',
        badgeText: 'text-white',
        dot: 'bg-emerald-600',
        hex: '#16A34A'
      };
  }
}

export function getSeverityRank(score) {
  const band = getRiskBand(score);
  switch (band) {
    case RISK_LEVELS.CRITICAL: return 3;
    case RISK_LEVELS.ALERT: return 2;
    case RISK_LEVELS.MONITOR: return 1;
    default: return 0;
  }
}
