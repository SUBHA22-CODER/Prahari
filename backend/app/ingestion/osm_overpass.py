"""
PRAHARI-AI — OpenStreetMap Overpass API Fetcher
================================================
Tier: 1 (Exposure Grid input) | Schedule: static / occasional refresh (monthly or manual)

Queries OpenStreetMap's Overpass API for hospitals and schools in the pilot district.
Each returned node is spatially joined (via PostGIS) to its containing ward polygon
to populate wards.infrastructure_count.

This data is static/infrequently changing (Build Guide §2 — "Static — low risk once pulled").
No tight polling schedule required. A monthly or manual re-run command is sufficient.
Re-running is idempotent (does not duplicate counts).

Reference query structure (Build Guide §4.2):
    [out:json];
    area[name="DISTRICT"]->.searchArea;
    (
      node["amenity"="hospital"](area.searchArea);
      node["amenity"="school"](area.searchArea);
    );
    out body;
"""

import logging
import time

import requests
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
REQUEST_TIMEOUT_SECONDS = 30  # Overpass queries can be slow on large areas


def _build_overpass_query(district_name: str) -> str:
    """
    Build a parameterised Overpass QL query for a district.
    Only queries hospital and school nodes — not hardcoded to a specific district.
    """
    return f"""
[out:json][timeout:25];
area[name="{district_name}"]->.searchArea;
(
  node["amenity"="hospital"](area.searchArea);
  node["amenity"="school"](area.searchArea);
);
out body;
"""


def _fetch_osm_nodes(district_name: str) -> list[dict] | None:
    """
    Execute the Overpass query and return a list of OSM node dicts.
    Returns None on any network/parse error.
    """
    query = _build_overpass_query(district_name)
    try:
        resp = requests.post(
            OVERPASS_URL,
            data={"data": query},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        data = resp.json()
        nodes = [el for el in data.get("elements", []) if el.get("type") == "node"]
        logger.info("Overpass: fetched %d nodes for district '%s'", len(nodes), district_name)
        return nodes
    except requests.RequestException as exc:
        logger.error("Overpass fetch failed for district '%s': %s", district_name, exc)
    except (ValueError, KeyError) as exc:
        logger.error("Overpass parse error for district '%s': %s", district_name, exc)
    return None


async def run_osm_infrastructure_refresh(
    db: AsyncSession,
    district_name: str | None = None,
) -> None:
    """
    One-time or monthly job: fetch OSM hospital/school nodes and update
    wards.infrastructure_count via PostGIS spatial join.

    Idempotent: resets infrastructure_count to 0 before recounting so
    re-runs do not accumulate duplicates (Build Guide §5.5 acceptance criterion).

    Parameters
    ----------
    db            : AsyncSession
    district_name : str — defaults to settings.pilot_district
    """
    district = district_name or settings.pilot_district
    nodes = _fetch_osm_nodes(district)
    if nodes is None:
        logger.error("OSM: no node data retrieved — infrastructure_count not updated")
        return

    # Reset all infrastructure counts for the district before re-populating
    await db.execute(
        text("UPDATE wards SET infrastructure_count = 0 WHERE district = :district"),
        {"district": district},
    )

    # For each node, find the ward whose boundary contains the node point and increment
    # its infrastructure_count using a PostGIS ST_Contains spatial join.
    updated = 0
    for node in nodes:
        lat = node.get("lat")
        lon = node.get("lon")
        if lat is None or lon is None:
            continue

        result = await db.execute(
            text(
                """
                UPDATE wards
                SET infrastructure_count = COALESCE(infrastructure_count, 0) + 1
                WHERE ST_Contains(
                    boundary::geometry,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
                )
                AND district = :district
                RETURNING ward_id
                """
            ),
            {"lat": lat, "lon": lon, "district": district},
        )
        if result.rowcount > 0:
            updated += 1

    await db.commit()
    logger.info(
        "OSM Overpass: %d/%d nodes assigned to ward infrastructure_count for district '%s'",
        updated, len(nodes), district,
    )
