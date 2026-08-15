"""
PRAHARI-AI — Phase 2 Exposure Grid Unit Tests
===============================================
Phase 2 | Build Guide §4.1, Playbook §6

Tests the exposure grid module functions:
  1. compute_vulnerability_scores (population + infra normalised combination)
  2. get_ward_centroids
  3. get_ward_centroids_with_district
  4. get_ward_bboxes
  5. get_full_exposure_grid
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.exposure.grid import (
    compute_vulnerability_scores,
    get_ward_centroids,
    get_ward_centroids_with_district,
    get_ward_bboxes,
    get_full_exposure_grid,
)
from app.db.models import Ward


# ─── 1. Vulnerability Score Calculation ───────────────────────────────────────

@pytest.mark.asyncio
async def test_compute_vulnerability_scores_success():
    """Verify that vulnerability scores are calculated and saved correctly."""
    # Create mock wards
    ward1 = Ward(ward_id="ward_001", district="Wayanad", population=1000, infrastructure_count=2)
    ward2 = Ward(ward_id="ward_002", district="Wayanad", population=2000, infrastructure_count=8)

    # Mock DB query
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [ward1, ward2]
    db_mock.execute.return_value = mock_result

    # Run calculation
    # populations: [1000, 2000] -> normalised: [50.0, 100.0]
    # infra: [2, 8]             -> normalised: [25.0, 100.0]
    # ward1: 50.0 * 0.6 + 25.0 * 0.4 = 30.0 + 10.0 = 40.0
    # ward2: 100.0 * 0.6 + 100.0 * 0.4 = 60.0 + 40.0 = 100.0
    updated_count = await compute_vulnerability_scores(db_mock, "Wayanad")

    assert updated_count == 2
    assert db_mock.execute.call_count == 3  # 1 select + 2 updates
    db_mock.commit.assert_called_once()


@pytest.mark.asyncio
async def test_compute_vulnerability_scores_empty_district():
    """If no wards found in district, return 0."""
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db_mock.execute.return_value = mock_result

    updated_count = await compute_vulnerability_scores(db_mock, "UnknownDistrict")
    assert updated_count == 0
    db_mock.commit.assert_not_called()


# ─── 2. Centroid and Bounding Box Resolving ───────────────────────────────────

@pytest.mark.asyncio
async def test_get_ward_centroids():
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [
        ("ward_001", 11.62, 76.08),
        ("ward_002", None, 76.09),  # Missing lat
    ]
    db_mock.execute.return_value = mock_result

    centroids = await get_ward_centroids(db_mock)
    assert len(centroids) == 1
    assert centroids[0]["ward_id"] == "ward_001"
    assert centroids[0]["lat"] == 11.62
    assert centroids[0]["lon"] == 76.08


@pytest.mark.asyncio
async def test_get_ward_centroids_with_district():
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [
        ("ward_001", 11.62, 76.08, "Wayanad"),
    ]
    db_mock.execute.return_value = mock_result

    centroids = await get_ward_centroids_with_district(db_mock)
    assert len(centroids) == 1
    assert centroids[0]["district_code"] == "Wayanad"


@pytest.mark.asyncio
async def test_get_ward_bboxes():
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [
        ("ward_001", 11.62, 76.08),
    ]
    db_mock.execute.return_value = mock_result

    bboxes = await get_ward_bboxes(db_mock)
    assert len(bboxes) == 1
    # Bbox around 11.62, 76.08
    assert bboxes[0]["min_lat"] == pytest.approx(11.57)
    assert bboxes[0]["max_lat"] == pytest.approx(11.67)


@pytest.mark.asyncio
async def test_get_full_exposure_grid():
    ward = Ward(
        ward_id="ward_001",
        district="Wayanad",
        population=5000,
        infrastructure_count=3,
        vulnerability_score=65.0,
        slope_proxy_cached=30.0,
        centroid_lat=11.62,
        centroid_lon=76.08,
    )
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [
        (ward, '{"type": "Polygon", "coordinates": []}')
    ]
    db_mock.execute.return_value = mock_result

    grid = await get_full_exposure_grid(db_mock, "Wayanad")
    assert len(grid) == 1
    assert grid[0]["ward_id"] == "ward_001"
    assert grid[0]["population"] == 5000.0
    assert grid[0]["vulnerability_score"] == 65.0
    assert grid[0]["boundary"] == {"type": "Polygon", "coordinates": []}
