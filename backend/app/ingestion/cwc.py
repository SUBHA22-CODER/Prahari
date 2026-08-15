"""
PRAHARI-AI — CWC / India-WRIS River-Level Scraper
===================================================
Tier: 1 | Schedule: every 30 minutes (Build Guide §3.9)

Scrapes CWC / India-WRIS river gauge station pages for the pilot district.
Implements the cache-first read pattern required by Build Guide §3.6:
  1. The dashboard/API layer reads from river_level_snapshot_cache FIRST.
  2. A live scrape is attempted SECOND.
  3. A scrape failure must never blank the UI — cached values are served instead,
     and the stale flag is set (used by the confidence-score heuristic in Phase 3).

Maintains a "last known good" snapshot (is_last_known_good=True rows) that can
be manually refreshed before a demo via: scripts/refresh_cwc_snapshot.py

Build this scraper in Week 1 (not later) — station page layouts can change
without notice, so failures must surface early (Build Guide §3.1).

IMPORTANT: This parser targets the pilot district's specific station page
structure. The selector `_GAUGE_VALUE_SELECTOR` must be confirmed/updated
against the actual live page before demo day (Build Guide §3.6).
"""

import logging
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import HazardReading, RiverLevelSnapshotCache

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 10

# ─── ASSUMPTION: CWC station config for the pilot district ────────────────────
# These station URLs and IDs must be confirmed against the actual CWC / India-WRIS
# public pages for your chosen pilot district before demo day (Build Guide §3.6).
# [ASSUMPTION: station page URL and gauge table selector — verify on Day 1]
CWC_STATIONS = [
    {
        "station_id": f"cwc_{settings.pilot_district.lower()}_001",
        "district": settings.pilot_district,
        "url": "https://cwc.gov.in/sites/default/files/chaliyar.html",  # [ASSUMPTION]
        "selector": "table.gauge-table tr td:nth-child(2)",              # [ASSUMPTION]
    },
]


def _scrape_station(station: dict) -> float | None:
    """
    Attempt to scrape the current gauge level from the CWC station HTML page.
    Returns the float value on success, None on any parse/network failure.
    Station page layout varies by district — update `selector` per-station.
    """
    try:
        resp = requests.get(station["url"], timeout=REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        el = soup.select_one(station["selector"])
        if el and el.text.strip():
            return float(el.text.strip().split()[0])
        logger.warning(
            "CWC scraper: could not find gauge value for station %s using selector '%s'",
            station["station_id"],
            station["selector"],
        )
    except requests.RequestException as exc:
        logger.warning("CWC scraper network error for station %s: %s", station["station_id"], exc)
    except (ValueError, AttributeError) as exc:
        logger.warning("CWC scraper parse error for station %s: %s", station["station_id"], exc)
    return None


async def _get_cached_value(db: AsyncSession, station_id: str) -> float | None:
    """
    Read the most recent cached river level for a station.
    Returns the cached value or None if no cache row exists.
    """
    result = await db.execute(
        select(RiverLevelSnapshotCache)
        .where(RiverLevelSnapshotCache.station_id == station_id)
        .order_by(RiverLevelSnapshotCache.fetched_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    return float(row.value) if row else None


async def _write_snapshot_cache(
    db: AsyncSession,
    station: dict,
    value: float,
    is_last_known_good: bool = False,
) -> None:
    """Persist a river level snapshot to the cache table."""
    db.add(
        RiverLevelSnapshotCache(
            station_id=station["station_id"],
            district=station["district"],
            value=value,
            fetched_at=datetime.now(timezone.utc),
            is_last_known_good=is_last_known_good,
        )
    )


async def fetch_river_level_job(db: AsyncSession) -> None:
    """
    Scheduled job: scrape CWC river gauge levels and write to hazard_readings.
    Implements cache-first + stale-on-failure pattern (Build Guide §3.6).
    """
    now = datetime.now(timezone.utc)

    for station in CWC_STATIONS:
        station_id = station["station_id"]
        value = _scrape_station(station)
        is_stale = False

        if value is None:
            # Scrape failed — fall back to last cached value
            value = await _get_cached_value(db, station_id)
            is_stale = True
            if value is None:
                logger.error(
                    "CWC: no live or cached value for station %s — skipping this cycle",
                    station_id,
                )
                continue
            logger.info(
                "CWC: live scrape failed for %s — serving cached value %.2f (stale)",
                station_id,
                value,
            )
        else:
            # Live scrape succeeded — update the cache
            await _write_snapshot_cache(db, station, value)
            logger.info("CWC: live scrape OK for %s — value=%.2f m", station_id, value)

        # Write normalised record to hazard_readings
        # is_stale is carried via unit field so the confidence heuristic can detect it
        db.add(
            HazardReading(
                source="cwc",
                location_id=station_id,
                hazard_type="river_level",
                value=value,
                unit="metres_stale" if is_stale else "metres",
                observed_at=now,
                fetched_at=now,
            )
        )

    await db.commit()


async def get_river_level_cache_first(db: AsyncSession, station_id: str) -> dict:
    """
    Cache-first read for the dashboard/API layer (Build Guide §3.6).
    Always returns the best available value — live or cached.
    Never raises; callers can rely on the returned dict having a 'value' key.
    """
    result = await db.execute(
        select(RiverLevelSnapshotCache)
        .where(RiverLevelSnapshotCache.station_id == station_id)
        .order_by(RiverLevelSnapshotCache.fetched_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row:
        return {
            "station_id": station_id,
            "value": float(row.value),
            "fetched_at": row.fetched_at.isoformat(),
            "is_last_known_good": row.is_last_known_good,
            "is_stale": row.is_last_known_good,
        }
    return {
        "station_id": station_id,
        "value": 0.0,
        "fetched_at": None,
        "is_last_known_good": False,
        "is_stale": True,
        "note": "No cached data available — run the CWC fetcher at least once.",
    }
