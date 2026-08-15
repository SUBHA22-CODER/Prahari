# PRAHARI-AI — Demo Checklist

**Run this checklist before every SIH demo rehearsal and on demo day (Build Guide §16).**

---

## 30 Minutes Before Demo

- [ ] `docker compose up --build` — verify all three services start cleanly
- [ ] Open API health: `http://localhost:8000/health` — expect `{"status":"ok"}`
- [ ] Open dashboard: `http://localhost:5173` — verify map loads with ward data

---

## Data Verification

- [ ] **CWC snapshot refresh** — confirm the last-known-good river level snapshot is current:
  ```bash
  docker compose exec backend python scripts/refresh_cwc_snapshot.py
  ```
  If the live scrape fails, the cached value serves automatically (Build Guide §3.6).

- [ ] **Bhuvan data** — confirm `wards.slope_proxy_cached` is populated:
  ```bash
  docker compose exec db psql -U prahari -d prahari_db -c \
    "SELECT COUNT(*) FROM wards WHERE slope_proxy_cached IS NOT NULL;"
  ```
  If count = 0, load bulk-download fallback:
  ```bash
  docker compose exec backend python -c "
  import asyncio
  from app.db.session import AsyncSessionLocal
  from app.ingestion.bhuvan import load_bhuvan_bulk_fallback
  async def run():
      async with AsyncSessionLocal() as db:
          await load_bhuvan_bulk_fallback(db, 'data/bhuvan_slope_fallback.csv')
  asyncio.run(run())
  "
  ```

- [ ] **Seed data loaded** — run or verify:
  ```bash
  docker compose exec backend python scripts/seed_demo_data.py
  ```

---

## Dashboard Views

- [ ] **Map view** — ward heatmap renders with green/amber/red colouring
- [ ] **Ward click** — clicking a ward shows risk score, confidence, and 4-factor breakdown
- [ ] **Alert feed** — at least one Critical and one Alert visible, each labelled SIMULATED
- [ ] **Admin triage list** — wards sorted by risk score descending, highest at top
- [ ] **Backtest chart** — risk score chart loads with Critical threshold line and event marker
  ```bash
  # Pre-generate chart if needed
  curl http://localhost:8000/api/v1/backtest/run?event_key=wayanad_2024
  ```

---

## Tier Module Status

- [ ] Confirm Tier 3 enabled/disabled status matches current build progress (Build Guide §6.5):
  - Wildfire module: `[ ] enabled  [ ] disabled`
  - Tsunami module: `[ ] enabled  [ ] disabled`
  - Earthquake module: `[ ] enabled  [ ] disabled`
- [ ] Verify that **disabling a Tier 3 module does not break the Tier 1 dashboard**

---

## Fallback Verification

- [ ] Simulate CWC scrape failure:
  - Break the CWC selector in `backend/app/ingestion/cwc.py` temporarily
  - Trigger a fetch cycle via `POST /api/v1/risk/run-cycle`
  - Verify the dashboard still shows data (from cache)
  - Restore the selector

---

## Pitch / Narration Checks

- [ ] Rehearse the 7-beat demo flow (Build Guide §8 / Playbook §19) end-to-end
- [ ] Confirm judge Q&A answers match `docs/JUDGE_QA.md` verbatim
- [ ] Key phrases ready (to use verbatim):
  - `"PRAHARI-AI turns 'it will rain 200mm' into 'these 40 houses must evacuate by 6 PM'"`
  - `"These weights are the system's starting point, not its final claim"`
  - `"The model outputs a relative risk ranking with a confidence score, not a certainty claim"`
  - `"Not in the MVP — the alert layer is built to the same CAP structure SACHET uses, with a simulated dissemination panel, ready for integration in a production deployment."`

---

## Post-Demo (If Sharing a Link)

- [ ] Deploy to Render/Railway (Build Guide §1.2) using the same Docker Compose services
- [ ] Verify hosted version loads with seed data pre-populated
