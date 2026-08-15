"""
PRAHARI-AI — CAP-Style Alert Generator
========================================
Tier: 1 | Phase: 4

Converts risk scores into structured CAP (Common Alerting Protocol) alerts
EXACTLY as specified in Build Guide §6.

RISK BANDS (Build Guide §6.1 — exact thresholds, do not alter):
    0-40   Monitor   No public alert; log internally
    40-70  Alert     Notify officials, advise preparedness
    70-100 Critical  Evacuate zone, close schools, activate pumps, alert NDRF

CAP FIELD STRUCTURE (Build Guide §6.2):
    identifier, sender, sent, status, msgType,
    info.event, info.urgency, info.severity, info.certainty,
    info.areaDesc, info.instruction

SIMULATED DISSEMINATION (Build Guide §6.3, §6.4):
    Live integration with NDMA's SACHET is NOT accessible for a student project.
    The dissemination panel is clearly labelled SIMULATED in all API responses and UI.

    Verbatim answer for judges (Build Guide §6.4/§10):
    "Not in the MVP — the alert layer is built to the same CAP structure SACHET uses,
    with a simulated dissemination panel, ready for integration in a production deployment."

ALERT BAND → CAP FIELD MAPPING:
    Critical: urgency=Immediate, severity=Severe,   certainty=Likely
    Alert:    urgency=Expected,  severity=Moderate,  certainty=Possible
    [ASSUMPTION: exact urgency/severity/certainty mapping per band beyond the one
     worked Critical example is not given verbatim in the source — this mapping is
     documented and flagged as an assumption (Build Guide §6.2 acceptance criterion)]
"""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Alert, RiskScore, Ward

logger = logging.getLogger(__name__)

# ─── Risk band thresholds (Build Guide §6.1) ─────────────────────────────────
BAND_MONITOR = (0, 40)
BAND_ALERT = (40, 70)
BAND_CRITICAL = (70, 100)


def _get_risk_band(risk_score: float) -> str:
    """Classify a risk score into the Build Guide §6.1 bands."""
    if risk_score < BAND_ALERT[0]:
        return "Monitor"
    elif risk_score < BAND_CRITICAL[0]:
        return "Alert"
    return "Critical"


def _make_identifier(sequence: int) -> str:
    """Generate a CAP alert identifier: PRAHARI-{year}-{seq:06d}."""
    year = datetime.now(timezone.utc).year
    return f"PRAHARI-{year}-{sequence:06d}"


def _band_to_cap_fields(band: str, ward_id: str, district: str) -> dict:
    """
    Map risk band to CAP urgency/severity/certainty and recommended instruction.
    [ASSUMPTION: mapping documented — see module docstring]
    """
    if band == "Critical":
        return {
            "event": "Flood / Landslide Risk — Critical",
            "urgency": "Immediate",
            "severity": "Severe",
            "certainty": "Likely",
            "instruction": (
                "Evacuate low-lying zones near the river and landslide-prone slopes. "
                "Close schools and public spaces. Activate pump stations. Alert NDRF."
            ),
        }
    elif band == "Alert":
        return {
            "event": "Flood / Landslide Risk — Alert",
            "urgency": "Expected",
            "severity": "Moderate",
            "certainty": "Possible",
            "instruction": (
                "Notify local officials and district administration. "
                "Advise residents in low-lying areas to prepare for possible evacuation. "
                "Monitor river levels and rainfall closely."
            ),
        }
    # Monitor — no public alert
    return {}


async def _next_alert_sequence(db: AsyncSession) -> int:
    """Return the next auto-incremented alert sequence number."""
    result = await db.execute(select(Alert))
    count = len(result.scalars().all())
    return count + 1


async def generate_alerts_for_cycle(
    db: AsyncSession,
    scored_wards: list[dict],
    district: str,
) -> list[dict]:
    """
    Evaluate risk scores against the three bands and generate CAP-structured
    alert records for every ward in the Alert or Critical band.

    Parameters
    ----------
    db           : AsyncSession
    scored_wards : list of dicts from risk engine (ward_id, risk_score, ...)
    district     : str — pilot district name for area_desc

    Returns
    -------
    List of generated alert dicts (for the simulated dissemination panel feed).
    """
    generated = []
    now = datetime.now(timezone.utc)

    for ward_score in scored_wards:
        ward_id = ward_score["ward_id"]
        risk_score = ward_score["risk_score"]
        band = _get_risk_band(risk_score)

        if band == "Monitor":
            continue  # Log internally only — no public alert (Build Guide §6.1)

        seq = await _next_alert_sequence(db)
        identifier = _make_identifier(seq)
        cap_fields = _band_to_cap_fields(band, ward_id, district)

        alert = Alert(
            identifier=identifier,
            sender="prahari-ai-demo",
            sent=now,
            status="Actual",
            msg_type="Alert",
            event=cap_fields["event"],
            urgency=cap_fields["urgency"],
            severity=cap_fields["severity"],
            certainty=cap_fields["certainty"],
            area_desc=f"{ward_id}, {district}",
            instruction=cap_fields["instruction"],
            ward_id=ward_id,
            risk_band=band,
        )
        db.add(alert)

        alert_dict = {
            "identifier": identifier,
            "sender": "prahari-ai-demo",
            "sent": now.isoformat(),
            "status": "Actual",
            "msgType": "Alert",
            "dissemination": "SIMULATED",  # Clearly labelled — Build Guide §6.3
            "info": {
                "event": cap_fields["event"],
                "urgency": cap_fields["urgency"],
                "severity": cap_fields["severity"],
                "certainty": cap_fields["certainty"],
                "areaDesc": f"{ward_id}, {district}",
                "instruction": cap_fields["instruction"],
            },
        }
        generated.append(alert_dict)
        logger.info("CAP alert generated: %s [%s] for ward %s", identifier, band, ward_id)

    if generated:
        await db.commit()

    return generated
