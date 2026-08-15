"""
PRAHARI-AI — Database ORM Models
==================================
Defines all SQLAlchemy + GeoAlchemy2 models per Build Guide §1.1 and Phase 1 DB schema.

Tables:
  1. hazard_readings          — Common raw-ingestion format for all fetchers
  2. wards                    — Exposure/vulnerability grid (Phase 2)
  3. risk_scores              — Risk Engine output (Phase 3)
  4. wildfire_scores          — Wildfire module output, separate table (Tier 3)
  5. alerts                   — CAP-style alerts (Phase 4)
  6. feedback                 — Official one-tap feedback (Phase 6 / Tier 2)
  7. river_level_snapshot_cache — Cache-first fallback for CWC data (Build Guide §3.6)
"""

import uuid
from datetime import datetime

from geoalchemy2 import Geography, Geometry
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


# ─── 1. hazard_readings ───────────────────────────────────────────────────────

class HazardReading(Base):
    """
    One normalised record per fetcher run per ward.
    Common format (Build Guide §3.2) used by all ingestion modules.
    """
    __tablename__ = "hazard_readings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    # Identifies the data source (e.g. "open_meteo", "cwc", "bhuvan", "usgs",
    # "firms", "incois", "incois_tsunami", "osm")
    source = Column(String(64), nullable=False, index=True)

    # Ward identifier matching wards.ward_id (e.g. "ward_014")
    location_id = Column(String(64), nullable=False, index=True)

    # Hazard type (e.g. "rainfall", "river_level", "slope", "earthquake",
    # "fire", "tsunami_potential")
    hazard_type = Column(String(64), nullable=False, index=True)

    value = Column(Numeric, nullable=False)

    # e.g. "mm_per_hr", "metres", "mm_cumulative_72h", "richter", "mw", "frp"
    unit = Column(String(32), nullable=False)

    # Timestamp of the observation in the source data
    observed_at = Column(DateTime(timezone=True), nullable=False)

    # Timestamp of when we fetched and stored this reading
    fetched_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # PostGIS point for the reading location (EPSG:4326 / WGS84)
    geom = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)

    __table_args__ = (
        Index("ix_hazard_latest", "location_id", "source", "hazard_type", "observed_at"),
    )


# ─── 2. wards ─────────────────────────────────────────────────────────────────

class Ward(Base):
    """
    Exposure and vulnerability grid. One row per administrative ward / village
    in the pilot district. (Build Guide §4.1)
    """
    __tablename__ = "wards"

    ward_id = Column(String(64), primary_key=True)
    district = Column(String(128), nullable=False, index=True)

    # PostGIS polygon boundary (EPSG:4326)
    boundary = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)

    # Population from Census / SECC static bulk download (Build Guide §4.1)
    population = Column(Numeric, nullable=True)

    # Count of schools + hospitals from OSM Overpass (Build Guide §4.2)
    infrastructure_count = Column(Integer, nullable=True)

    # Normalised combination of population density + infrastructure_count (0-100)
    # Formula: (norm_pop_density * 0.6) + (norm_infra_count * 0.4)
    # [ASSUMPTION: exact combination weights are not specified; this split is
    #  documented as consistent with "a simple normalised combination" — Build Guide §4.1]
    vulnerability_score = Column(Numeric, nullable=True)

    # Cached slope / land-use from Bhuvan (Build Guide §3.5)
    # Re-fetched monthly, not on every rainfall cycle.
    slope_proxy_cached = Column(Numeric, nullable=True)
    last_bhuvan_fetch_at = Column(DateTime(timezone=True), nullable=True)

    # Centroid coordinates for fetcher iteration
    centroid_lat = Column(Numeric, nullable=True)
    centroid_lon = Column(Numeric, nullable=True)

    risk_scores = relationship("RiskScore", back_populates="ward", lazy="select")
    alerts = relationship("Alert", back_populates="ward", lazy="select")


# ─── 3. risk_scores ──────────────────────────────────────────────────────────

class RiskScore(Base):
    """
    Output of the Risk Fusion Engine per ward per scoring cycle.
    Stores all four inputs, four weighted contributions, and a confidence heuristic.
    (Build Guide §5.1-§5.5)
    """
    __tablename__ = "risk_scores"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ward_id = Column(String(64), ForeignKey("wards.ward_id"), nullable=False, index=True)
    computed_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Composite score 0-100 (Build Guide §5.1 formula)
    risk_score = Column(Numeric(5, 1), nullable=False)

    # Raw normalised inputs (0-100 each)
    rainfall_intensity = Column(Numeric, nullable=True)
    river_level_trend = Column(Numeric, nullable=True)
    slope_saturation_proxy = Column(Numeric, nullable=True)
    historical_incident_density = Column(Numeric, nullable=True)

    # Per-factor weighted contributions (for explainability — Build Guide §5.5)
    # contribution_x = weight_x * input_x
    contribution_rainfall = Column(Numeric, nullable=True)
    contribution_river = Column(Numeric, nullable=True)
    contribution_slope = Column(Numeric, nullable=True)
    contribution_history = Column(Numeric, nullable=True)

    # Confidence heuristic: higher when more inputs are fresh/recent (Build Guide §5.4)
    # MVP: proportion of inputs that have a reading within the last 30 minutes (rain/river)
    # or within the last 24h (slope/history).
    confidence_score = Column(Numeric(5, 2), nullable=True)

    ward = relationship("Ward", back_populates="risk_scores")


# ─── 4. wildfire_scores ───────────────────────────────────────────────────────

class WildfireScore(Base):
    """
    Tier 3 — Wildfire scoring module output.
    Wildfire does NOT feed into risk_scores — it is a separate, independent module
    (Build Guide §5.6). Never merge into the flood/landslide risk formula.
    """
    __tablename__ = "wildfire_scores"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ward_id = Column(String(64), ForeignKey("wards.ward_id"), nullable=False, index=True)
    computed_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Count of NASA FIRMS detection points within ward over the rolling window
    detection_count = Column(Integer, nullable=False, default=0)

    # Average Fire Radiative Power (FRP) of detections in the ward
    avg_frp = Column(Numeric, nullable=True)

    # Dryness context from Open-Meteo: low recent rainfall + high temperature
    dryness_context = Column(Numeric, nullable=True)

    # Combined wildfire risk score (0-100, independently derived)
    wildfire_risk_score = Column(Numeric(5, 1), nullable=True)


# ─── 5. alerts ────────────────────────────────────────────────────────────────

class Alert(Base):
    """
    CAP-style alert records (Build Guide §6.2).
    Field structure matches the Common Alerting Protocol (OASIS open standard).
    Dissemination is SIMULATED — no real SACHET integration.
    """
    __tablename__ = "alerts"

    # e.g. "PRAHARI-2026-000123"
    identifier = Column(String(64), primary_key=True)

    sender = Column(String(128), nullable=False, default="prahari-ai-demo")
    sent = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # CAP status field — always "Actual" for real-risk triggers in the demo
    status = Column(String(32), nullable=False, default="Actual")

    # CAP msgType — always "Alert" on new trigger
    msg_type = Column(String(32), nullable=False, default="Alert")

    # Derived from the hazard type that triggered the alert
    event = Column(String(128), nullable=False)

    urgency = Column(String(32), nullable=False)    # Immediate | Expected
    severity = Column(String(32), nullable=False)   # Severe | Moderate
    certainty = Column(String(32), nullable=False)  # Likely | Possible

    area_desc = Column(Text, nullable=False)        # e.g. "Ward 14, Wayanad"
    instruction = Column(Text, nullable=False)      # Recommended action verbatim

    ward_id = Column(String(64), ForeignKey("wards.ward_id"), nullable=False, index=True)

    # Risk band that triggered this alert: "Alert" (40-70) | "Critical" (70-100)
    risk_band = Column(String(16), nullable=False)

    ward = relationship("Ward", back_populates="alerts")
    feedback = relationship("Feedback", back_populates="alert", lazy="select")


# ─── 6. feedback ──────────────────────────────────────────────────────────────

class Feedback(Base):
    """
    Tier 2 — Official one-tap feedback on alert accuracy.
    Logged outcomes drive weight recalibration (Build Guide §8.1-§8.2).
    Endpoint is role-restricted to the 'official' role (Build Guide §8.1,
    Project PDF §10).
    """
    __tablename__ = "feedback"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    alert_id = Column(String(64), ForeignKey("alerts.identifier"), nullable=False, index=True)

    predicted_risk = Column(Numeric, nullable=False)
    predicted_zone = Column(String(64), nullable=False)   # ward_id at time of prediction

    # Official's verdict: 'yes' | 'no' | 'partial'
    actual_outcome = Column(String(16), nullable=False)

    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    alert = relationship("Alert", back_populates="feedback")


# ─── 7. river_level_snapshot_cache ────────────────────────────────────────────

class RiverLevelSnapshotCache(Base):
    """
    Cache-first fallback for CWC river gauge data (Build Guide §3.6).
    A scrape failure must never blank the dashboard — the system reads from
    this cache first, then attempts a live fetch.
    Rows marked is_last_known_good=True are the manually-refreshable demo fallback.
    """
    __tablename__ = "river_level_snapshot_cache"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    # CWC station identifier
    station_id = Column(String(64), nullable=False, index=True)
    district = Column(String(128), nullable=False)

    # Gauge reading value (metres above datum)
    value = Column(Numeric, nullable=False)

    fetched_at = Column(DateTime(timezone=True), nullable=False)

    # When True, this row is the manually-refreshed guaranteed-good fallback
    # for demo day. Set via CLI command `scripts/refresh_cwc_snapshot.py`.
    is_last_known_good = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        Index("ix_river_cache_station_fetched", "station_id", "fetched_at"),
    )
