"""
PRAHARI-AI — CWC Last-Known-Good Snapshot Refresher
=====================================================
Phase 1 | Build Guide §3.6, §5.2 (CWC scraper requirements)

Admin CLI command to manually refresh the CWC river-gauge "last known good"
snapshot in the river_level_snapshot_cache table before a demo.

Usage:
    docker compose exec backend python scripts/refresh_cwc_snapshot.py
    OR (local dev):
    python scripts/refresh_cwc_snapshot.py

Build Guide §3.6 requirement (exact):
    "Maintain a static 'last known good' snapshot table for the pilot district's
    river level, manually refreshable before a demo, as a guaranteed fallback if
    the live scrape fails during judging (mark rows with is_last_known_good=true)."

What this script does:
    1. Attempts a fresh live CWC scrape for each configured station.
    2. On success: writes the fresh value with is_last_known_good=True.
    3. On failure: reads the last stored value and marks it is_last_known_good=True.
    4. Clears the is_last_known_good flag on all older rows for the same station
       (only the most recent row should be the fallback anchor).

Run this script before every demo rehearsal and on demo day.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import RiverLevelSnapshotCache
from app.ingestion.cwc import _scrape_station, CWC_STATIONS

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://prahari:prahari_pass@localhost:5432/prahari_db",
)


async def refresh_snapshot_for_station(db: AsyncSession, station: dict) -> None:
    """
    Refresh the last-known-good snapshot for one CWC station.
    Attempts live scrape first; falls back to most recent cached value on failure.
    """
    station_id = station["station_id"]
    district = station["district"]
    now = datetime.now(timezone.utc)

    # Attempt live scrape
    scraped = _scrape_station(station)

    if scraped is not None:
        value = scraped["value"]
        source = "live_scrape"
        print(f"  ✓ Live scrape OK: {station_id} = {value}m")
    else:
        # Fall back to most recent existing cache entry
        result = await db.execute(
            select(RiverLevelSnapshotCache)
            .where(RiverLevelSnapshotCache.station_id == station_id)
            .order_by(RiverLevelSnapshotCache.fetched_at.desc())
            .limit(1)
        )
        last_row = result.scalar_one_or_none()
        if last_row is None:
            print(f"  ✗ {station_id}: live scrape failed AND no cached value exists — skipping")
            return
        value = float(last_row.value)
        source = "from_cache_fallback"
        print(f"  ⚠ {station_id}: live scrape failed — using cached value {value}m [{source}]")

    # Clear is_last_known_good on all existing rows for this station
    await db.execute(
        update(RiverLevelSnapshotCache)
        .where(RiverLevelSnapshotCache.station_id == station_id)
        .values(is_last_known_good=False)
    )

    # Insert the new last-known-good row
    db.add(
        RiverLevelSnapshotCache(
            station_id=station_id,
            district=district,
            value=value,
            fetched_at=now,
            is_last_known_good=True,
        )
    )
    await db.commit()
    print(f"  ✓ {station_id}: is_last_known_good snapshot saved ({source})")


async def main():
    print("=" * 55)
    print("PRAHARI-AI — CWC Snapshot Refresher")
    print("=" * 55)
    print(f"Refreshing snapshots for {len(CWC_STATIONS)} configured CWC stations...\n")

    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        for station in CWC_STATIONS:
            await refresh_snapshot_for_station(db, station)

    print("\n" + "=" * 55)
    print("✅ CWC snapshot refresh complete.")
    print("   Dashboard will use these values as the fallback.")
    print("   Run this again if live CWC scraping fails on demo day.")
    print("=" * 55)


if __name__ == "__main__":
    asyncio.run(main())
