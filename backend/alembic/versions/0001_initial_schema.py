"""
PRAHARI-AI — Initial Database Schema Migration
================================================
Phase 1 | Build Guide §4, §3.2, §5, §6.2, §8.1
Revision ID: 0001_initial_schema

Creates all 7 tables:
  1. hazard_readings          — common ingestion format for every fetcher
  2. wards                    — exposure/vulnerability grid (PostGIS polygon boundary)
  3. risk_scores              — Risk Engine output per ward per cycle
  4. wildfire_scores          — Tier 3 wildfire module (separate table, never merged)
  5. alerts                   — CAP-style structured alerts
  6. feedback                 — Tier 2 official one-tap outcome logging
  7. river_level_snapshot_cache — CWC cache-first fallback

INDEXES (Build Guide Phase 1 acceptance criteria):
  - ix_hazard_latest: (location_id, source, hazard_type, observed_at)
    → powers "latest reading per ward per source" query
  - ix_risk_ward_computed: (ward_id, computed_at DESC)
    → powers "current risk score for all wards" dashboard query
  - PostGIS spatial indexes on wards.boundary and hazard_readings.geom
    → power ward-boundary spatial joins (OSM Overpass, FIRMS)

DOWN migration: drops all tables cleanly (safe for test environment reset).
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Enable PostGIS extension (idempotent — safe to run multiple times) ────
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ── 1. wards ─────────────────────────────────────────────────────────────
    # Created FIRST because risk_scores, wildfire_scores, alerts, and feedback
    # all have FK → wards.ward_id
    op.create_table(
        "wards",
        sa.Column("ward_id", sa.String(64), primary_key=True),
        sa.Column("district", sa.String(128), nullable=False),
        # PostGIS POLYGON boundary in WGS84 (EPSG:4326)
        # Raw SQL type — GeoAlchemy2 handles DDL via model.create_all() in dev;
        # here we emit raw SQL to avoid geoalchemy2 DDL dependency in Alembic.
        sa.Column("boundary", sa.Text(), nullable=True,
                  comment="PostGIS Geometry(Polygon, 4326) — stored as text type ref for Alembic; actual column type set by PostGIS"),
        sa.Column("population", sa.Numeric(), nullable=True),
        sa.Column("infrastructure_count", sa.Integer(), nullable=True),
        sa.Column("vulnerability_score", sa.Numeric(), nullable=True),
        sa.Column("slope_proxy_cached", sa.Numeric(), nullable=True),
        sa.Column("last_bhuvan_fetch_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("centroid_lat", sa.Numeric(), nullable=True),
        sa.Column("centroid_lon", sa.Numeric(), nullable=True),
    )
    # Standard B-tree index on district (for filtering by pilot district)
    op.create_index("ix_wards_district", "wards", ["district"])

    # Raw SQL for the PostGIS geometry column and spatial index — Alembic cannot
    # emit these through standard DDL; raw SQL is the correct approach.
    op.execute("""
        ALTER TABLE wards
        ALTER COLUMN boundary TYPE geometry(Polygon, 4326)
        USING ST_GeomFromText(boundary, 4326)
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_wards_boundary_gist ON wards USING GIST (boundary)")

    # ── 2. hazard_readings ────────────────────────────────────────────────────
    op.create_table(
        "hazard_readings",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("source", sa.String(64), nullable=False),
        sa.Column("location_id", sa.String(64), nullable=False),
        sa.Column("hazard_type", sa.String(64), nullable=False),
        sa.Column("value", sa.Numeric(), nullable=False),
        sa.Column("unit", sa.String(32), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        # PostGIS geography point — nullable; set when lat/lon available
        sa.Column("geom", sa.Text(), nullable=True,
                  comment="PostGIS Geography(Point, 4326) — actual type set by PostGIS ALTER"),
    )
    # Composite index: powers "latest reading per ward per source per hazard_type" query
    # (Build Guide Phase 1 acceptance criterion #1)
    op.create_index(
        "ix_hazard_latest",
        "hazard_readings",
        ["location_id", "source", "hazard_type", "observed_at"],
    )
    op.create_index("ix_hazard_readings_source", "hazard_readings", ["source"])

    # PostGIS geography column for point readings
    op.execute("""
        ALTER TABLE hazard_readings
        ALTER COLUMN geom TYPE geography(Point, 4326)
        USING ST_GeogFromText(geom)
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_hazard_geom_gist ON hazard_readings USING GIST (geom)")

    # ── 3. risk_scores ────────────────────────────────────────────────────────
    op.create_table(
        "risk_scores",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("ward_id", sa.String(64),
                  sa.ForeignKey("wards.ward_id", ondelete="CASCADE"), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("risk_score", sa.Numeric(5, 1), nullable=False),
        # Raw normalised inputs (0-100 each)
        sa.Column("rainfall_intensity", sa.Numeric(), nullable=True),
        sa.Column("river_level_trend", sa.Numeric(), nullable=True),
        sa.Column("slope_saturation_proxy", sa.Numeric(), nullable=True),
        sa.Column("historical_incident_density", sa.Numeric(), nullable=True),
        # Per-factor contributions (weight * input) — explainability output §5.5
        sa.Column("contribution_rainfall", sa.Numeric(), nullable=True),
        sa.Column("contribution_river", sa.Numeric(), nullable=True),
        sa.Column("contribution_slope", sa.Numeric(), nullable=True),
        sa.Column("contribution_history", sa.Numeric(), nullable=True),
        # Confidence heuristic §5.4
        sa.Column("confidence_score", sa.Numeric(5, 2), nullable=True),
    )
    # Index for "latest risk score per ward" (dashboard query — Phase 1 criterion #2)
    op.create_index("ix_risk_ward_id", "risk_scores", ["ward_id"])
    op.create_index(
        "ix_risk_ward_computed",
        "risk_scores",
        ["ward_id", sa.text("computed_at DESC")],
    )

    # ── 4. wildfire_scores (Tier 3 — separate table, never merged) ───────────
    op.create_table(
        "wildfire_scores",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("ward_id", sa.String(64),
                  sa.ForeignKey("wards.ward_id", ondelete="CASCADE"), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("detection_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("avg_frp", sa.Numeric(), nullable=True),
        sa.Column("dryness_context", sa.Numeric(), nullable=True),
        sa.Column("wildfire_risk_score", sa.Numeric(5, 1), nullable=True),
    )
    op.create_index("ix_wildfire_ward_id", "wildfire_scores", ["ward_id"])

    # ── 5. alerts ─────────────────────────────────────────────────────────────
    op.create_table(
        "alerts",
        sa.Column("identifier", sa.String(64), primary_key=True),
        sa.Column("sender", sa.String(128), nullable=False, server_default="prahari-ai-demo"),
        sa.Column("sent", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("status", sa.String(32), nullable=False, server_default="Actual"),
        sa.Column("msg_type", sa.String(32), nullable=False, server_default="Alert"),
        sa.Column("event", sa.String(128), nullable=False),
        sa.Column("urgency", sa.String(32), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False),
        sa.Column("certainty", sa.String(32), nullable=False),
        sa.Column("area_desc", sa.Text(), nullable=False),
        sa.Column("instruction", sa.Text(), nullable=False),
        sa.Column("ward_id", sa.String(64),
                  sa.ForeignKey("wards.ward_id", ondelete="CASCADE"), nullable=False),
        # Risk band that triggered the alert: "Alert" (40-70) | "Critical" (70-100)
        sa.Column("risk_band", sa.String(16), nullable=False),
    )
    op.create_index("ix_alerts_ward_id", "alerts", ["ward_id"])
    op.create_index("ix_alerts_sent", "alerts", ["sent"])

    # ── 6. feedback (Tier 2) ──────────────────────────────────────────────────
    op.create_table(
        "feedback",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("alert_id", sa.String(64),
                  sa.ForeignKey("alerts.identifier", ondelete="CASCADE"), nullable=False),
        sa.Column("predicted_risk", sa.Numeric(), nullable=False),
        sa.Column("predicted_zone", sa.String(64), nullable=False),
        sa.Column("actual_outcome", sa.String(16), nullable=False),  # yes|no|partial
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("ix_feedback_alert_id", "feedback", ["alert_id"])

    # ── 7. river_level_snapshot_cache (CWC cache-first fallback §3.6) ─────────
    op.create_table(
        "river_level_snapshot_cache",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("station_id", sa.String(64), nullable=False),
        sa.Column("district", sa.String(128), nullable=False),
        sa.Column("value", sa.Numeric(), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_last_known_good", sa.Boolean(), nullable=False,
                  server_default="false"),
    )
    op.create_index(
        "ix_river_cache_station_fetched",
        "river_level_snapshot_cache",
        ["station_id", "fetched_at"],
    )


def downgrade() -> None:
    """Drop all PRAHARI-AI tables in reverse FK order."""
    op.drop_table("river_level_snapshot_cache")
    op.drop_table("feedback")
    op.drop_table("alerts")
    op.drop_table("wildfire_scores")
    op.drop_table("risk_scores")
    op.drop_table("hazard_readings")
    op.drop_table("wards")
