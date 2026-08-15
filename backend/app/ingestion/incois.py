"""
PRAHARI-AI — INCOIS Advisories + Tsunami OPR Fetcher
======================================================
Tier: 3 (architecturally independent) | Schedule:
  - Tsunami OPR: every 30 minutes (Build Guide §3.9)
  - Cyclone/storm-surge advisories: every 15-30 minutes
    [ASSUMPTION: no explicit interval given for cyclone advisories in the source;
     15-30 min aligns with "near real-time during events" — Build Guide §3.8]

Two sub-modules:
  1. fetch_tsunami_events_job   — INCOIS Tsunami OPR past-90-days JSON feed
  2. fetch_incois_advisory_job  — INCOIS cyclone/storm-surge public advisories

Regional keyword filter for tsunami events (Build Guide §3.8 — exact list, do not add
keywords unless clearly marked [OPTIONAL ENHANCEMENT] and kept off by default):
    Indonesia, Philippines, Andaman, Sumatra, Myanmar, Bay of Bengal, Arabian Sea

Fallback: a failed live pull serves the last successfully cached advisory.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import HazardReading

logger = logging.getLogger(__name__)

TSUNAMI_OPR_URL = "https://tsunami.incois.gov.in/itews/DSSProducts/OPR/past90days.json"
REQUEST_TIMEOUT_SECONDS = 10

# Exact regional keyword filter from Build Guide §3.8 — do not modify without flagging
INDIAN_OCEAN_KEYWORDS = [
    "Indonesia",
    "Philippines",
    "Andaman",
    "Sumatra",
    "Myanmar",
    "Bay of Bengal",
    "Arabian Sea",
]

import tempfile

# Simple file-based cache for last successful tsunami OPR response
# [ASSUMPTION: file cache is sufficient for MVP; a DB table would be used in production]
_TSUNAMI_CACHE_PATH = Path(tempfile.gettempdir()) / "prahari_tsunami_cache.json"


def _fetch_tsunami_opr_raw() -> dict | None:
    """
    Fetch INCOIS tsunami OPR past-90-days JSON.
    Returns the parsed JSON dict on success, None on any error.
    """
    try:
        resp = requests.get(
            TSUNAMI_OPR_URL,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        logger.warning("INCOIS tsunami OPR fetch failed: %s", exc)
    return None


def _load_tsunami_cache() -> dict | None:
    """Load the last successfully cached INCOIS tsunami OPR response."""
    try:
        if _TSUNAMI_CACHE_PATH.exists():
            return json.loads(_TSUNAMI_CACHE_PATH.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to load tsunami cache: %s", exc)
    return None


def _save_tsunami_cache(data: dict) -> None:
    """Persist the most recent successful INCOIS OPR response to the cache file."""
    try:
        _TSUNAMI_CACHE_PATH.write_text(json.dumps(data))
    except OSError as exc:
        logger.warning("Failed to save tsunami cache: %s", exc)


def _filter_relevant_events(events: list[dict]) -> list[dict]:
    """
    Filter tsunami events to those relevant to the Indian Ocean region,
    using the exact keyword list from Build Guide §3.8.
    """
    return [
        e for e in events
        if any(kw in e.get("REGIONNAME", "") for kw in INDIAN_OCEAN_KEYWORDS)
    ]


async def fetch_tsunami_events_job(db: AsyncSession) -> None:
    """
    Scheduled Tier 3 job: fetch INCOIS tsunami OPR data, filter to relevant regions,
    and write to hazard_readings.

    Cache-first fallback: a failed live pull serves the last cached response.
    """
    raw = _fetch_tsunami_opr_raw()
    is_cached = False

    if raw is None:
        raw = _load_tsunami_cache()
        is_cached = True
        if raw is None:
            logger.error("INCOIS tsunami: no live or cached data available — skipping cycle")
            return
        logger.info("INCOIS tsunami: using cached advisory (live fetch failed)")
    else:
        _save_tsunami_cache(raw)

    try:
        generated_ts = raw.get("metadata", {}).get("generated")
        if generated_ts:
            generated_time = datetime.fromtimestamp(generated_ts / 1000, tz=timezone.utc)
        else:
            generated_time = datetime.now(timezone.utc)

        all_events = raw.get("datasets", [])
        relevant_events = _filter_relevant_events(all_events)

        logger.info(
            "INCOIS tsunami OPR: %d total events, %d relevant to Indian Ocean (cached=%s)",
            len(all_events), len(relevant_events), is_cached,
        )

        now = datetime.now(timezone.utc)
        for event in relevant_events:
            magnitude = event.get("MAGNITUDE")
            region = event.get("REGIONNAME", "unknown")
            
            # Parse event-specific origin time
            origin_time_str = event.get("ORIGINTIME")
            if origin_time_str:
                try:
                    observed_at = datetime.strptime(origin_time_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                except ValueError:
                    observed_at = generated_time
            else:
                observed_at = generated_time

            db.add(
                HazardReading(
                    source="incois_tsunami",
                    location_id=f"tsunami_{region[:40].replace(' ', '_')}",
                    hazard_type="tsunami_potential",
                    value=float(magnitude) if magnitude else 0.0,
                    unit="mw",
                    observed_at=observed_at,
                    fetched_at=now,
                )
            )

        await db.commit()
    except (KeyError, TypeError, ValueError) as exc:
        logger.error("INCOIS tsunami: failed to process OPR data: %s", exc)


async def fetch_incois_advisory_job(db: AsyncSession) -> None:
    """
    Scheduled Tier 3 job: fetch INCOIS cyclone/storm-surge advisories.
    Cache-last-successful-pull as fallback (Build Guide §3.8, source table).

    [ASSUMPTION: INCOIS cyclone advisory endpoint — no specific endpoint is named in
     the Build Guide beyond the public advisory page. Implement as a fetch of the
     INCOIS Ocean State Forecast (OSF) or Cyclone Warning product page when confirmed.
     This stub documents the structure; wire in the confirmed URL before demo day.]
    """
    # [ASSUMPTION: cyclone advisory endpoint to be confirmed on Day 1]
    CYCLONE_ADVISORY_URL = "https://incois.gov.in/portal/osf/osf.jsp"  # [ASSUMPTION]

    try:
        resp = requests.get(
            CYCLONE_ADVISORY_URL,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        # [ASSUMPTION: parse advisory content from response — structure TBD on Day 1]
        logger.info("INCOIS cyclone advisory fetch OK (%d bytes)", len(resp.content))
        # TODO: parse and write normalised HazardReading records for cyclone/storm_surge
    except requests.RequestException as exc:
        logger.warning(
            "INCOIS cyclone advisory fetch failed: %s — serving last cached value (not yet implemented)",
            exc,
        )
