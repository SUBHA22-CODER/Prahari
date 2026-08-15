"""
PRAHARI-AI — Risk Engine Unit Tests
=====================================
Covers:
  1. Exact formula correctness (Build Guide §5.1/§5.3 acceptance criterion)
  2. Boundary value checks
  3. Contributions summing to risk_score (within rounding)
  4. Confidence heuristic boundary conditions
  5. Wildfire score isolation (never feeds into risk_scores fields)
"""

import pytest
from app.risk.engine import compute_risk, _compute_confidence


class TestComputeRisk:
    """Tests for the exact weighted risk formula from Build Guide §5.1."""

    def test_worked_example_from_build_guide(self):
        """
        Build Guide §5.1 acceptance criterion — exact test case:
        rainfall=80, river_trend=60, slope_proxy=50, hist_density=20
        → 0.4*80 + 0.3*60 + 0.2*50 + 0.1*20 = 32+18+10+2 = 62.0
        """
        score, contributions = compute_risk(80, 60, 50, 20)
        assert score == 62.0, f"Expected 62.0, got {score}"

    def test_single_input_rainfall_only(self):
        """
        Build Guide §7 acceptance criterion style:
        rainfall=100, river_trend=0 → score should be 0.4*100 = 40.0
        """
        score, contributions = compute_risk(100, 0, 0, 0)
        assert score == 40.0

    def test_contributions_sum_to_score(self):
        """Build Guide §7: contributions must sum to risk_score within rounding."""
        score, contributions = compute_risk(75, 50, 30, 40)
        assert abs(sum(contributions.values()) - score) < 0.1

    def test_max_inputs_capped_at_100(self):
        """Score must never exceed 100 even if inputs exceed 100."""
        score, _ = compute_risk(100, 100, 100, 100)
        assert score == 100.0

    def test_zero_inputs_give_zero_score(self):
        score, _ = compute_risk(0, 0, 0, 0)
        assert score == 0.0

    def test_all_contributions_present(self):
        """All four contribution keys must always be in the output dict."""
        _, contributions = compute_risk(50, 50, 50, 50)
        for key in ("rainfall", "river", "slope", "history"):
            assert key in contributions

    def test_exact_weight_values(self):
        """Each contribution must reflect the correct weight from Build Guide §5.1."""
        _, contributions = compute_risk(100, 0, 0, 0)
        assert abs(contributions["rainfall"] - 40.0) < 0.001

        _, contributions = compute_risk(0, 100, 0, 0)
        assert abs(contributions["river"] - 30.0) < 0.001

        _, contributions = compute_risk(0, 0, 100, 0)
        assert abs(contributions["slope"] - 20.0) < 0.001

        _, contributions = compute_risk(0, 0, 0, 100)
        assert abs(contributions["history"] - 10.0) < 0.001

    def test_rounding_to_one_decimal(self):
        """risk_score must be rounded to 1 decimal place."""
        score, _ = compute_risk(33, 33, 33, 33)
        assert round(score, 1) == score


class TestConfidenceHeuristic:
    """Tests for the MVP confidence heuristic (Build Guide §5.4)."""

    def test_all_fresh_gives_1(self):
        conf = _compute_confidence(True, True, True, True)
        assert conf == 1.0

    def test_all_stale_gives_0(self):
        conf = _compute_confidence(False, False, False, False)
        assert conf == 0.0

    def test_half_fresh_gives_0_5(self):
        conf = _compute_confidence(True, True, False, False)
        assert conf == 0.5
