"""
PRAHARI-AI — USGS Earthquake Fetcher
=====================================
Tier: 3 (architecturally independent) | Schedule: every 5 minutes (Build Guide §3.9)

Fetches significant earthquake events from USGS's free, no-key REST API.
Normalises each feature to the common record format (hazard_type="earthquake").

TIER-3 ISOLATION REQUIREMENT (Build Guide §6.5):
  This module is structured so it can be disabled/removed without affecting any
  Tier 1 fetcher or the flood/landslide risk fusion formula. The scheduler
  wires this in separately and conditionally.

Per Build Guide §10/§11 (judge Q&A):
  This module does NOT attempt to predict earthquakes — no system can do that
  with useful lead time. On a new event it provides a rapid post-event
  damage-priority map input (building age, population density, nearby
  landslide-prone zones) for NDRF response prioritisation.
"""

import logging
from datetime import datetime, timezone

import requests
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import HazardReading

logger = logging.getLogger(__name__)

USGS_ENDPOINT = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
REQUEST_TIMEOUT_SECONDS = 10
MIN_MAGNITUDE = 3.0  # Only store events above this threshold to avoid noise


def _fetch_usgs_raw() -> list[dict] | None:
    """
    Fetch the USGS significant-week GeoJSON feed.
    Returns the list of earthquake features on success, None on any error.
    """
    try:
        resp = requests.get(USGS_ENDPOINT, timeout=REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        features = resp.json().get("features", [])
        logger.info("USGS: fetched %d earthquake features", len(features))
        return features
    except requests.RequestException as exc:
        logger.warning("USGS fetch failed: %s", exc)
    return None


def _normalise_feature(feature: dict) -> dict | None:
    """
    Normalise a USGS GeoJSON feature to the PRAHARI-AI common record format.
    Uses the event epicentre coordinates as the location.
    Returns None if essential fields are missing.
    """
    try:
        props = feature["properties"]
        coords = feature["geometry"]["coordinates"]  # [lon, lat, depth_km]
        mag = props.get("mag")
        if mag is None or float(mag) < MIN_MAGNITUDE:
            return None

        # Use USGS event time (milliseconds epoch)
        observed_at = datetime.fromtimestamp(
            props["time"] / 1000.0, tz=timezone.utc
        )
        # Location ID: use place string as a proxy until spatial ward assignment
        # is performed by the downstream exposure-grid join in Phase 2.
        location_id = props.get("place", "unknown_epicentre")[:64]

        return {
            "source": "usgs",
            "location_id": location_id,
            "hazard_type": "earthquake",
            "value": float(mag),
            "unit": "mw",  # Moment magnitude
            "observed_at": observed_at,
            "fetched_at": datetime.now(timezone.utc),
        }
    except (KeyError, TypeError, ValueError) as exc:
        logger.warning("USGS: failed to normalise feature: %s", exc)
    return None


async def fetch_earthquake_job(db: AsyncSession) -> None:
    """
    Scheduled job (Tier 3): fetch USGS earthquake events and write to hazard_readings.
    Runs independently of all Tier 1 fetchers.

    Note: This module does not attempt earthquake PREDICTION. It logs recent significant
    events so the dashboard can trigger a rapid post-event damage-priority map input
    for NDRF response prioritisation (Build Guide §10/§11).
    """
    features = _fetch_usgs_raw()
    if features is None:
        return  # Error already logged; Tier 3 failure must not propagate

    count = 0
    for feature in features:
        record = _normalise_feature(feature)
        if record is None:
            continue
        db.add(HazardReading(**record))
        count += 1

    if count:
        await db.commit()
    logger.info("USGS: %d earthquake events written to hazard_readings", count)
