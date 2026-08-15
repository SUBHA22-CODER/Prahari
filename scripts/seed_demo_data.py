"""
PRAHARI-AI — Demo Data Seeder
==============================
Seeds the database with demo/test data for:
  1. Wards table (10 pilot wards for Wayanad district)
  2. Hazard readings (simulated current rainfall + river levels)
  3. Risk scores (derived from the Phase 3 engine)
  4. CAP alerts (at least one Critical and one Alert)
  5. Historical data placeholder for the backtest chart
  6. Feedback before/after sample data (Tier 2 demo)

Run inside Docker:
    docker compose exec backend python scripts/seed_demo_data.py

IMPORTANT: Any data in this script that is not sourced from real Census/SECC or
real historical events is clearly marked [PLACEHOLDER] in comments below.
Do NOT present placeholder data as real to judges (Build Guide §17).
"""

import asyncio
import csv
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add parent dir to path so app imports resolve
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import (
    Base, HazardReading, Ward, RiskScore, Alert, Feedback
)
from app.risk.engine import compute_risk

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://prahari:prahari_pass@localhost:5432/prahari_db",
).replace("postgresql+psycopg2://", "postgresql+asyncpg://")


# ─── Ward seed data ────────────────────────────────────────────────────────────
# [PLACEHOLDER: ward_id, population, infrastructure_count and coordinates below
#  are representative values for Wayanad district demonstration purposes.
#  Replace with actual Census/SECC data before the SIH demo.]
WAYANAD_WARDS = [
    {"ward_id": "ward_001", "district": "Wayanad", "population": 4521,  "infra": 2, "lat": 11.612, "lon": 76.082},
    {"ward_id": "ward_002", "district": "Wayanad", "population": 6832,  "infra": 4, "lat": 11.598, "lon": 76.071},
    {"ward_id": "ward_003", "district": "Wayanad", "population": 3412,  "infra": 1, "lat": 11.640, "lon": 76.095},
    {"ward_id": "ward_004", "district": "Wayanad", "population": 8201,  "infra": 6, "lat": 11.575, "lon": 76.052},
    {"ward_id": "ward_005", "district": "Wayanad", "population": 5643,  "infra": 3, "lat": 11.655, "lon": 76.112},
    {"ward_id": "ward_006", "district": "Wayanad", "population": 2987,  "infra": 1, "lat": 11.620, "lon": 76.135},
    {"ward_id": "ward_007", "district": "Wayanad", "population": 7123,  "infra": 5, "lat": 11.590, "lon": 76.040},
    {"ward_id": "ward_008", "district": "Wayanad", "population": 4056,  "infra": 2, "lat": 11.668, "lon": 76.088},
    {"ward_id": "ward_009", "district": "Wayanad", "population": 9342,  "infra": 7, "lat": 11.560, "lon": 76.060},
    {"ward_id": "ward_010", "district": "Wayanad", "population": 5778,  "infra": 3, "lat": 11.630, "lon": 76.150},
]


async def seed_wards(db: AsyncSession):
    print("Seeding wards...")
    for w in WAYANAD_WARDS:
        # Generate a small square polygon (approx. 4km x 4km) around the centroid
        lon = w["lon"]
        lat = w["lat"]
        wkt_polygon = f"POLYGON(({lon-0.02} {lat-0.02}, {lon+0.02} {lat-0.02}, {lon+0.02} {lat+0.02}, {lon-0.02} {lat+0.02}, {lon-0.02} {lat-0.02}))"

        stmt = (
            pg_insert(Ward)
            .values(
                ward_id=w["ward_id"],
                district=w["district"],
                population=w["population"],
                infrastructure_count=w["infra"],
                slope_proxy_cached=25.0,  # [PLACEHOLDER: replace with Bhuvan data]
                centroid_lat=lat,
                centroid_lon=lon,
                boundary=wkt_polygon,
                vulnerability_score=None,  # Computed in Phase 2
            )
            .on_conflict_do_update(
                index_elements=["ward_id"],
                set_={
                    "population": w["population"],
                    "infrastructure_count": w["infra"],
                    "boundary": wkt_polygon,
                    "centroid_lat": lat,
                    "centroid_lon": lon,
                },
            )
        )
        await db.execute(stmt)
    await db.commit()
    print(f"  ✓ {len(WAYANAD_WARDS)} wards seeded with generated boundary polygons")


async def seed_hazard_readings(db: AsyncSession):
    print("Seeding hazard readings...")
    now = datetime.now(timezone.utc)
    # [PLACEHOLDER: simulated current values for demo day]
    readings = [
        {"ward": "ward_001", "rain": 85.0, "river": 8.5},
        {"ward": "ward_002", "rain": 72.0, "river": 7.2},
        {"ward": "ward_003", "rain": 45.0, "river": 4.1},
        {"ward": "ward_004", "rain": 92.0, "river": 9.4},  # Will trigger Critical
        {"ward": "ward_005", "rain": 38.0, "river": 3.0},
        {"ward": "ward_006", "rain": 55.0, "river": 5.1},
        {"ward": "ward_007", "rain": 78.0, "river": 7.8},
        {"ward": "ward_008", "rain": 22.0, "river": 1.8},
        {"ward": "ward_009", "rain": 88.0, "river": 8.9},  # Will trigger Alert
        {"ward": "ward_010", "rain": 31.0, "river": 2.5},
    ]
    for r in readings:
        db.add(HazardReading(
            source="open_meteo", location_id=r["ward"], hazard_type="rainfall",
            value=r["rain"], unit="mm_per_hr", observed_at=now, fetched_at=now,
        ))
        db.add(HazardReading(
            source="cwc", location_id=r["ward"], hazard_type="river_level",
            value=r["river"], unit="metres", observed_at=now, fetched_at=now,
        ))
    await db.commit()
    print(f"  ✓ {len(readings) * 2} hazard readings seeded")


async def seed_risk_scores(db: AsyncSession):
    print("Seeding risk scores...")
    now = datetime.now(timezone.utc)
    scenarios = [
        {"ward": "ward_001", "rain": 85, "river": 85, "slope": 30, "hist": 25},
        {"ward": "ward_002", "rain": 72, "river": 72, "slope": 25, "hist": 20},
        {"ward": "ward_003", "rain": 45, "river": 41, "slope": 20, "hist": 15},
        {"ward": "ward_004", "rain": 92, "river": 94, "slope": 35, "hist": 30},  # Critical
        {"ward": "ward_005", "rain": 38, "river": 30, "slope": 15, "hist": 10},
        {"ward": "ward_006", "rain": 55, "river": 51, "slope": 22, "hist": 18},
        {"ward": "ward_007", "rain": 78, "river": 78, "slope": 28, "hist": 22},
        {"ward": "ward_008", "rain": 22, "river": 18, "slope": 10, "hist": 8},
        {"ward": "ward_009", "rain": 88, "river": 89, "slope": 32, "hist": 28},
        {"ward": "ward_010", "rain": 31, "river": 25, "slope": 12, "hist": 10},
    ]
    for s in scenarios:
        score, contrib = compute_risk(s["rain"], s["river"], s["slope"], s["hist"])
        db.add(RiskScore(
            ward_id=s["ward"], computed_at=now, risk_score=score,
            rainfall_intensity=s["rain"], river_level_trend=s["river"],
            slope_saturation_proxy=s["slope"], historical_incident_density=s["hist"],
            contribution_rainfall=contrib["rainfall"],
            contribution_river=contrib["river"],
            contribution_slope=contrib["slope"],
            contribution_history=contrib["history"],
            confidence_score=0.75,
        ))
    await db.commit()
    print("  ✓ Risk scores seeded")


async def seed_alerts(db: AsyncSession):
    print("Seeding CAP alerts...")
    now = datetime.now(timezone.utc)
    db.add(Alert(
        identifier="PRAHARI-2026-000001",
        sender="prahari-ai-demo",
        sent=now,
        status="Actual",
        msg_type="Alert",
        event="Flood / Landslide Risk — Critical",
        urgency="Immediate",
        severity="Severe",
        certainty="Likely",
        area_desc="ward_004, Wayanad",
        instruction=(
            "Evacuate low-lying zones near the river and landslide-prone slopes. "
            "Close schools and public spaces. Activate pump stations. Alert NDRF."
        ),
        ward_id="ward_004",
        risk_band="Critical",
    ))
    db.add(Alert(
        identifier="PRAHARI-2026-000002",
        sender="prahari-ai-demo",
        sent=now - timedelta(hours=1),
        status="Actual",
        msg_type="Alert",
        event="Flood / Landslide Risk — Alert",
        urgency="Expected",
        severity="Moderate",
        certainty="Possible",
        area_desc="ward_009, Wayanad",
        instruction=(
            "Notify local officials and district administration. "
            "Advise residents in low-lying areas to prepare for possible evacuation."
        ),
        ward_id="ward_009",
        risk_band="Alert",
    ))
    await db.commit()
    print("  ✓ 2 CAP alerts seeded (Critical + Alert)")


async def seed_historical_backtest_csv():
    """
    Write a synthetic backtest CSV for Wayanad 2024.
    [PLACEHOLDER: Replace with actual IMD/CWC historical data sourced in Week 1 —
     Build Guide §7, §3.1: confirm from IMD archives, data.gov.in, or news-reported
     gauge readings. This placeholder ensures the backtest chart renders on demo day
     even if real data acquisition is not yet complete.]
    """
    print("Seeding historical backtest CSV...")
    path = Path("data/historical")
    path.mkdir(parents=True, exist_ok=True)
    csv_path = path / "wayanad_2024_historical.csv"

    base = datetime(2024, 7, 26, tzinfo=timezone.utc)  # 4 days before event
    rows = []
    for i in range(40):  # 40 readings at 6-hour intervals = ~10 days
        dt = base + timedelta(hours=i * 6)
        # Simulate rising rainfall and river levels approaching the event
        rain = 15.0 + i * 3.5 + (i > 28) * i * 4  # Spike near event
        river = 2.0 + i * 0.35 + (i > 28) * i * 0.6
        rows.append({
            "timestamp": dt.isoformat(),
            "rainfall_mm_hr": round(min(rain, 130), 1),
            "river_level_m": round(min(river, 14), 2),
            "slope_proxy": 28.0,
            "hist_density": 20.0,
        })

    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "rainfall_mm_hr", "river_level_m", "slope_proxy", "hist_density"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"  ✓ Historical backtest CSV written: {csv_path}")
    print("  ⚠ [PLACEHOLDER] Replace with real IMD/CWC data for actual historical accuracy")


async def seed_feedback(db: AsyncSession):
    """Seed sample feedback for Tier 2 before/after comparison demo."""
    print("Seeding feedback data...")
    outcomes = ["yes", "no", "no", "partial", "yes"]
    for i, outcome in enumerate(outcomes):
        db.add(Feedback(
            alert_id="PRAHARI-2026-000001",
            predicted_risk=78.5,
            predicted_zone="ward_004",
            actual_outcome=outcome,
            timestamp=datetime.now(timezone.utc) - timedelta(hours=i * 3),
        ))
    await db.commit()
    print("  ✓ Sample feedback seeded for before/after weight comparison")


async def main():
    print("=" * 50)
    print("PRAHARI-AI Demo Data Seeder")
    print("=" * 50)

    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        await seed_wards(db)
        await seed_hazard_readings(db)
        await seed_risk_scores(db)
        await seed_alerts(db)
        await seed_feedback(db)

    await seed_historical_backtest_csv()

    print("=" * 50)
    print("✅ Demo data seeded successfully!")
    print("   → Dashboard: http://localhost:5173")
    print("   → API docs:  http://localhost:8000/docs")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
