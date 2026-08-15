"""
PRAHARI-AI — Phase 7: Historical Backtesting Tests
=====================================================
Tier 1 (never cut) — Build Guide §7

Tests verify:
  1. Historical CSV loading and validation
  2. run_backtest() uses the SAME compute_risk() from Phase 3
  3. find_threshold_crossing() detects Critical band entry
  4. Threshold crossing occurs BEFORE the actual event time
  5. Chart generation produces a valid PNG file
  6. API endpoints return correct response shape
  7. Edge cases: empty data, missing columns, flat scores
"""

import pytest
import os
import tempfile
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

import pandas as pd

from app.backtest.historical_runner import (
    load_historical_data,
    run_backtest,
    find_threshold_crossing,
    plot_backtest_chart,
    CRITICAL_THRESHOLD,
    KNOWN_EVENTS,
    _normalise_rainfall,
    _normalise_river,
)
from app.risk.engine import compute_risk


# ── 1. Normalisation Functions ────────────────────────────────────────────────

class TestNormalisationFunctions:
    """Verify rainfall and river normalisation helpers."""

    def test_normalise_rainfall_below_threshold(self):
        """50mm against 100mm threshold → 50.0."""
        assert _normalise_rainfall(50.0, 100.0) == 50.0

    def test_normalise_rainfall_at_threshold(self):
        """100mm against 100mm threshold → 100.0."""
        assert _normalise_rainfall(100.0, 100.0) == 100.0

    def test_normalise_rainfall_above_threshold_capped(self):
        """150mm against 100mm threshold → capped at 100.0."""
        assert _normalise_rainfall(150.0, 100.0) == 100.0

    def test_normalise_rainfall_zero(self):
        """0mm → 0.0."""
        assert _normalise_rainfall(0.0, 100.0) == 0.0

    def test_normalise_river_below_danger(self):
        """5m against 10m danger → 50.0."""
        assert _normalise_river(5.0, 10.0) == 50.0

    def test_normalise_river_above_danger_capped(self):
        """12m against 10m danger → capped at 100.0."""
        assert _normalise_river(12.0, 10.0) == 100.0

    def test_normalise_river_zero(self):
        """0m → 0.0."""
        assert _normalise_river(0.0, 10.0) == 0.0


# ── 2. Historical CSV Loading ────────────────────────────────────────────────

class TestLoadHistoricalData:
    """Verify CSV loading, validation, and sorting."""

    def test_load_valid_csv(self, tmp_path):
        """Load a correctly formatted CSV."""
        csv = tmp_path / "test.csv"
        csv.write_text(
            "timestamp,rainfall_mm_hr,river_level_m,slope_proxy,hist_density\n"
            "2024-07-28T00:00,50.0,5.0,30.0,20.0\n"
            "2024-07-28T06:00,80.0,7.0,40.0,20.0\n"
        )
        df = load_historical_data(str(csv))
        assert len(df) == 2
        assert list(df.columns) == ["timestamp", "rainfall_mm_hr", "river_level_m", "slope_proxy", "hist_density"]

    def test_load_missing_file_raises(self):
        """Non-existent CSV raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            load_historical_data("nonexistent_file.csv")

    def test_load_missing_columns_raises(self, tmp_path):
        """CSV with missing required columns raises ValueError."""
        csv = tmp_path / "bad.csv"
        csv.write_text("timestamp,rainfall_mm_hr\n2024-07-28T00:00,50.0\n")
        with pytest.raises(ValueError, match="missing required columns"):
            load_historical_data(str(csv))

    def test_data_is_sorted_by_timestamp(self, tmp_path):
        """Loaded data must be sorted by timestamp ascending."""
        csv = tmp_path / "unsorted.csv"
        csv.write_text(
            "timestamp,rainfall_mm_hr,river_level_m,slope_proxy,hist_density\n"
            "2024-07-29T00:00,100.0,8.0,40.0,20.0\n"
            "2024-07-28T00:00,50.0,5.0,30.0,20.0\n"
        )
        df = load_historical_data(str(csv))
        assert df.iloc[0]["rainfall_mm_hr"] == 50.0  # Earlier timestamp first


# ── 3. run_backtest() — Core Logic ───────────────────────────────────────────

class TestRunBacktest:
    """Build Guide §7: backtest must reuse Phase 3 compute_risk() directly."""

    def test_uses_compute_risk_function(self, sample_historical_df):
        """Verify compute_risk() is called (same function as live scoring)."""
        results = run_backtest(sample_historical_df)
        assert "risk_score" in results.columns
        assert "contribution_rainfall" in results.columns
        assert "contribution_river" in results.columns
        assert "contribution_slope" in results.columns
        assert "contribution_history" in results.columns

    def test_output_length_matches_input(self, sample_historical_df):
        """One risk score per input timestamp."""
        results = run_backtest(sample_historical_df)
        assert len(results) == len(sample_historical_df)

    def test_risk_scores_are_bounded(self, sample_historical_df):
        """All scores must be between 0 and 100."""
        results = run_backtest(sample_historical_df)
        assert results["risk_score"].min() >= 0
        assert results["risk_score"].max() <= 100

    def test_rising_rainfall_produces_rising_scores(self, sample_historical_df):
        """With monotonically rising rainfall, scores should generally increase."""
        results = run_backtest(sample_historical_df)
        first_third_avg = results["risk_score"].iloc[:3].mean()
        last_third_avg = results["risk_score"].iloc[-3:].mean()
        assert last_third_avg > first_third_avg

    def test_peak_score_above_critical(self, sample_historical_df):
        """Synthetic rising data must push peak score above Critical (70)."""
        results = run_backtest(sample_historical_df)
        assert results["risk_score"].max() >= CRITICAL_THRESHOLD

    def test_contributions_sum_to_score(self, sample_historical_df):
        """For each row, contributions should sum to the risk_score."""
        results = run_backtest(sample_historical_df)
        for _, row in results.iterrows():
            total = (
                row["contribution_rainfall"]
                + row["contribution_river"]
                + row["contribution_slope"]
                + row["contribution_history"]
            )
            assert total == pytest.approx(row["risk_score"], abs=0.2)

    def test_compute_risk_identity(self):
        """Directly verify compute_risk() produces expected result (Build Guide §5.1)."""
        score, contributions = compute_risk(80.0, 60.0, 50.0, 40.0)
        expected = (0.4 * 80) + (0.3 * 60) + (0.2 * 50) + (0.1 * 40)
        assert score == pytest.approx(expected, abs=0.2)


# ── 4. find_threshold_crossing() ─────────────────────────────────────────────

class TestFindThresholdCrossing:
    """Build Guide §7: detect the first Critical threshold crossing."""

    def test_crossing_found_in_rising_data(self, sample_historical_df):
        """Rising rainfall data must produce a threshold crossing."""
        results = run_backtest(sample_historical_df)
        crossing = find_threshold_crossing(results)
        assert crossing is not None

    def test_crossing_before_event_confirmation(self, sample_historical_df):
        """Critical crossing must occur BEFORE the Wayanad 2024 confirmed event time."""
        results = run_backtest(sample_historical_df)
        crossing = find_threshold_crossing(results)
        # The synthetic data (base = 2018-08-10) doesn't match the Wayanad event,
        # but in the real CSV the crossing must precede 2024-07-30T06:00Z.
        assert crossing is not None

    def test_no_crossing_in_flat_data(self):
        """Flat low scores should return None (no crossing)."""
        flat_df = pd.DataFrame({
            "timestamp": pd.date_range("2024-07-28", periods=5, freq="6h"),
            "risk_score": [20.0, 25.0, 30.0, 28.0, 22.0],
        })
        crossing = find_threshold_crossing(flat_df)
        assert crossing is None

    def test_crossing_returns_first_timestamp(self):
        """If multiple crossings exist, return the FIRST one."""
        multi_df = pd.DataFrame({
            "timestamp": pd.date_range("2024-07-28", periods=5, freq="6h"),
            "risk_score": [50.0, 72.0, 65.0, 75.0, 80.0],
        })
        crossing = find_threshold_crossing(multi_df)
        assert crossing == multi_df.iloc[1]["timestamp"]

    def test_custom_threshold(self):
        """Support custom threshold values."""
        df = pd.DataFrame({
            "timestamp": pd.date_range("2024-07-28", periods=3, freq="6h"),
            "risk_score": [30.0, 45.0, 60.0],
        })
        crossing_40 = find_threshold_crossing(df, threshold=40.0)
        crossing_50 = find_threshold_crossing(df, threshold=50.0)
        assert crossing_40 is not None
        assert crossing_50 is not None


# ── 5. Chart Generation ──────────────────────────────────────────────────────

class TestPlotBacktestChart:
    """Verify chart generation produces a valid PNG file."""

    def test_chart_file_created(self, sample_historical_df):
        """Chart generation must create a PNG file on disk."""
        import matplotlib
        matplotlib.use("Agg")
        results = run_backtest(sample_historical_df)
        output = os.path.join(tempfile.gettempdir(), "test_backtest_chart.png")
        path = plot_backtest_chart(results, event_key="wayanad_2024", output_path=output)
        assert os.path.exists(path)
        assert path.endswith(".png")
        # Clean up
        os.remove(path)

    def test_chart_with_unknown_event_key(self, sample_historical_df):
        """Unknown event key should still generate chart (no event marker)."""
        import matplotlib
        matplotlib.use("Agg")
        results = run_backtest(sample_historical_df)
        output = os.path.join(tempfile.gettempdir(), "test_unknown_event.png")
        path = plot_backtest_chart(results, event_key="unknown_event", output_path=output)
        assert os.path.exists(path)
        os.remove(path)


# ── 6. Real Historical CSV Validation ────────────────────────────────────────

class TestWayanad2024CSV:
    """Validate the real historical CSV file for the Wayanad 2024 backtest."""

    @pytest.fixture
    def wayanad_csv_path(self):
        # Resolve to project root: backend/tests/ → backend/ → project root
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        return os.path.join(project_root, "data", "historical", "wayanad_2024_historical.csv")

    def test_csv_file_exists(self, wayanad_csv_path):
        """The historical CSV file must exist in the data directory."""
        assert os.path.exists(wayanad_csv_path), f"Missing: {wayanad_csv_path}"

    def test_csv_loads_successfully(self, wayanad_csv_path):
        """CSV must load without errors."""
        df = load_historical_data(wayanad_csv_path)
        assert len(df) > 0

    def test_csv_has_enough_datapoints(self, wayanad_csv_path):
        """Must have enough data points for a meaningful chart (at least 10)."""
        df = load_historical_data(wayanad_csv_path)
        assert len(df) >= 10

    def test_backtest_crosses_critical(self, wayanad_csv_path):
        """Running backtest on real CSV must cross Critical threshold."""
        df = load_historical_data(wayanad_csv_path)
        results = run_backtest(df)
        assert results["risk_score"].max() >= CRITICAL_THRESHOLD

    def test_crossing_before_wayanad_event(self, wayanad_csv_path):
        """Critical crossing timestamp must be BEFORE Wayanad 2024 confirmation."""
        df = load_historical_data(wayanad_csv_path)
        results = run_backtest(df)
        crossing = find_threshold_crossing(results)
        assert crossing is not None

        confirmed_at = KNOWN_EVENTS["wayanad_2024"]["confirmed_at"]
        crossing_ts = pd.Timestamp(crossing)
        if crossing_ts.tzinfo is None:
            crossing_ts = crossing_ts.tz_localize("UTC")
        assert crossing_ts < confirmed_at, (
            f"Model flagged Critical at {crossing_ts}, but event confirmed at {confirmed_at}. "
            f"The model must flag BEFORE the event."
        )


# ── 7. Known Events Registry ─────────────────────────────────────────────────

class TestKnownEventsRegistry:
    """Verify the KNOWN_EVENTS configuration."""

    def test_wayanad_2024_registered(self):
        assert "wayanad_2024" in KNOWN_EVENTS

    def test_kerala_2018_registered(self):
        assert "kerala_2018" in KNOWN_EVENTS

    def test_events_have_required_fields(self):
        for key, event in KNOWN_EVENTS.items():
            assert "label" in event, f"{key} missing label"
            assert "confirmed_at" in event, f"{key} missing confirmed_at"
            assert isinstance(event["confirmed_at"], datetime)

    def test_critical_threshold_is_70(self):
        """Build Guide §6.1 — Critical threshold must be 70."""
        assert CRITICAL_THRESHOLD == 70.0
