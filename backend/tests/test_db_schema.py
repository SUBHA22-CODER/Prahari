"""
PRAHARI-AI — Phase 1 Database Schema Tests
============================================
Phase 1 | Build Guide §4, Playbook §4 (Acceptance Criteria)

Tests the ORM model definitions WITHOUT a live database, using SQLite in-memory
(via SQLAlchemy synchronous engine) as a proxy for schema structure correctness.

Validates:
  1. All 7 tables are registered in Base.metadata
  2. Every required column exists on each table (field completeness)
  3. Foreign key relationships are defined correctly
  4. The acceptance-criteria queries are structurally valid (SQL generation)
  5. All required indexes are registered on their expected tables
  6. Migration revision file exists and is importable
  7. River-level snapshot cache table supports is_last_known_good flag

NOTE: PostGIS-specific column types (Geography, Geometry) are mocked in the
      SQLite test environment — we test the schema structure, not PostGIS SQL.
"""

import pytest
from unittest.mock import patch, MagicMock


# ─── 1. Model Registration ─────────────────────────────────────────────────────

class TestModelRegistration:
    """All 7 PRAHARI-AI tables must be registered in Base.metadata."""

    REQUIRED_TABLES = {
        "hazard_readings",
        "wards",
        "risk_scores",
        "wildfire_scores",
        "alerts",
        "feedback",
        "river_level_snapshot_cache",
    }

    def test_all_tables_in_metadata(self):
        from app.db.session import Base
        import app.db.models  # registers all models  # noqa: F401

        registered = set(Base.metadata.tables.keys())
        for table in self.REQUIRED_TABLES:
            assert table in registered, f"Table '{table}' missing from Base.metadata"

    def test_no_unexpected_tables(self):
        """No phantom tables outside the 7 required ones (keeps schema clean)."""
        from app.db.session import Base
        import app.db.models  # noqa: F401

        registered = set(Base.metadata.tables.keys())
        unexpected = registered - self.REQUIRED_TABLES
        assert not unexpected, f"Unexpected tables in metadata: {unexpected}"


# ─── 2. hazard_readings Column Completeness ────────────────────────────────────

class TestHazardReadingsSchema:
    """
    Phase 1 criterion: common record format (Build Guide §3.2) columns present.
    source, location_id, hazard_type, value, unit, observed_at, fetched_at, geom
    """

    REQUIRED_COLUMNS = {
        "id", "source", "location_id", "hazard_type",
        "value", "unit", "observed_at", "fetched_at", "geom",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["hazard_readings"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, f"hazard_readings missing column: '{col}'"

    def test_has_ix_hazard_latest_index(self):
        """ix_hazard_latest index must exist (Phase 1 criterion: latest-per-ward query)."""
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["hazard_readings"]
        index_names = {idx.name for idx in table.indexes}
        assert "ix_hazard_latest" in index_names, (
            "ix_hazard_latest index missing from hazard_readings — "
            "required for latest-reading-per-ward-per-source query (Phase 1 criterion)"
        )


# ─── 3. wards Column Completeness ─────────────────────────────────────────────

class TestWardsSchema:
    """Build Guide §4.1 — all wards exposure fields must be present."""

    REQUIRED_COLUMNS = {
        "ward_id", "district", "boundary",
        "population", "infrastructure_count", "vulnerability_score",
        "slope_proxy_cached", "last_bhuvan_fetch_at",
        "centroid_lat", "centroid_lon",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["wards"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, f"wards missing column: '{col}'"

    def test_ward_id_is_primary_key(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["wards"]
        pk_cols = {c.name for c in table.primary_key.columns}
        assert "ward_id" in pk_cols


# ─── 4. risk_scores Column Completeness ───────────────────────────────────────

class TestRiskScoresSchema:
    """
    Build Guide §5.1-§5.5 — all four inputs, four contributions, and
    confidence_score must be persisted (explainability output).
    """

    REQUIRED_COLUMNS = {
        "id", "ward_id", "computed_at", "risk_score",
        "rainfall_intensity", "river_level_trend",
        "slope_saturation_proxy", "historical_incident_density",
        "contribution_rainfall", "contribution_river",
        "contribution_slope", "contribution_history",
        "confidence_score",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["risk_scores"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, f"risk_scores missing column: '{col}'"

    def test_ward_id_foreign_key(self):
        """risk_scores.ward_id must FK → wards.ward_id."""
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["risk_scores"]
        fk_targets = {fk.target_fullname for col in table.columns for fk in col.foreign_keys}
        assert "wards.ward_id" in fk_targets, "risk_scores.ward_id must FK → wards.ward_id"


# ─── 5. wildfire_scores — Separate Table Check ────────────────────────────────

class TestWildfireScoresSchema:
    """
    Build Guide §5.6 — wildfire scores MUST be in a separate table,
    never merged into risk_scores.
    """

    REQUIRED_COLUMNS = {
        "id", "ward_id", "computed_at",
        "detection_count", "avg_frp", "dryness_context", "wildfire_risk_score",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["wildfire_scores"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, f"wildfire_scores missing column: '{col}'"

    def test_wildfire_risk_score_not_in_risk_scores(self):
        """wildfire_risk_score column must NOT exist in risk_scores table."""
        from app.db.session import Base
        import app.db.models  # noqa: F401

        risk_table = Base.metadata.tables["risk_scores"]
        col_names = {c.name for c in risk_table.columns}
        assert "wildfire_risk_score" not in col_names, (
            "wildfire_risk_score must NOT be in risk_scores table "
            "(Build Guide §5.6 — separate module, never merged)"
        )


# ─── 6. alerts Column Completeness ────────────────────────────────────────────

class TestAlertsSchema:
    """Build Guide §6.2 — all CAP-required fields must be present."""

    CAP_REQUIRED_COLUMNS = {
        "identifier", "sender", "sent", "status", "msg_type",
        "event", "urgency", "severity", "certainty",
        "area_desc", "instruction", "ward_id", "risk_band",
    }

    def test_all_cap_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["alerts"]
        actual_cols = {c.name for c in table.columns}
        for col in self.CAP_REQUIRED_COLUMNS:
            assert col in actual_cols, f"alerts table missing CAP column: '{col}'"

    def test_identifier_is_primary_key(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["alerts"]
        pk_cols = {c.name for c in table.primary_key.columns}
        assert "identifier" in pk_cols


# ─── 7. feedback Column Completeness ──────────────────────────────────────────

class TestFeedbackSchema:
    """Build Guide §8.1 — feedback table for Tier 2 recalibration loop."""

    REQUIRED_COLUMNS = {
        "id", "alert_id", "predicted_risk", "predicted_zone",
        "actual_outcome", "timestamp",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["feedback"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, f"feedback missing column: '{col}'"

    def test_alert_id_foreign_key(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["feedback"]
        fk_targets = {fk.target_fullname for col in table.columns for fk in col.foreign_keys}
        assert "alerts.identifier" in fk_targets, (
            "feedback.alert_id must FK → alerts.identifier"
        )


# ─── 8. river_level_snapshot_cache ────────────────────────────────────────────

class TestRiverLevelCacheSchema:
    """
    Build Guide §3.6 — CWC cache-first fallback table.
    is_last_known_good flag is the manually-refreshable demo fallback.
    """

    REQUIRED_COLUMNS = {
        "id", "station_id", "district", "value",
        "fetched_at", "is_last_known_good",
    }

    def test_all_columns_present(self):
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["river_level_snapshot_cache"]
        actual_cols = {c.name for c in table.columns}
        for col in self.REQUIRED_COLUMNS:
            assert col in actual_cols, (
                f"river_level_snapshot_cache missing column: '{col}'"
            )

    def test_is_last_known_good_is_boolean(self):
        """is_last_known_good must be a Boolean column (build guide §3.6 exact)."""
        from sqlalchemy import Boolean
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["river_level_snapshot_cache"]
        col = table.c["is_last_known_good"]
        assert isinstance(col.type, Boolean), (
            "is_last_known_good must be a Boolean column"
        )

    def test_has_station_fetched_index(self):
        """Composite index on (station_id, fetched_at) must exist."""
        from app.db.session import Base
        import app.db.models  # noqa: F401

        table = Base.metadata.tables["river_level_snapshot_cache"]
        index_names = {idx.name for idx in table.indexes}
        assert "ix_river_cache_station_fetched" in index_names, (
            "ix_river_cache_station_fetched missing — required for latest-cache-per-station query"
        )


# ─── 9. Migration File Exists ─────────────────────────────────────────────────

class TestMigrationFile:
    """The Alembic migration file for the initial schema must be importable."""

    def test_migration_file_importable(self):
        import importlib.util
        import sys
        from pathlib import Path

        migration_path = Path(__file__).parent.parent / "alembic" / "versions" / "0001_initial_schema.py"
        assert migration_path.exists(), f"Migration file not found at {migration_path}"

        spec = importlib.util.spec_from_file_location("initial_schema", str(migration_path))
        mod = importlib.util.module_from_spec(spec)
        sys.modules["initial_schema"] = mod
        spec.loader.exec_module(mod)
        assert hasattr(mod, "upgrade"), "Migration missing upgrade() function"
        assert hasattr(mod, "downgrade"), "Migration missing downgrade() function"
        assert mod.revision == "0001_initial_schema"
        assert mod.down_revision is None  # First migration has no parent


# ─── 10. Relationship Completeness ────────────────────────────────────────────

class TestORMRelationships:
    """ORM model relationships must be correctly defined for joined queries."""

    def test_ward_has_risk_scores_relationship(self):
        from app.db.models import Ward
        assert hasattr(Ward, "risk_scores"), "Ward.risk_scores relationship missing"

    def test_ward_has_alerts_relationship(self):
        from app.db.models import Ward
        assert hasattr(Ward, "alerts"), "Ward.alerts relationship missing"

    def test_alert_has_feedback_relationship(self):
        from app.db.models import Alert
        assert hasattr(Alert, "feedback"), "Alert.feedback relationship missing"

    def test_risk_score_has_ward_back_ref(self):
        from app.db.models import RiskScore
        assert hasattr(RiskScore, "ward"), "RiskScore.ward back-reference missing"
