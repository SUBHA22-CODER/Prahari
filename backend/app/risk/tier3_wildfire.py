"""PRAHARI-AI — Tier 3 Wildfire Scoring Module (stub — see firms.py for full implementation)."""
# The wildfire scoring engine is implemented in backend/app/ingestion/firms.py
# and writes results to the wildfire_scores table.
# This file exists to make the Tier 3 module boundary visually clear in the
# risk/ package (Build Guide Phase 0 acceptance criterion — Tier 1/2/3 boundary
# must be visually obvious in the folder structure).
#
# The wildfire score is NEVER merged into the risk_scores table or the
# four-factor weighted formula (Build Guide §5.6).
from app.ingestion.firms import fetch_wildfire_job, aggregate_wildfire_per_ward

__all__ = ["fetch_wildfire_job", "aggregate_wildfire_per_ward"]
