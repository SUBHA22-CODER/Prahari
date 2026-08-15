"""
PRAHARI-AI — ISRO Bhuvan Terrain / Slope / Proximity Fetcher
=============================================================
Tier: 1 | Schedule: monthly re-fetch (not on the short rainfall/river cycle)

Fetches:
  - LULC thematic statistics (land-use/land-cover) at district scale for
    the landslide slope/land-cover proxy (Build Guide §3.5).
  - Proximity data (nearest hospital/school per ward centroid) for cross-checking
    the OSM-derived exposure grid.

Caching strategy (Build Guide §3.5):
  - Query once per ward during initial setup; cache result in wards.slope_proxy_cached.
  - Re-fetch monthly (or on manual trigger) — never on the 15/30-minute ingestion cycle.
  - If the Bhuvan token is not approved in time, a bulk-download fallback (slope/LULC
    GeoTIFF layers from ISRO) can be loaded via load_bhuvan_bulk_fallback() without
    changing any downstream code that reads wards.slope_proxy_cached.

IMPORTANT: Request the Bhuvan API token on Day 1 in parallel with all other setup —
never let token approval sit on the critical path (Build Guide §3.1, §3.5).
"""

import logging
from datetime import datetime, timezone

import requests
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import Ward

logger = logging.getLogger(__name__)

BHUVAN_BASE = "https://bhuvan-app1.nrsc.gov.in/api"
LULC_ENDPOINT = f"{BHUVAN_BASE}/lulc/curr_lulc50k.php"
PROXIMITY_ENDPOINT = f"{BHUVAN_BASE}/proximity/curr_proximity.php"
REQUEST_TIMEOUT_SECONDS = 15  # Build Guide §3.5


def _fetch_lulc_statistics(district_code: str) -> dict | None:
    """
    Fetch LULC thematic statistics for a district from ISRO Bhuvan.
    Returns the parsed JSON on success, None on any error.
    """
    if not settings.bhuvan_token:
        logger.warning(
            "BHUVAN_TOKEN is not set — cannot call live API. "
            "Use load_bhuvan_bulk_fallback() to load static layers instead."
        )
        return None
    try:
        resp = requests.get(
            LULC_ENDPOINT,
            params={"token": settings.bhuvan_token, "district_code": district_code},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.warning("Bhuvan LULC fetch failed for district %s: %s", district_code, exc)
    return None


def _fetch_proximity(lat: float, lon: float, facility_type: str = "hospital") -> dict | None:
    """
    Fetch proximity data (nearest facility of facility_type) for a coordinate pair.
    Returns parsed JSON on success, None on any error.
    """
    if not settings.bhuvan_token:
        return None
    try:
        resp = requests.get(
            PROXIMITY_ENDPOINT,
            params={
                "token": settings.bhuvan_token,
                "lat": lat,
                "lon": lon,
                "type": facility_type,
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.warning(
            "Bhuvan proximity fetch failed for (%.4f, %.4f) [%s]: %s",
            lat, lon, facility_type, exc,
        )
    return None


def _derive_slope_proxy(lulc_data: dict) -> float | None:
    """
    Derive a slope saturation proxy value (0-100) from LULC statistics.
    The exact derivation depends on the Bhuvan LULC response schema.
    [ASSUMPTION: mapping LULC forest/barren/water percentage to slope proxy;
     adjust once actual API response schema is confirmed — Build Guide §3.5]
    """
    if not lulc_data:
        return None
    try:
        # Proxy: areas with high forest cover on slopes carry higher saturation risk
        # This is an estimate consistent with Build Guide §5.2 slope_saturation_proxy definition
        forest_pct = lulc_data.get("forest_pct", 0)
        barren_pct = lulc_data.get("barren_pct", 0)
        slope_proxy = min(100.0, (forest_pct * 0.5) + (barren_pct * 0.3))
        return round(slope_proxy, 2)
    except (TypeError, ValueError) as exc:
        logger.warning("Failed to derive slope proxy from LULC data: %s", exc)
    return None


async def fetch_bhuvan_monthly_job(db: AsyncSession, ward_list: list[dict]) -> None:
    """
    Monthly scheduled job (or manual trigger): refresh Bhuvan cached data for all wards.
    Populates wards.slope_proxy_cached and wards.last_bhuvan_fetch_at.

    Parameters
    ----------
    db         : AsyncSession
    ward_list  : list of {ward_id, lat, lon, district_code}
    """
    now = datetime.now(timezone.utc)
    updated = 0

    for ward in ward_list:
        ward_id = ward["ward_id"]
        lat = ward["lat"]
        lon = ward["lon"]
        district_code = ward.get("district_code", settings.pilot_district)

        lulc_data = _fetch_lulc_statistics(district_code)
        slope_proxy = _derive_slope_proxy(lulc_data) if lulc_data else None

        if slope_proxy is None:
            logger.warning("Bhuvan: no slope proxy derived for ward %s — cache unchanged", ward_id)
            continue

        await db.execute(
            update(Ward)
            .where(Ward.ward_id == ward_id)
            .values(slope_proxy_cached=slope_proxy, last_bhuvan_fetch_at=now)
        )
        updated += 1

    await db.commit()
    logger.info("Bhuvan monthly refresh: %d/%d wards updated", updated, len(ward_list))


async def load_bhuvan_bulk_fallback(db: AsyncSession, bulk_file_path: str) -> None:
    """
    Fallback loader: populate wards.slope_proxy_cached from a static bulk-download
    file (GeoTIFF raster or CSV) when the Bhuvan token is not yet approved.

    This function is the ONLY thing that changes between live-API and bulk-download
    mode — all downstream code that reads wards.slope_proxy_cached is unaffected
    (Build Guide §3.5, Phase 0 acceptance criterion).

    Parameters
    ----------
    bulk_file_path : str — path to the CSV with columns: ward_id, slope_proxy
    """
    import csv  # stdlib — no extra dependency
    now = datetime.now(timezone.utc)
    updated = 0

    try:
        with open(bulk_file_path, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ward_id = row["ward_id"]
                slope_proxy = float(row["slope_proxy"])
                await db.execute(
                    update(Ward)
                    .where(Ward.ward_id == ward_id)
                    .values(slope_proxy_cached=slope_proxy, last_bhuvan_fetch_at=now)
                )
                updated += 1
        await db.commit()
        logger.info(
            "Bhuvan bulk-download fallback: %d wards populated from %s",
            updated, bulk_file_path,
        )
    except (FileNotFoundError, KeyError, ValueError) as exc:
        logger.error("Bhuvan bulk-download fallback failed: %s", exc)
