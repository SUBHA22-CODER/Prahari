# PRAHARI-AI

**National Multi-Hazard Impact-Based Decision Intelligence Layer**
*Smart India Hackathon 2026 — Disaster Management Theme*

---

## One-Line Pitch

> **"PRAHARI-AI turns 'it will rain 200mm' into 'these 40 houses must evacuate by 6 PM'."**

---

## Problem Statement

India's hazard-detection agencies operate in silos:

| Agency | Domain | Gap |
|---|---|---|
| IMD | Rainfall / Mission Mausam AI forecasts | Ward-level impact translation missing |
| CWC / India-WRIS | River gauge levels | No cross-hazard fusion |
| GSI | Landslide susceptibility (currently only 3 districts: Kalimpong, Darjeeling, Nilgiris) | No live feed available |
| DRDO / DGRE | Avalanche geohazard R&D | Not accessible for integration |
| INCOIS | Cyclone / Tsunami / Storm surge | Isolated per-hazard dissemination |

**No system fuses these feeds with hyperlocal exposure data (population, schools, hospitals) into a ward/village-level actionable decision.** This documented "impact-based forecasting gap" is a specific failure point behind real, recent casualties — including the **Kerala 2018** and **Wayanad 2024** disasters.

---

## Solution

PRAHARI-AI is a **decision-intelligence layer** sitting between existing hazard-detection agencies and NDMA's SACHET dissemination platform. It:

1. **Fuses** siloed hazard signals into a per-ward composite risk score.
2. **Overlays** hyperlocal exposure data (population density, critical infrastructure count).
3. **Translates** risk scores into specific, actionable recommended actions.
4. **Generates** CAP-structured alerts structured for NDMA's existing SACHET pipeline.

PRAHARI-AI **does not replace any government system** — it adds the missing translation step between hazard signal and actionable decision.

> Final decision authority always remains with human officials — PRAHARI-AI is a **decision-support co-pilot, not an autonomous actor.**

---

## Government Integration

- Consumes **public/API data only** — no new data-collection burden on any agency.
- Alerts are published in **CAP format structured for NDMA's SACHET pipeline**, which connects Alert Generating Agencies to Alert Disseminating Agencies across TSPs, TV, radio, cable, and satellite.
- District Collectors / SDMAs receive the dashboard as a **plug-in to their existing response workflow**.

---

## Scope Tiering (fixed in advance — never improvised)

| Tier | Contents | Cut Priority |
|---|---|---|
| **Tier 1 — Never Cut** | Flood + Landslide fusion, 1 pilot district, dashboard, CAP alerts, backtest (Kerala 2018 / Wayanad 2024) | Never |
| **Tier 2 — Cut Second-to-Last** | Feedback-loop demo button + before/after weight recalibration | Second |
| **Tier 3 — Cut First** | Wildfire module, Tsunami module, Earthquake rapid-response module | First |

---

## Architecture Overview

```
Ingestion Layer         Storage Layer      Risk Engine        Alert Layer        Dashboard
──────────────────      ─────────────      ────────────       ───────────        ─────────
Open-Meteo (rain)  ──►                     Weighted Risk  ──► CAP Alert     ──► Map Heatmap
CWC (river gauge)  ──► PostgreSQL      ──► Fusion Model       Generator         Factor Panel
ISRO Bhuvan        ──► + PostGIS       ──► (0.4/0.3/0.2/0.1)               ──► Alert Feed
OSM / Overpass     ──►                    Wildfire Score                        Admin Triage
Census / SECC      ──►  Exposure Grid  ──► (independent)
NASA FIRMS [T3]    ──►
USGS EQ [T3]       ──►
INCOIS [T3]        ──►
```

For the full Mermaid architecture diagram, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Tech Stack

| Component | Technology |
|---|---|
| Backend / API | Python 3.11, FastAPI, Uvicorn |
| Scheduler | APScheduler (BackgroundScheduler) |
| Database | PostgreSQL 15 + PostGIS extension |
| Geospatial | GeoAlchemy2, PostGIS, QGIS (analysis), Vector Tiles (future scaling) |
| ML / Scoring | pandas, numpy — MVP weighted model; XGBoost / Random Forest (future upgrade) |
| Frontend | React 18 + Leaflet (default) / Streamlit + Folium (small-team contingency) |
| Containerisation | Docker Compose |
| Hosting (demo) | Local Docker Compose; Render / Railway (free-tier optional) |

---

## Scalability

The architecture is **hazard-agnostic and district-agnostic by design**. Adding a new state means re-running the same pipeline against that state's Bhuvan/Census layers and recalibrating thresholds — not rebuilding the system.

This is a direct contrast to today's single-city, single-hazard pilots:
- Mumbai's flood nowcasting
- Lucknow's pump-automation system
- GSI's 3-district landslide coverage (Kalimpong, Darjeeling, Nilgiris)

PRAHARI-AI extends horizontally across floods, urban flooding, landslides, cyclones, avalanches, and heatwaves.

---

## Why It Is Novel and Impactful

Every individual data source PRAHARI-AI uses **already exists in India** — SACHET, IMD-equivalent nowcasts, GSI bulletins, Bhuvan, DRDO's geohazard R&D. The novelty is that **nothing currently fuses them** into one hyperlocal, cross-hazard, impact-based, action-generating layer.

This gap is **explicitly documented in Indian early-warning research** and is the specific failure point behind real, recent casualties.

---

## Quickstart

```bash
# 1. Clone & configure
git clone <repo-url>
cd prahari-ai
cp .env.example .env
# Fill in BHUVAN_TOKEN, FIRMS_MAP_KEY, DATABASE_URL

# 2. Start all services
docker compose up --build

# 3. Seed demo data (once services are up)
docker compose exec backend python scripts/seed_demo_data.py

# 4. Access the dashboard
#    Frontend: http://localhost:5173
#    API:      http://localhost:8000/docs
```

---

## Documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layer-by-layer system design |
| [DATA_SOURCES.md](docs/DATA_SOURCES.md) | All data sources, access methods, fallbacks |
| [RISK_MODEL.md](docs/RISK_MODEL.md) | Exact formula, weights, confidence heuristic |
| [SCOPE_AND_TIERS.md](docs/SCOPE_AND_TIERS.md) | Tier cut order and build timeline |
| [JUDGE_QA.md](docs/JUDGE_QA.md) | Anticipated judge questions & direct answers |
| [FUTURE_WORK.md](docs/FUTURE_WORK.md) | ML upgrade path and post-MVP roadmap |
| [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) | Pre-demo setup checklist |
