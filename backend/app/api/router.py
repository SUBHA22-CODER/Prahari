"""
PRAHARI-AI — FastAPI Route Aggregator
"""
from fastapi import APIRouter

from app.api import wards, alerts, risk, feedback, backtest, dashboard, system, weather, telegram, email_broadcast, survivor

api_router = APIRouter()
api_router.include_router(dashboard.router, prefix="", tags=["Dashboard & Districts"])
api_router.include_router(weather.router, prefix="/weather", tags=["Live Weather Telemetry"])
api_router.include_router(telegram.router, prefix="/telegram", tags=["Telegram Dissemination"])
api_router.include_router(email_broadcast.router, prefix="/email", tags=["Email Dissemination"])
api_router.include_router(wards.router, prefix="/wards", tags=["Wards & Exposure Grid"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk Scores"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["CAP Alerts"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback (Tier 2)"])
api_router.include_router(backtest.router, prefix="/backtest", tags=["Backtest"])
api_router.include_router(system.router, prefix="", tags=["System Status & Feeds"])
api_router.include_router(survivor.router, prefix="/survivor", tags=["Rescue Intel — Telecom Dead-Zone Survivor Triangulation"])
