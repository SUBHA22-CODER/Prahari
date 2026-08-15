"""
PRAHARI-AI — Test Fixtures and Configuration
=============================================
pytest conftest.py providing shared fixtures for the full test suite.
All tests run fully offline — no real external API calls (Build Guide §14).
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_db():
    """Provide an async mock database session for unit tests."""
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    db.execute = AsyncMock()
    return db


@pytest.fixture
def sample_ward():
    """Sample Ward ORM object for testing."""
    from app.core.config import settings
    from app.db.models import Ward
    ward = Ward()
    ward.ward_id = "ward_001"
    ward.district = settings.pilot_district
    ward.population = 5000
    ward.infrastructure_count = 3
    ward.vulnerability_score = 65.0
    ward.slope_proxy_cached = 30.0
    ward.last_bhuvan_fetch_at = None
    ward.centroid_lat = 11.62
    ward.centroid_lon = 76.08
    return ward


@pytest.fixture
def sample_historical_df():
    """Synthetic time-series DataFrame for backtest tests."""
    import pandas as pd
    from datetime import datetime, timedelta, timezone

    base = datetime(2018, 8, 10, tzinfo=timezone.utc)
    rows = []
    for i in range(10):
        rain = 20.0 + i * 12.0  # Rising rainfall
        river = 3.0 + i * 1.2
        rows.append({
            "timestamp": base + timedelta(hours=i * 12),
            "rainfall_mm_hr": rain,
            "river_level_m": river,
            "slope_proxy": 25.0,
            "hist_density": 20.0,
        })
    return pd.DataFrame(rows)
