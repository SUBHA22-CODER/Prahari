"""
PRAHARI-AI — Open-Meteo Rainfall Fetcher
=========================================
Tier: 1 | Schedule: every 15 minutes (Build Guide §3.9)

Fetches current rainfall and hourly precipitation forecast for each ward
centroid from the Open-Meteo public API (no API key required — Build Guide §3.3).

Failure handling: one ward's request failure does not stop the loop.
Error is logged per-ward and the next ward proceeds immediately.

Fallback note (Build Guide §2, source table): Open-Meteo is documented as
low-risk / rarely fails — standard retry + log is sufficient; no special
fallback logic beyond that is required.
"""

import logging
from datetime import datetime, timezone

import requests
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import HazardReading

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT_SECONDS = 10  # Build Guide §3.3


def _fetch_open_meteo_raw(lat: float, lon: float) -> dict | None:
    """
    Call Open-Meteo for a single coordinate pair.
    Returns the parsed JSON on success, None on any error.
    This is the only place that touches the external network for rainfall data.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "precipitation,rain",
        "hourly": "precipitation",
    }
    try:
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        logger.warning("Open-Meteo timeout for (lat=%.4f, lon=%.4f)", lat, lon)
    except requests.RequestException as exc:
        logger.warning("Open-Meteo request failed for (lat=%.4f, lon=%.4f): %s", lat, lon, exc)
    return None


def _normalise_to_record(raw: dict, ward_id: str) -> dict | None:
    """
    Normalise a raw Open-Meteo API response to the PRAHARI-AI common record format
    (Build Guide §3.2):
        source, location_id, hazard_type, value, unit, observed_at, fetched_at
    Returns None if the current precipitation field is missing or malformed.
    """
    try:
        current = raw.get("current", {})
        value = current.get("precipitation")
        if value is None:
            logger.warning("No 'current.precipitation' in Open-Meteo response for ward %s", ward_id)
            return None

        # Open-Meteo returns 'time' as an ISO-8601 string in the current block
        observed_str = current.get("time")
        if observed_str:
            observed_at = datetime.fromisoformat(observed_str).replace(tzinfo=timezone.utc)
        else:
            observed_at = datetime.now(timezone.utc)

        return {
            "source": "open_meteo",
            "location_id": ward_id,
            "hazard_type": "rainfall",
            "value": float(value),
            "unit": "mm_per_hr",
            "observed_at": observed_at,
            "fetched_at": datetime.now(timezone.utc),
        }
    except (KeyError, TypeError, ValueError) as exc:
        logger.warning("Malformed Open-Meteo response for ward %s: %s", ward_id, exc)
        return None


async def fetch_rainfall_job(db: AsyncSession, ward_centroids: list[dict]) -> None:
    """
    Scheduled job: fetch rainfall for all wards and write to hazard_readings.

    Parameters
    ----------
    db             : AsyncSession — database session injected by the scheduler wrapper
    ward_centroids : list of {ward_id, lat, lon} dicts for every ward in the pilot district

    One ward's failure does not block others (Build Guide §3.1).
    """
    success_count = 0
    for ward in ward_centroids:
        ward_id: str = ward["ward_id"]
        lat: float = ward["lat"]
        lon: float = ward["lon"]

        raw = _fetch_open_meteo_raw(lat, lon)
        if raw is None:
            continue  # Error already logged in _fetch_open_meteo_raw

        record = _normalise_to_record(raw, ward_id)
        if record is None:
            continue  # Error already logged in _normalise_to_record

        db.add(HazardReading(**record))
        success_count += 1

    if ward_centroids:
        await db.commit()
        logger.info(
            "Open-Meteo rainfall job: %d/%d wards updated",
            success_count,
            len(ward_centroids),
        )
