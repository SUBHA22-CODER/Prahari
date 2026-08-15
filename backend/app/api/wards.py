"""PRAHARI-AI — Wards API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.exposure.grid import get_full_exposure_grid

router = APIRouter()


from app.api.dashboard import generate_district_wards

@router.get("/")
async def list_wards(district: str = "wayanad", db: AsyncSession = Depends(get_db)):
    """Return the full exposure grid for the pilot district (map + admin views)."""
    try:
        data = await get_full_exposure_grid(db, district)
        if data:
            return data
    except Exception as e:
        print(f"[PRAHARI-AI API] list_wards fallback ({e})")
    
    return generate_district_wards(district)


@router.get("/{ward_id}")
async def get_ward(ward_id: str, db: AsyncSession = Depends(get_db)):
    """Return single ward details by ID."""
    try:
        data = await get_full_exposure_grid(db, settings.pilot_district)
        for w in data:
            if w.get("ward_id") == ward_id:
                return w
    except Exception as e:
        print(f"[PRAHARI-AI API] get_ward fallback ({e})")

    return {"ward_id": ward_id, "ward_name": f"Ward {ward_id}", "risk_score": 50, "risk_band": "Alert"}
