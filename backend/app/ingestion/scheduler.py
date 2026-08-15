"""
PRAHARI-AI — APScheduler Job Wiring
=====================================
Tier: 1 (Tier 1 core jobs) + Tier 3 (independent jobs added conditionally)

Wires all fetchers into a single BackgroundScheduler instance (Build Guide §3.9).
Exact intervals as specified in the Build Guide — do not alter them:

    fetch_rainfall_job     → every 15 minutes (Tier 1)
    fetch_river_level_job  → every 30 minutes (Tier 1)
    fetch_earthquake_job   → every 5 minutes  (Tier 3)
    fetch_wildfire_job     → every 2 hours    (Tier 3)
    fetch_tsunami_events   → every 30 minutes (Tier 3)
    fetch_incois_advisory  → every 15 minutes (Tier 3) [ASSUMPTION: interval]
    fetch_bhuvan_monthly   → every 30 days    (Tier 1, very long interval)

Error handling: every job wraps its call in a try/except so one job's exception
never stops the scheduler or prevents other jobs from running on their next tick
(Build Guide §3.1). This is the key isolation requirement.
"""

import asyncio
import logging

from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

# Module-level scheduler instance — started on FastAPI startup, stopped on shutdown
_scheduler: BackgroundScheduler | None = None


def _run_async(coro):
    """
    Helper to run an async coroutine from a synchronous APScheduler job context.
    Creates a new event loop for the job thread if none is running.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(coro)
        finally:
            loop.close()
    except Exception as exc:
        logger.error("Scheduler job raised an unhandled exception: %s", exc, exc_info=True)


# ─── Job wrapper functions (one per fetcher) ─────────────────────────────────
# Each wrapper is responsible for obtaining a DB session and calling the fetcher.
# Errors in one wrapper must never stop the scheduler loop — all exceptions are caught.

def _rainfall_job():
    """Tier 1: Open-Meteo rainfall — every 15 minutes."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.open_meteo import fetch_rainfall_job
    from app.exposure.grid import get_ward_centroids

    async def _run():
        async with AsyncSessionLocal() as db:
            centroids = await get_ward_centroids(db)
            await fetch_rainfall_job(db, centroids)

    _run_async(_run())


def _river_level_job():
    """Tier 1: CWC river gauge — every 30 minutes."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.cwc import fetch_river_level_job

    async def _run():
        async with AsyncSessionLocal() as db:
            await fetch_river_level_job(db)

    _run_async(_run())


def _earthquake_job():
    """Tier 3: USGS earthquake — every 5 minutes."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.usgs import fetch_earthquake_job

    async def _run():
        async with AsyncSessionLocal() as db:
            await fetch_earthquake_job(db)

    _run_async(_run())


def _wildfire_job():
    """Tier 3: NASA FIRMS wildfire — every 2 hours."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.firms import fetch_wildfire_job
    from app.exposure.grid import get_ward_bboxes

    async def _run():
        async with AsyncSessionLocal() as db:
            ward_bboxes = await get_ward_bboxes(db)
            await fetch_wildfire_job(db, ward_bboxes)

    _run_async(_run())


def _tsunami_job():
    """Tier 3: INCOIS tsunami OPR — every 30 minutes."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.incois import fetch_tsunami_events_job

    async def _run():
        async with AsyncSessionLocal() as db:
            await fetch_tsunami_events_job(db)

    _run_async(_run())


def _incois_advisory_job():
    """Tier 3: INCOIS cyclone advisory — every 15 minutes [ASSUMPTION: interval]."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.incois import fetch_incois_advisory_job

    async def _run():
        async with AsyncSessionLocal() as db:
            await fetch_incois_advisory_job(db)

    _run_async(_run())


def _bhuvan_monthly_job():
    """Tier 1: Bhuvan slope cache refresh — every 30 days."""
    from app.db.session import AsyncSessionLocal
    from app.ingestion.bhuvan import fetch_bhuvan_monthly_job
    from app.exposure.grid import get_ward_centroids_with_district

    async def _run():
        async with AsyncSessionLocal() as db:
            wards = await get_ward_centroids_with_district(db)
            await fetch_bhuvan_monthly_job(db, wards)

    _run_async(_run())


# ─── Scheduler lifecycle ──────────────────────────────────────────────────────

def start_scheduler() -> None:
    """
    Create and start the APScheduler BackgroundScheduler with all fetcher jobs.
    Called on FastAPI application startup (Build Guide §3.9).

    Tier 3 jobs are added separately so they can easily be commented out if
    the team chooses to cut Tier 3 (Build Guide §6.5).
    """
    global _scheduler
    if _scheduler and _scheduler.running:
        logger.warning("Scheduler already running — start_scheduler() called twice?")
        return

    _scheduler = BackgroundScheduler(daemon=True)

    # ── Tier 1 jobs (never cut) ──────────────────────────────────────────────
    _scheduler.add_job(_rainfall_job, "interval", minutes=15, id="open_meteo_rainfall")
    _scheduler.add_job(_river_level_job, "interval", minutes=30, id="cwc_river_level")
    _scheduler.add_job(_bhuvan_monthly_job, "interval", days=30, id="bhuvan_monthly")

    # ── Tier 3 jobs (cut first under time pressure — Build Guide §6.5) ───────
    # Comment out any of these to disable the corresponding Tier 3 module.
    _scheduler.add_job(_earthquake_job, "interval", minutes=5, id="usgs_earthquake")
    _scheduler.add_job(_wildfire_job, "interval", hours=2, id="firms_wildfire")
    _scheduler.add_job(_tsunami_job, "interval", minutes=30, id="incois_tsunami")
    _scheduler.add_job(
        _incois_advisory_job,
        "interval",
        minutes=15,  # [ASSUMPTION: interval — see incois.py]
        id="incois_cyclone_advisory",
    )

    _scheduler.start()
    logger.info("PRAHARI-AI scheduler started with %d jobs", len(_scheduler.get_jobs()))


def shutdown_scheduler() -> None:
    """
    Gracefully shut down the scheduler on FastAPI application stop.
    """
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("PRAHARI-AI scheduler shut down cleanly")
