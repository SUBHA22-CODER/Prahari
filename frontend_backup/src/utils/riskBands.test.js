import { describe, it, expect } from 'vitest';
import { getRiskBand, RISK_LEVELS, getRiskBandColor } from './riskBands';

describe('PRAHARI-AI Risk Band Standard Utilities', () => {
  it('should categorize score >= 70 as CRITICAL', () => {
    expect(getRiskBand(82)).toBe(RISK_LEVELS.CRITICAL);
    expect(getRiskBand(70)).toBe(RISK_LEVELS.CRITICAL);
    expect(getRiskBand(100)).toBe(RISK_LEVELS.CRITICAL);
  });

  it('should categorize score between 40 and 69 as ALERT', () => {
    expect(getRiskBand(62)).toBe(RISK_LEVELS.ALERT);
    expect(getRiskBand(40)).toBe(RISK_LEVELS.ALERT);
    expect(getRiskBand(69.9)).toBe(RISK_LEVELS.ALERT);
  });

  it('should categorize score < 40 as MONITOR', () => {
    expect(getRiskBand(30)).toBe(RISK_LEVELS.MONITOR);
    expect(getRiskBand(0)).toBe(RISK_LEVELS.MONITOR);
    expect(getRiskBand(39)).toBe(RISK_LEVELS.MONITOR);
  });

  it('should return exact hex colors for risk levels', () => {
    expect(getRiskBandColor(82)).toBe('#DC2626'); // Red
    expect(getRiskBandColor(62)).toBe('#EA580C'); // Orange
    expect(getRiskBandColor(30)).toBe('#16A34A'); // Green
  });
});
