"""
PRAHARI-AI — FastAPI Application Entry Point
============================================
Tier: 1 (Core)

Initialises the FastAPI app, wires up database connectivity, starts the
APScheduler instance on startup, and exposes the API router tree.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine, Base
from app.ingestion.scheduler import start_scheduler, shutdown_scheduler
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialise DB tables and start the scheduler."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[PRAHARI-AI Backend] Database init skipped ({e}). Running in resilient mode.")

    # Start background ingestion scheduler (Build Guide §3.9)
    try:
        start_scheduler()
    except Exception as e:
        print(f"[PRAHARI-AI Backend] Scheduler init skipped ({e}).")

    yield  # Application is now running

    # Graceful shutdown
    try:
        shutdown_scheduler()
    except Exception:
        pass


app = FastAPI(
    title="PRAHARI-AI",
    description=(
        "National Multi-Hazard Impact-Based Decision Intelligence Layer — "
        "Smart India Hackathon 2026. "
        "Fuses siloed hazard feeds with hyperlocal exposure data to produce "
        "ward-level, impact-based, actionable risk scores and CAP-structured alerts."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React frontend dev server to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Lightweight liveness probe — returns 200 when the API is up."""
    return {"status": "ok", "service": "prahari-ai-backend"}


@app.get("/", tags=["Root"])
async def root():
    """API root landing — provides quick links to docs and frontend app."""
    return {
        "status": "PRAHARI-AI FastAPI Backend Active",
        "version": "1.0.0",
        "documentation": "http://localhost:8080/docs",
        "frontend_app": "http://localhost:5173",
        "health": "http://localhost:8080/health"
    }
