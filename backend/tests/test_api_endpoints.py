"""
PRAHARI-AI — API Endpoints Integration Tests
==============================================
Phase 1/5 | Build Guide §14

Tests the FastAPI endpoints in app.api.* to verify that all inputs
and outputs match their specified structure, response codes are correct,
and dependency overrides work cleanly.

Endpoints covered:
  - GET  /health (health check)
  - GET  /api/v1/wards/ (exposure grid)
  - GET  /api/v1/risk/latest (latest risk scores)
  - POST /api/v1/risk/run-cycle (scoring cycle trigger)
  - GET  /api/v1/alerts/ (CAP alert feed)
  - POST /api/v1/feedback/ (one-tap feedback submission)
  - GET  /api/v1/feedback/before-after/{ward_id} (before/after comparison)
  - GET  /api/v1/backtest/run (backtest runner)
  - GET  /api/v1/backtest/chart (backtest chart image)
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app
from app.db.session import get_db
from app.db.models import RiskScore, Alert, Feedback, Ward


# ─── Mock Database Fixture ────────────────────────────────────────────────────

@pytest.fixture
def api_db():
    """Mock async DB session for FastAPI dependency injection."""
    db = MagicMock()
    
    # Mock async execute
    db.execute = AsyncMock()
    return db


@pytest.fixture
def client(api_db):
    """Provide a TestClient with overridden get_db dependency."""
    app.dependency_overrides[get_db] = lambda: api_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ─── 1. Health Endpoint ───────────────────────────────────────────────────────

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "prahari-ai-backend"


# ─── 2. Wards Endpoint ────────────────────────────────────────────────────────

@patch("app.api.wards.get_full_exposure_grid", new_callable=AsyncMock)
def test_list_wards(mock_get_grid, client, api_db):
    mock_get_grid.return_value = [
        {"ward_id": "ward_001", "population": 5000, "vulnerability_score": 65.0}
    ]
    response = client.get("/api/v1/wards/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ward_id"] == "ward_001"
    mock_get_grid.assert_called_once_with(api_db, "Wayanad")


# ─── 3. Risk Endpoints ────────────────────────────────────────────────────────

def test_get_latest_risk_scores(client, api_db):
    # Mock SQLAlchemy result
    mock_score = RiskScore(
        ward_id="ward_001",
        risk_score=75.5,
        confidence_score=0.85,
        contribution_rainfall=30.0,
        contribution_river=25.0,
        contribution_slope=15.0,
        contribution_history=5.5,
    )
    # Mock datetime isoformat conversion
    mock_score.computed_at = MagicMock()
    mock_score.computed_at.isoformat.return_value = "2026-08-10T19:00:00Z"
    
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_score]
    api_db.execute.return_value = mock_result

    response = client.get("/api/v1/risk/latest")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ward_id"] == "ward_001"
    assert data[0]["risk_score"] == 75.5
    assert data[0]["confidence_score"] == 0.85
    assert data[0]["contributions"]["rainfall"] == 30.0


@patch("app.api.risk.run_scoring_cycle", new_callable=AsyncMock)
def test_trigger_scoring_cycle(mock_run_cycle, client, api_db):
    mock_run_cycle.return_value = [{"ward_id": "ward_001", "risk_score": 62.0}]
    response = client.post("/api/v1/risk/run-cycle")
    assert response.status_code == 200
    data = response.json()
    assert data["scored_wards"] == 1
    assert data["scores"][0]["ward_id"] == "ward_001"


# ─── 4. Alerts Endpoint ───────────────────────────────────────────────────────

def test_list_alerts(client, api_db):
    mock_alert = Alert(
        identifier="PRAHARI-2026-000123",
        sender="prahari-ai-demo",
        status="Actual",
        msg_type="Alert",
        event="Flood Risk",
        urgency="Immediate",
        severity="Severe",
        certainty="Likely",
        area_desc="Ward 14",
        instruction="Evacuate",
        risk_band="Critical",
    )
    mock_alert.sent = MagicMock()
    mock_alert.sent.isoformat.return_value = "2026-08-10T19:05:00Z"

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_alert]
    api_db.execute.return_value = mock_result

    response = client.get("/api/v1/alerts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["identifier"] == "PRAHARI-2026-000123"
    assert data[0]["dissemination"] == "SIMULATED"  # Label verification
    assert data[0]["info"]["urgency"] == "Immediate"


# ─── 5. Feedback Endpoints ─────────────────────────────────────────────────────

@patch("app.api.feedback.record_feedback", new_callable=AsyncMock)
def test_submit_feedback_success(mock_record, client):
    mock_feedback_row = MagicMock()
    mock_feedback_row.id = 42
    mock_record.return_value = mock_feedback_row

    payload = {
        "alert_id": "PRAHARI-2026-000123",
        "predicted_risk": 75.5,
        "predicted_zone": "ward_001",
        "actual_outcome": "yes"
    }
    response = client.post("/api/v1/feedback/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "recorded"
    assert data["feedback_id"] == 42


def test_submit_feedback_invalid_outcome(client):
    payload = {
        "alert_id": "PRAHARI-2026-000123",
        "predicted_risk": 75.5,
        "predicted_zone": "ward_001",
        "actual_outcome": "invalid_value"
    }
    response = client.post("/api/v1/feedback/", json=payload)
    assert response.status_code == 400


@patch("app.api.feedback.get_before_after_comparison", new_callable=AsyncMock)
def test_before_after_comparison(mock_comp, client):
    mock_comp.return_value = {"before": {"rainfall": 0.4}, "after": {"rainfall": 0.35}}
    response = client.get("/api/v1/feedback/before-after/ward_001")
    assert response.status_code == 200
    data = response.json()
    assert data["before"]["rainfall"] == 0.4
    assert data["after"]["rainfall"] == 0.35


# ─── 6. Backtest Endpoints ─────────────────────────────────────────────────────

@patch("app.api.backtest.plot_backtest_chart")
@patch("app.api.backtest.run_backtest")
@patch("app.api.backtest.load_historical_data")
def test_run_backtest(mock_load, mock_run, mock_plot, client):
    import pandas as pd
    mock_df = pd.DataFrame([{"timestamp": "2024-07-30T06:00", "risk_score": 65.0}])
    mock_load.return_value = mock_df
    mock_run.return_value = mock_df

    response = client.get("/api/v1/backtest/run")
    assert response.status_code == 200
    data = response.json()
    assert data["event_key"] == "wayanad_2024"
    assert data["critical_threshold"] == 70
    assert data["risk_scores"] == [65.0]


@patch("os.path.exists")
def test_get_backtest_chart_not_found(mock_exists, client):
    mock_exists.return_value = False
    response = client.get("/api/v1/backtest/chart")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
