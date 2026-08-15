"""
PRAHARI-AI — Phase 6: Feedback & Recalibration Loop Tests
==========================================================
Tier 2 — Tests for the complete feedback cycle:
  1. record_feedback() — persists official one-tap verdicts
  2. compute_false_alarm_rate() — calculates FAR per ward
  3. adjust_weight() — reduces weights when FAR > 0.30
  4. get_before_after_comparison() — produces the demo-ready diff
  5. Full cycle: record multiple feedbacks → verify recalibration triggers
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

from app.feedback.recalibration import (
    adjust_weight,
    record_feedback,
    compute_false_alarm_rate,
    get_before_after_comparison,
    WEIGHT_FLOOR,
    WEIGHT_ADJUSTMENT_STEP,
)
from app.db.models import Feedback, Alert


# ── 1. adjust_weight() unit tests ────────────────────────────────────────────

class TestAdjustWeightRecalibration:
    """Build Guide §8.2: exact adjust_weight() boundary values at FAR=0.3."""

    def test_far_above_threshold_reduces_weight(self):
        """FAR=0.31 → weight reduced by 0.05."""
        assert adjust_weight(0.4, 0.31) == pytest.approx(0.35)

    def test_far_at_threshold_no_change(self):
        """FAR=0.30 exactly → NO reduction (threshold is strictly greater than)."""
        assert adjust_weight(0.4, 0.30) == 0.40

    def test_far_below_threshold_no_change(self):
        """FAR=0.10 → weight unchanged."""
        assert adjust_weight(0.4, 0.10) == 0.40

    def test_far_zero_no_change(self):
        """FAR=0.0 (no false alarms) → weight unchanged."""
        assert adjust_weight(0.3, 0.0) == 0.30

    def test_far_one_reduces_weight(self):
        """FAR=1.0 (all false alarms) → weight reduced."""
        assert adjust_weight(0.4, 1.0) == pytest.approx(0.35)

    def test_floor_respected_at_minimum(self):
        """Weight already at floor → stays at floor even with FAR=1.0."""
        assert adjust_weight(WEIGHT_FLOOR, 0.99) == WEIGHT_FLOOR

    def test_floor_prevents_below_minimum(self):
        """Weight slightly above floor → clamped to floor, not below."""
        assert adjust_weight(0.06, 0.50) == WEIGHT_FLOOR

    def test_multiple_adjustments_converge_to_floor(self):
        """Repeated adjustments must stop at floor (0.05), never go below."""
        weight = 0.4
        for _ in range(50):
            weight = adjust_weight(weight, 0.99)
        assert weight == WEIGHT_FLOOR

    def test_step_size_is_correct(self):
        """Verify the exact step size from constants."""
        assert WEIGHT_ADJUSTMENT_STEP == 0.05
        assert WEIGHT_FLOOR == 0.05


# ── 2. record_feedback() tests ───────────────────────────────────────────────

class TestRecordFeedback:
    """Build Guide §8.1: one-tap feedback persistence."""

    @pytest.mark.asyncio
    async def test_record_feedback_creates_row(self):
        """Verify feedback row is created and committed."""
        db_mock = AsyncMock()

        fb = await record_feedback(
            db_mock,
            alert_id="PRAHARI-2026-000001",
            predicted_risk=72.5,
            predicted_zone="ward_003",
            actual_outcome="yes",
        )

        # Should have called db.add() and db.commit()
        db_mock.add.assert_called_once()
        db_mock.commit.assert_awaited_once()
        assert isinstance(fb, Feedback)
        assert fb.alert_id == "PRAHARI-2026-000001"
        assert fb.actual_outcome == "yes"
        assert fb.predicted_zone == "ward_003"
        assert fb.predicted_risk == 72.5

    @pytest.mark.asyncio
    async def test_record_feedback_partial_outcome(self):
        """Verify 'partial' outcome is accepted."""
        db_mock = AsyncMock()

        fb = await record_feedback(
            db_mock,
            alert_id="PRAHARI-2026-000002",
            predicted_risk=55.0,
            predicted_zone="ward_007",
            actual_outcome="partial",
        )

        assert fb.actual_outcome == "partial"

    @pytest.mark.asyncio
    async def test_record_feedback_no_outcome(self):
        """Verify 'no' outcome (false alarm) is accepted."""
        db_mock = AsyncMock()

        fb = await record_feedback(
            db_mock,
            alert_id="PRAHARI-2026-000003",
            predicted_risk=45.0,
            predicted_zone="ward_012",
            actual_outcome="no",
        )

        assert fb.actual_outcome == "no"

    @pytest.mark.asyncio
    async def test_record_feedback_has_utc_timestamp(self):
        """Verify timestamp is UTC-aware."""
        db_mock = AsyncMock()

        fb = await record_feedback(
            db_mock,
            alert_id="PRAHARI-2026-000004",
            predicted_risk=80.0,
            predicted_zone="ward_001",
            actual_outcome="yes",
        )

        assert fb.timestamp.tzinfo is not None


# ── 3. compute_false_alarm_rate() tests ───────────────────────────────────────

class TestComputeFalseAlarmRate:
    """Build Guide §8.2: false alarm rate computation from feedback data."""

    @pytest.mark.asyncio
    async def test_no_feedback_returns_zero(self):
        """No feedback records → FAR = 0.0."""
        db_mock = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db_mock.execute.return_value = mock_result

        far = await compute_false_alarm_rate(db_mock, "ward_001")
        assert far == 0.0

    @pytest.mark.asyncio
    async def test_all_correct_returns_zero(self):
        """All 'yes' outcomes → FAR = 0.0."""
        db_mock = AsyncMock()
        mock_result = MagicMock()

        feedbacks = [
            MagicMock(actual_outcome="yes"),
            MagicMock(actual_outcome="yes"),
            MagicMock(actual_outcome="yes"),
        ]
        mock_result.scalars.return_value.all.return_value = feedbacks
        db_mock.execute.return_value = mock_result

        far = await compute_false_alarm_rate(db_mock, "ward_001")
        assert far == 0.0

    @pytest.mark.asyncio
    async def test_all_false_alarms_returns_one(self):
        """All 'no' outcomes → FAR = 1.0."""
        db_mock = AsyncMock()
        mock_result = MagicMock()

        feedbacks = [
            MagicMock(actual_outcome="no"),
            MagicMock(actual_outcome="no"),
        ]
        mock_result.scalars.return_value.all.return_value = feedbacks
        db_mock.execute.return_value = mock_result

        far = await compute_false_alarm_rate(db_mock, "ward_001")
        assert far == 1.0

    @pytest.mark.asyncio
    async def test_mixed_outcomes_correct_ratio(self):
        """2 false alarms out of 5 total → FAR = 0.4."""
        db_mock = AsyncMock()
        mock_result = MagicMock()

        feedbacks = [
            MagicMock(actual_outcome="yes"),
            MagicMock(actual_outcome="no"),
            MagicMock(actual_outcome="partial"),
            MagicMock(actual_outcome="no"),
            MagicMock(actual_outcome="yes"),
        ]
        mock_result.scalars.return_value.all.return_value = feedbacks
        db_mock.execute.return_value = mock_result

        far = await compute_false_alarm_rate(db_mock, "ward_001")
        assert far == pytest.approx(0.4)

    @pytest.mark.asyncio
    async def test_partial_is_not_false_alarm(self):
        """'partial' outcomes do NOT count as false alarms."""
        db_mock = AsyncMock()
        mock_result = MagicMock()

        feedbacks = [
            MagicMock(actual_outcome="partial"),
            MagicMock(actual_outcome="partial"),
            MagicMock(actual_outcome="partial"),
        ]
        mock_result.scalars.return_value.all.return_value = feedbacks
        db_mock.execute.return_value = mock_result

        far = await compute_false_alarm_rate(db_mock, "ward_001")
        assert far == 0.0


# ── 4. get_before_after_comparison() tests ────────────────────────────────────

class TestBeforeAfterComparison:
    """Build Guide §8.2: before/after weight adjustment demo for dashboard."""

    @pytest.mark.asyncio
    @patch("app.feedback.recalibration.compute_false_alarm_rate", new_callable=AsyncMock)
    async def test_no_adjustment_when_far_low(self, mock_far):
        """FAR=0.1 → no weight adjustment, before == after."""
        mock_far.return_value = 0.1
        db_mock = AsyncMock()

        result = await get_before_after_comparison(db_mock, "ward_001")

        assert result["adjusted"] is False
        assert result["before_weights"] == result["after_weights"]
        assert result["false_alarm_rate"] == 0.1
        assert "ward_001" in result["ward_id"]

    @pytest.mark.asyncio
    @patch("app.feedback.recalibration.compute_false_alarm_rate", new_callable=AsyncMock)
    async def test_adjustment_when_far_high(self, mock_far):
        """FAR=0.5 → all weights reduced by 0.05."""
        mock_far.return_value = 0.5
        db_mock = AsyncMock()

        result = await get_before_after_comparison(db_mock, "ward_005")

        assert result["adjusted"] is True
        assert result["false_alarm_rate"] == 0.5
        # Each after weight should be before_weight - 0.05
        for factor in result["before_weights"]:
            expected = max(result["before_weights"][factor] - 0.05, WEIGHT_FLOOR)
            assert result["after_weights"][factor] == expected

    @pytest.mark.asyncio
    @patch("app.feedback.recalibration.compute_false_alarm_rate", new_callable=AsyncMock)
    async def test_project_pdf_note_included(self, mock_far):
        """Verify the Project PDF §10 quote is included in the response."""
        mock_far.return_value = 0.0
        db_mock = AsyncMock()

        result = await get_before_after_comparison(db_mock, "ward_001")

        assert "note" in result
        assert "continuously improving" in result["note"]

    @pytest.mark.asyncio
    @patch("app.feedback.recalibration.compute_false_alarm_rate", new_callable=AsyncMock)
    async def test_interpretation_text_for_adjustment(self, mock_far):
        """When adjusted, interpretation mentions weight reduction."""
        mock_far.return_value = 0.5
        db_mock = AsyncMock()

        result = await get_before_after_comparison(db_mock, "ward_002")

        assert "reduced" in result["interpretation"].lower() or "Weights reduced" in result["interpretation"]

    @pytest.mark.asyncio
    @patch("app.feedback.recalibration.compute_false_alarm_rate", new_callable=AsyncMock)
    async def test_interpretation_text_for_no_adjustment(self, mock_far):
        """When not adjusted, interpretation says no adjustment needed."""
        mock_far.return_value = 0.2
        db_mock = AsyncMock()

        result = await get_before_after_comparison(db_mock, "ward_010")

        assert "no adjustment" in result["interpretation"].lower()


# ── 5. Full Cycle Integration ─────────────────────────────────────────────────

class TestFeedbackRecalibrationCycle:
    """End-to-end: multiple feedbacks drive FAR → weight adjustment triggers."""

    def test_far_below_threshold_keeps_weights(self):
        """FAR=0.25 (below 0.3) → all four weights unchanged."""
        original_weights = {"rainfall": 0.4, "river": 0.3, "slope": 0.2, "history": 0.1}
        adjusted = {k: adjust_weight(v, 0.25) for k, v in original_weights.items()}
        assert adjusted == original_weights

    def test_far_above_threshold_reduces_all(self):
        """FAR=0.35 (above 0.3) → all four weights reduced by 0.05."""
        original_weights = {"rainfall": 0.4, "river": 0.3, "slope": 0.2, "history": 0.1}
        adjusted = {k: adjust_weight(v, 0.35) for k, v in original_weights.items()}
        assert adjusted["rainfall"] == pytest.approx(0.35)
        assert adjusted["river"] == pytest.approx(0.25)
        assert adjusted["slope"] == pytest.approx(0.15)
        assert adjusted["history"] == pytest.approx(0.05)

    def test_history_at_floor_stays_at_floor(self):
        """History weight (0.1) reduced once = 0.05. Second reduction stays at 0.05."""
        weight = adjust_weight(0.1, 0.5)   # → 0.05
        weight = adjust_weight(weight, 0.5)  # → still 0.05
        assert weight == WEIGHT_FLOOR

    def test_progressive_far_scenario(self):
        """Simulate 3 rounds: FAR goes from 0.2 → 0.35 → 0.40."""
        w = 0.4
        w = adjust_weight(w, 0.2)   # No change
        assert w == pytest.approx(0.4)
        w = adjust_weight(w, 0.35)  # Reduced
        assert w == pytest.approx(0.35)
        w = adjust_weight(w, 0.40)  # Reduced again
        assert w == pytest.approx(0.30)
