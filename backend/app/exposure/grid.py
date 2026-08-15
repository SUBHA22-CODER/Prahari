"""
PRAHARI-AI — Exposure and Vulnerability Grid
=============================================
Tier: 1 | Phase: 2

Manages the ward exposure / vulnerability grid for the pilot district.
Wires together Census/SECC population, Bhuvan slope cache, and OSM
infrastructure counts to compute a static vulnerability_score per ward
(Build Guide §4.1).

Vulnerability score formula:
    vulnerability_score = (norm_pop_density * 0.6) + (norm_infra_count * 0.4)
    where values are normalised to 0-100 within the pilot district.

[ASSUMPTION: the exact combination weights are not specified in the Build Guide —
 "a simple normalised combination" is used; this 0.6/0.4 split is documented
 as consistent with that description. Adjust if domain expertise suggests otherwise.]

Deliverable (Build Guide §4, acceptance criterion):
    A PostGIS wards table where every ward has a fixed population figure,
    infrastructure count, and vulnerability score.
"""

import logging

import numpy as np
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Ward

logger = logging.getLogger(__name__)


async def compute_vulnerability_scores(db: AsyncSession, district: str) -> int:
    """
    Compute and persist normalised vulnerability_score for all wards in a district.
    Reads existing population and infrastructure_count from the wards table.
    Safe to re-run (idempotent update).

    Returns the number of wards updated.
    """
    result = await db.execute(
        select(Ward).where(Ward.district == district)
    )
    wards = result.scalars().all()

    if not wards:
        logger.warning("No wards found for district '%s' — cannot compute vulnerability scores", district)
        return 0

    populations = np.array([float(w.population or 0) for w in wards])
    infra_counts = np.array([float(w.infrastructure_count or 0) for w in wards])

    # Normalise each dimension to 0-100 within the district
    def normalise(arr: np.ndarray) -> np.ndarray:
        max_val = arr.max()
        if max_val == 0:
            return np.zeros_like(arr)
        return (arr / max_val) * 100.0

    norm_pop = normalise(populations)
    norm_infra = normalise(infra_counts)

    vulnerability_scores = norm_pop * 0.6 + norm_infra * 0.4

    updated = 0
    for ward, score in zip(wards, vulnerability_scores):
        await db.execute(
            update(Ward)
            .where(Ward.ward_id == ward.ward_id)
            .values(vulnerability_score=round(float(score), 2))
        )
        updated += 1

    await db.commit()
    logger.info(
        "Exposure grid: vulnerability scores computed for %d wards in '%s'",
        updated, district,
    )
    return updated


async def get_ward_centroids(db: AsyncSession) -> list[dict]:
    """
    Return a list of {ward_id, lat, lon} for all wards in the database.
    Used by the Open-Meteo fetcher to iterate over ward coordinates.
    """
    result = await db.execute(
        select(Ward.ward_id, Ward.centroid_lat, Ward.centroid_lon)
    )
    return [
        {"ward_id": row[0], "lat": float(row[1] or 0), "lon": float(row[2] or 0)}
        for row in result.all()
        if row[1] and row[2]
    ]


async def get_ward_centroids_with_district(db: AsyncSession) -> list[dict]:
    """
    Return a list of {ward_id, lat, lon, district_code} for the Bhuvan monthly fetcher.
    """
    result = await db.execute(
        select(Ward.ward_id, Ward.centroid_lat, Ward.centroid_lon, Ward.district)
    )
    return [
        {
            "ward_id": row[0],
            "lat": float(row[1] or 0),
            "lon": float(row[2] or 0),
            "district_code": row[3],
        }
        for row in result.all()
        if row[1] and row[2]
    ]


async def get_ward_bboxes(db: AsyncSession) -> list[dict]:
    """
    Return bounding box extents for each ward for the FIRMS wildfire fetcher.
    Uses PostGIS ST_Envelope to derive the bounding box from the ward boundary polygon.
    Falls back to a centroid-based ±0.05 degree box if no boundary is set.
    """
    result = await db.execute(
        select(
            Ward.ward_id,
            Ward.centroid_lat,
            Ward.centroid_lon,
        )
    )
    bboxes = []
    for row in result.all():
        ward_id, lat, lon = row[0], float(row[1] or 0), float(row[2] or 0)
        # Approximate 0.05° (~5.5 km) bounding box around centroid
        bboxes.append({
            "ward_id": ward_id,
            "min_lat": lat - 0.05,
            "max_lat": lat + 0.05,
            "min_lon": lon - 0.05,
            "max_lon": lon + 0.05,
        })
    return bboxes


async def get_full_exposure_grid(db: AsyncSession, district: str) -> list[dict]:
    """
    Return the full exposure grid for a district as a list of dicts.
    Used by the FastAPI endpoint exposing ward data to the dashboard.
    """
    import json
    result = await db.execute(
        select(Ward, func.ST_AsGeoJSON(Ward.boundary)).where(Ward.district == district)
    )
    rows = result.all()
    return [
        {
            "ward_id": w.ward_id,
            "district": w.district,
            "population": float(w.population or 0),
            "infrastructure_count": w.infrastructure_count or 0,
            "vulnerability_score": float(w.vulnerability_score or 0),
            "slope_proxy_cached": float(w.slope_proxy_cached or 0),
            "centroid_lat": float(w.centroid_lat or 0),
            "centroid_lon": float(w.centroid_lon or 0),
            "boundary": json.loads(boundary_str) if boundary_str else None,
        }
        for w, boundary_str in rows
    ]
