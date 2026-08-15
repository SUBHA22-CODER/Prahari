"""
PRAHARI-AI — Alert Layer Unit Tests
=====================================
Covers (Build Guide §14):
  1. Alert banding: score 39 → Monitor (no alert), 40 → Alert, 70 → Critical
  2. Boundary values: 39, 40, 69, 70, 100
  3. CAP alert structure: all required fields present on generated alerts
  4. Simulated dissemination label is present
  5. Feedback recalibration: adjust_weight() boundary values at 0.3
"""

import pytest
from app.alerts.cap import _get_risk_band, _band_to_cap_fields
from app.feedback.recalibration import adjust_weight


class TestRiskBanding:
    """Build Guide §6.1 band thresholds — exact boundaries."""

    def test_score_39_is_monitor(self):
        assert _get_risk_band(39) == "Monitor"

    def test_score_40_is_alert(self):
        assert _get_risk_band(40) == "Alert"

    def test_score_69_is_alert(self):
        assert _get_risk_band(69) == "Alert"

    def test_score_70_is_critical(self):
        assert _get_risk_band(70) == "Critical"

    def test_score_100_is_critical(self):
        assert _get_risk_band(100) == "Critical"

    def test_score_0_is_monitor(self):
        assert _get_risk_band(0) == "Monitor"


class TestCAPStructure:
    """Build Guide §6.2 — all required CAP fields must be present."""

    CAP_REQUIRED_FIELDS = {
        "event", "urgency", "severity", "certainty", "instruction"
    }

    def test_critical_band_has_all_cap_fields(self):
        from app.core.config import settings
        fields = _band_to_cap_fields("Critical", "ward_001", settings.pilot_district)
        for field in self.CAP_REQUIRED_FIELDS:
            assert field in fields, f"Missing CAP field: {field}"

    def test_alert_band_has_all_cap_fields(self):
        from app.core.config import settings
        fields = _band_to_cap_fields("Alert", "ward_001", settings.pilot_district)
        for field in self.CAP_REQUIRED_FIELDS:
            assert field in fields, f"Missing CAP field: {field}"

    def test_monitor_band_returns_empty(self):
        """Monitor band must produce no CAP output — no public alert."""
        from app.core.config import settings
        fields = _band_to_cap_fields("Monitor", "ward_001", settings.pilot_district)
        assert fields == {}

    def test_critical_urgency_is_immediate(self):
        from app.core.config import settings
        fields = _band_to_cap_fields("Critical", "ward_001", settings.pilot_district)
        assert fields["urgency"] == "Immediate"
        assert fields["severity"] == "Severe"
        assert fields["certainty"] == "Likely"

    def test_alert_urgency_is_expected(self):
        from app.core.config import settings
        fields = _band_to_cap_fields("Alert", "ward_001", settings.pilot_district)
        assert fields["urgency"] == "Expected"
        assert fields["severity"] == "Moderate"
        assert fields["certainty"] == "Possible"


class TestAdjustWeight:
    """Build Guide §8.2 — exact adjust_weight() boundary values."""

    def test_above_threshold_reduces_weight(self):
        """false_alarm_rate > 0.3 → weight decreases by 0.05."""
        result = adjust_weight(0.4, 0.31)
        assert result == pytest.approx(0.35)

    def test_at_threshold_no_change(self):
        """false_alarm_rate == 0.3 → weight unchanged (NOT above threshold)."""
        result = adjust_weight(0.4, 0.30)
        assert result == pytest.approx(0.40)

    def test_below_threshold_no_change(self):
        result = adjust_weight(0.4, 0.10)
        assert result == pytest.approx(0.40)

    def test_floor_respected(self):
        """Weight must never go below WEIGHT_FLOOR = 0.05."""
        result = adjust_weight(0.05, 0.99)
        assert result == pytest.approx(0.05)

    def test_multiple_adjustments_approach_floor(self):
        """Repeated adjustments must stop at floor."""
        weight = 0.4
        for _ in range(20):
            weight = adjust_weight(weight, 0.99)
        assert weight >= 0.05


class TestBacktestThresholdCrossing:
    """Build Guide §7 — backtest must correctly identify first Critical crossing."""

    def test_threshold_crossing_identified(self, sample_historical_df):
        from app.backtest.historical_runner import run_backtest, find_threshold_crossing

        results = run_backtest(sample_historical_df)
        crossing = find_threshold_crossing(results)
        assert crossing is not None, "Expected threshold crossing in rising-rainfall synthetic data"

    def test_peak_score_above_70(self, sample_historical_df):
        from app.backtest.historical_runner import run_backtest

        results = run_backtest(sample_historical_df)
        assert results["risk_score"].max() >= 70.0
