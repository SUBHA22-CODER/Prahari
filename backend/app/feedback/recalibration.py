"""
PRAHARI-AI — Feedback and Weight Recalibration (Tier 2)
========================================================
Tier: 2 | Phase: 6

Implements the feedback loop and weight recalibration EXACTLY as specified in
Build Guide §8 and Project PDF §10.

WHAT THIS DOES (Build Guide §8.1):
    Captures: alert_id, predicted_risk, predicted_zone, actual_outcome, timestamp.
    Shows a before/after accuracy comparison after incorporating feedback.
    This is a DEMONSTRATION, not live production retraining.

RECALIBRATION LOGIC — MVP VERSION (Build Guide §8.2 — exact reference):
    def adjust_weight(current_weight, false_alarm_rate):
        if false_alarm_rate > 0.3:
            return max(current_weight - 0.05, 0.05)
        return current_weight

    "If a factor consistently over-predicts in a zone, reduce its weight slightly
     for that zone only."

TIER 2 CUT SAFETY:
    This module can be removed entirely without breaking Phase 3 (risk engine)
    or Phase 4 (CAP alerts). The risk engine reads from WEIGHTS in engine.py —
    recalibration results are advisory/display-only in the MVP.

PROJECT PDF §10 — framing to preserve verbatim:
    "Accuracy is not a one-time claim, it is a continuously improving property
    of the system."
    "Repeated false alerts cause people to stop responding to warnings altogether."
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Alert, Feedback

logger = logging.getLogger(__name__)

# Minimum weight floor (Build Guide §8.2 — do not go below 0.05)
WEIGHT_FLOOR = 0.05
WEIGHT_ADJUSTMENT_STEP = 0.05  # Decrease by 0.05 when false_alarm_rate > 0.3


def adjust_weight(current_weight: float, false_alarm_rate: float) -> float:
    """
    Adjust a factor weight based on the false-alarm rate for a zone.
    EXACT IMPLEMENTATION from Build Guide §8.2 — do not modify.

    Parameters
    ----------
    current_weight  : float — current weight for the factor (e.g. 0.4 for rainfall)
    false_alarm_rate: float — fraction of alerts that turned out to be false alarms (0.0-1.0)

    Returns
    -------
    float — adjusted weight (minimum: WEIGHT_FLOOR = 0.05)

    Tests:
        adjust_weight(0.4, 0.31) → 0.35
        adjust_weight(0.4, 0.30) → 0.40  (not above threshold)
        adjust_weight(0.05, 0.50) → 0.05  (floor)
    """
    if false_alarm_rate > 0.3:
        return max(current_weight - WEIGHT_ADJUSTMENT_STEP, WEIGHT_FLOOR)
    return current_weight


async def record_feedback(
    db: AsyncSession,
    alert_id: str,
    predicted_risk: float,
    predicted_zone: str,
    actual_outcome: str,
) -> Feedback:
    """
    Record an official's one-tap feedback response for an alert.
    Endpoint is role-restricted to 'official' role (Build Guide §8.1, Project PDF §10).

    Parameters
    ----------
    alert_id        : str — references alerts.identifier
    predicted_risk  : float — risk_score at time of alert generation
    predicted_zone  : str — ward_id at time of prediction
    actual_outcome  : str — 'yes' | 'no' | 'partial'
    """
    fb = Feedback(
        alert_id=alert_id,
        predicted_risk=predicted_risk,
        predicted_zone=predicted_zone,
        actual_outcome=actual_outcome,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(fb)
    await db.commit()
    logger.info(
        "Feedback recorded: alert=%s, outcome=%s, zone=%s",
        alert_id, actual_outcome, predicted_zone,
    )
    return fb


async def compute_false_alarm_rate(db: AsyncSession, ward_id: str) -> float:
    """
    Compute the false alarm rate for a specific ward from logged feedback.
    false_alarm_rate = count('no' outcomes) / total feedback count for the ward.
    Returns 0.0 if no feedback data exists.
    """
    result = await db.execute(
        select(Feedback)
        .join(Alert, Feedback.alert_id == Alert.identifier)
        .where(Alert.ward_id == ward_id)
    )
    all_fb = result.scalars().all()
    if not all_fb:
        return 0.0
    false_alarms = sum(1 for f in all_fb if f.actual_outcome == "no")
    return false_alarms / len(all_fb)


async def get_before_after_comparison(
    db: AsyncSession,
    ward_id: str,
) -> dict:
    """
    Produce the before/after weight-adjustment comparison for the dashboard demo.

    Returns a dict with:
        before_weights  : the baseline weights from engine.py
        after_weights   : weights after applying adjust_weight() for each factor
        false_alarm_rate: computed from logged feedback for this ward
        interpretation  : human-readable description for the demo UI

    This is a DEMONSTRATION comparison on available sample data,
    not live production retraining (Build Guide §8.2, Project PDF §10).
    """
    from app.risk.engine import WEIGHTS  # Import here to avoid circular dep

    false_alarm_rate = await compute_false_alarm_rate(db, ward_id)

    before_weights = dict(WEIGHTS)
    after_weights = {
        factor: adjust_weight(weight, false_alarm_rate)
        for factor, weight in WEIGHTS.items()
    }

    any_adjusted = any(
        after_weights[f] != before_weights[f] for f in before_weights
    )

    return {
        "ward_id": ward_id,
        "false_alarm_rate": round(false_alarm_rate, 3),
        "before_weights": before_weights,
        "after_weights": after_weights,
        "adjusted": any_adjusted,
        "interpretation": (
            f"False alarm rate for {ward_id}: {false_alarm_rate:.1%}. "
            + (
                "Weights reduced by 0.05 for over-predicting factors."
                if any_adjusted
                else "No adjustment needed — false alarm rate is within acceptable range."
            )
        ),
        "note": (
            "Accuracy is not a one-time claim, it is a continuously improving "
            "property of the system. (Project PDF §10)"
        ),
    }
