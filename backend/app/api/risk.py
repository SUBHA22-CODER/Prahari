"""PRAHARI-AI — Risk Scores API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import RiskScore
from app.core.config import settings
from app.risk.engine import run_scoring_cycle

router = APIRouter()


@router.get("/latest")
async def get_latest_risk_scores(db: AsyncSession = Depends(get_db)):
    """
    Return the most recent risk score for every ward in the pilot district,
    including factor breakdown and confidence — used by dashboard map and admin view.
    """
    result = await db.execute(
        select(RiskScore)
        .order_by(RiskScore.ward_id, desc(RiskScore.computed_at))
        .distinct(RiskScore.ward_id)
    )
    scores = result.scalars().all()
    return [
        {
            "ward_id": s.ward_id,
            "risk_score": float(s.risk_score),
            "confidence_score": float(s.confidence_score or 0),
            "computed_at": s.computed_at.isoformat(),
            "contributions": {
                "rainfall": float(s.contribution_rainfall or 0),
                "river": float(s.contribution_river or 0),
                "slope": float(s.contribution_slope or 0),
                "history": float(s.contribution_history or 0),
            },
        }
        for s in scores
    ]


@router.post("/run-cycle")
async def trigger_scoring_cycle(db: AsyncSession = Depends(get_db)):
    """Manually trigger a risk scoring cycle for the pilot district (dev/demo use)."""
    scores = await run_scoring_cycle(db, settings.pilot_district)
    return {"scored_wards": len(scores), "scores": scores}
