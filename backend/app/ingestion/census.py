"""
PRAHARI-AI — Census / SECC Population Loader
=============================================
Tier: 1 (static data) | Schedule: one-time batch load (not scheduled)

Loads ward/village-level population figures from a Census / SECC bulk-download file
into the wards table. This is static data (Build Guide §2, §4.1) — no live API exists.
A live API must NOT be invented for this source.

Supports re-import (idempotent upsert) if the underlying bulk file is refreshed later.

Expected CSV format:
    ward_id, district, population, centroid_lat, centroid_lon
    ward_001, Wayanad, 4521, 11.612, 76.082
    ...

Run via: python scripts/seed_demo_data.py
or directly: python -m app.ingestion.census <path_to_csv>
"""

import csv
import logging
from pathlib import Path

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Ward

logger = logging.getLogger(__name__)


async def load_population_from_csv(db: AsyncSession, csv_path: str) -> int:
    """
    Idempotent upsert of population data from a CSV file into the wards table.
    Creates ward rows if they don't exist; updates population if they do.

    Parameters
    ----------
    db       : AsyncSession
    csv_path : str — path to the Census/SECC CSV file

    Returns
    -------
    int — number of ward rows inserted or updated
    """
    path = Path(csv_path)
    if not path.exists():
        logger.error("Census CSV not found at: %s", csv_path)
        return 0

    rows_processed = 0
    try:
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ward_id = row["ward_id"].strip()
                district = row["district"].strip()
                population = float(row["population"].strip())
                centroid_lat = float(row.get("centroid_lat", 0))
                centroid_lon = float(row.get("centroid_lon", 0))

                # Upsert: insert new ward or update population on conflict
                stmt = (
                    pg_insert(Ward)
                    .values(
                        ward_id=ward_id,
                        district=district,
                        population=population,
                        centroid_lat=centroid_lat,
                        centroid_lon=centroid_lon,
                    )
                    .on_conflict_do_update(
                        index_elements=["ward_id"],
                        set_={
                            "population": population,
                            "district": district,
                            "centroid_lat": centroid_lat,
                            "centroid_lon": centroid_lon,
                        },
                    )
                )
                await db.execute(stmt)
                rows_processed += 1

        await db.commit()
        logger.info("Census loader: %d ward population rows loaded from %s", rows_processed, csv_path)
    except (FileNotFoundError, KeyError, ValueError) as exc:
        logger.error("Census loader failed: %s", exc)
        await db.rollback()

    return rows_processed
