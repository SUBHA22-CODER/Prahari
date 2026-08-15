"""PRAHARI-AI — Alerts API endpoints (CAP-style, SIMULATED dissemination)."""
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import Alert

router = APIRouter()


from datetime import datetime, timedelta

def generate_district_alerts(district_id: str = "wayanad"):
    dist_name = district_id.capitalize()
    now_str = datetime.now().isoformat()
    valid_str = (datetime.now() + timedelta(hours=24)).isoformat()

    return [
        {
            "id": "PRAHARI-W14-001",
            "severity": "CRITICAL",
            "hazard_type": "Flash Flood + Debris Flow Fusion",
            "ward_id": "W14",
            "ward_name": f"Ward 14 ({dist_name} Central)",
            "risk_score": 82,
            "confidence": 84,
            "issued_at": now_str,
            "valid_until": valid_str,
            "recommended_action": "EVACUATE LOW-LYING HOUSEHOLDS & PREPARE RELIEF SHELTER",
            "affected_population": 2840,
            "status": "ACTIVE",
            "dissemination_status": "SIMULATED",
            "cap_structure": {
                "identifier": "PRAHARI-W14-001",
                "sender": "prahari-ai@ndma.gov.in",
                "sent": now_str,
                "status": "Actual",
                "msgType": "Alert",
                "scope": "Public",
                "info": {
                    "category": "Safety",
                    "event": "Flash Flood & Debris Flow Warning",
                    "urgency": "Immediate",
                    "severity": "Extreme",
                    "certainty": "Observed",
                    "headline": f"EVACUATION WARNING: Extreme Flash Flood & Slope Failure hazard in Ward 14 ({dist_name})",
                    "description": "Cumulative 24hr rainfall exceeding warning mark with high slope soil moisture saturation.",
                    "instruction": "Evacuate immediately to designated relief shelter. Avoid riverbanks.",
                    "area": {
                        "areaDesc": f"Ward 14 ({dist_name} Central)",
                        "circle": "24.80,92.74,3000"
                    }
                }
            }
        },
        {
            "id": "PRAHARI-W09-002",
            "severity": "CRITICAL",
            "hazard_type": "Landslide Risk",
            "ward_id": "W09",
            "ward_name": f"Ward 09 ({dist_name} North Slope)",
            "risk_score": 76,
            "confidence": 81,
            "issued_at": now_str,
            "valid_until": valid_str,
            "recommended_action": "Prepare evacuation of slope households",
            "affected_population": 3120,
            "status": "ACTIVE",
            "dissemination_status": "SIMULATED",
            "cap_structure": {
                "identifier": "PRAHARI-W09-002",
                "sender": "prahari-ai@ndma.gov.in",
                "sent": now_str,
                "status": "Actual",
                "msgType": "Alert",
                "scope": "Public",
                "info": {
                    "category": "Safety",
                    "event": "Slope Saturation Landslide Threat",
                    "urgency": "Expected",
                    "severity": "Severe",
                    "certainty": "Likely",
                    "headline": f"PREPARE EVACUATION: High landslide hazard in Ward 09 ({dist_name}) slope zones",
                    "description": "Continuous heavy rainfall has saturated slope soils.",
                    "instruction": "High ground slope residents move to designated relief shelters.",
                    "area": {
                        "areaDesc": f"Ward 09 ({dist_name} North Slope)",
                        "circle": "24.82,92.76,2500"
                    }
                }
            }
        },
        {
            "id": "PRAHARI-W18-003",
            "severity": "CRITICAL",
            "hazard_type": "Dam Outflow Flood",
            "ward_id": "W18",
            "ward_name": f"Ward 18 ({dist_name} River Bank)",
            "risk_score": 72,
            "confidence": 83,
            "issued_at": now_str,
            "valid_until": valid_str,
            "recommended_action": "Evacuate dam downstream riverbank households",
            "affected_population": 1650,
            "status": "ACTIVE",
            "dissemination_status": "SIMULATED",
            "cap_structure": {
                "identifier": "PRAHARI-W18-003",
                "sender": "prahari-ai@ndma.gov.in",
                "sent": now_str,
                "status": "Actual",
                "msgType": "Alert",
                "scope": "Public",
                "info": {
                    "category": "Safety",
                    "event": "Downstream Inundation Hazard",
                    "urgency": "Expected",
                    "severity": "Severe",
                    "certainty": "Likely",
                    "headline": f"EVACUATE RIVERBANK: River spillway discharge alert in Ward 18 ({dist_name})",
                    "description": "Controlled release from reservoir expected to elevate river level.",
                    "instruction": "Move livestock and personnel 100m away from river channels.",
                    "area": {
                        "areaDesc": f"Ward 18 ({dist_name} River Bank)",
                        "circle": "24.81,92.79,2000"
                    }
                }
            }
        },
        {
            "id": "PRAHARI-W02-004",
            "severity": "ALERT",
            "hazard_type": "Riverine Flood",
            "ward_id": "W02",
            "ward_name": f"Ward 02 ({dist_name} Lowland)",
            "risk_score": 68,
            "confidence": 79,
            "issued_at": now_str,
            "valid_until": valid_str,
            "recommended_action": "Alert riverbank communities & position rescue inflatable boats",
            "affected_population": 2100,
            "status": "ACTIVE",
            "dissemination_status": "SIMULATED",
            "cap_structure": {
                "identifier": "PRAHARI-W02-004",
                "sender": "prahari-ai@ndma.gov.in",
                "sent": now_str,
                "status": "Actual",
                "msgType": "Alert",
                "scope": "Public",
                "info": {
                    "category": "Safety",
                    "event": "River Flood Advisory",
                    "urgency": "Future",
                    "severity": "Moderate",
                    "certainty": "Possible",
                    "headline": f"RIVER FLOOD ADVISORY: River level rising in Ward 02 ({dist_name})",
                    "description": "Upstream rainfall causing steady rise in river gauge.",
                    "instruction": "Riverbank residents keep emergency kits ready.",
                    "area": {
                        "areaDesc": f"Ward 02 ({dist_name} Lowland)",
                        "circle": "24.78,92.78,2500"
                    }
                }
            }
        },
        {
            "id": "PRAHARI-W21-005",
            "severity": "ALERT",
            "hazard_type": "Urban Waterlogging",
            "ward_id": "W21",
            "ward_name": f"Ward 21 ({dist_name} Town)",
            "risk_score": 64,
            "confidence": 78,
            "issued_at": now_str,
            "valid_until": valid_str,
            "recommended_action": "Monitor drainage sluice gates and prepare urban pumps",
            "affected_population": 4150,
            "status": "ACTIVE",
            "dissemination_status": "SIMULATED",
            "cap_structure": {
                "identifier": "PRAHARI-W21-005",
                "sender": "prahari-ai@ndma.gov.in",
                "sent": now_str,
                "status": "Actual",
                "msgType": "Alert",
                "scope": "Public",
                "info": {
                    "category": "Safety",
                    "event": "Urban Waterlogging Advisory",
                    "urgency": "Future",
                    "severity": "Moderate",
                    "certainty": "Possible",
                    "headline": f"URBAN ADVISORY: Town low-lying culvert drainage bottleneck in Ward 21 ({dist_name})",
                    "description": "Intensity of rainfall exceeding urban drainage capacity.",
                    "instruction": "Avoid parking vehicles in low-lying bypass road segments.",
                    "area": {
                        "areaDesc": f"Ward 21 ({dist_name} Town)",
                        "circle": "24.81,92.77,2000"
                    }
                }
            }
        }
    ]


@router.get("/")
async def list_alerts(district: str = "wayanad", limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Return the alert feed in reverse chronological order."""
    try:
        result = await db.execute(
            select(Alert).order_by(desc(Alert.sent)).limit(limit)
        )
        alerts = result.scalars().all()
        if alerts:
            return [
                {
                    "id": a.identifier,
                    "identifier": a.identifier,
                    "sender": a.sender,
                    "sent": a.sent.isoformat(),
                    "status": a.status,
                    "msgType": a.msg_type,
                    "dissemination": "SIMULATED",
                    "risk_band": a.risk_band,
                    "info": {
                        "event": a.event,
                        "urgency": a.urgency,
                        "severity": a.severity,
                        "certainty": a.certainty,
                        "areaDesc": a.area_desc,
                        "instruction": a.instruction,
                    },
                }
                for a in alerts
            ]
    except Exception as e:
        print(f"[PRAHARI-AI API] list_alerts fallback ({e})")

    return generate_district_alerts(district)


@router.get("/{alert_id}")
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Return single alert by ID."""
    try:
        result = await db.execute(
            select(Alert).where(Alert.identifier == alert_id)
        )
        alert = result.scalar_one_or_none()
        if alert:
            return {
                "id": alert.identifier,
                "identifier": alert.identifier,
                "sender": alert.sender,
                "sent": alert.sent.isoformat(),
                "status": alert.status,
                "msgType": alert.msg_type,
                "dissemination": "SIMULATED",
                "risk_band": alert.risk_band,
                "info": {
                    "event": alert.event,
                    "urgency": alert.urgency,
                    "severity": alert.severity,
                    "certainty": alert.certainty,
                    "areaDesc": alert.area_desc,
                    "instruction": alert.instruction,
                },
            }
    except Exception as e:
        print(f"[PRAHARI-AI API] get_alert fallback ({e})")

    return {"id": alert_id, "identifier": alert_id, "status": "ACTIVE", "risk_band": "Alert"}
