# PRAHARI-AI — Scope, Tiers & Build Timeline

*(Build Guide §6.5, §12 / Project PDF §3.3, §14)*

---

## Scope Tiering (Fixed in Advance — Never Improvised)

| Tier | Contents | Cut Priority |
|---|---|---|
| **Tier 1 — Never Cut** | Flood + Landslide fusion for one pilot district, live dashboard (map + ward detail + alert feed + admin triage), CAP-style alert generation, Backtest against Kerala 2018 or Wayanad 2024 | Never |
| **Tier 2 — Cut Second-to-Last** | Feedback-loop demo button + before/after weight recalibration display | Second |
| **Tier 3 — Cut First** | Wildfire module (NASA FIRMS), Tsunami module (INCOIS OPR), Earthquake rapid-response module (USGS) — each architecturally independent | First |

> The cut order is fixed in advance. No one decides "we might cut Tier 3" on day 3 — it is already decided. This removes scope-creep decisions from the critical path.

---

## Team-Size Contingency (Build Guide §5 / Project PDF §3.6)

**If the actual team is smaller than 3-4 people:**
Apply BOTH of the following immediately (not as a last resort):

1. **Switch frontend**: Use Streamlit + Folium instead of React + Leaflet. This delivers all four required views significantly faster, at some visual-polish cost. All four views (map, ward click-through, alert feed, admin sorted list) must still be present.

2. **Apply Tier 3 cuts immediately**: Drop wildfire, tsunami, and earthquake modules from the dashboard rather than waiting to see if time runs out.

---

## Consolidated Build Timeline (Build Guide §12 / Project PDF §14)

| Period | Focus |
|---|---|
| **Week 1** | Tier 1 ingestion pipeline: CWC scraper + Bhuvan fallback wired in from Day 1, Bhuvan token requested Day 1 in parallel with all other setup. Confirm backtest historical-data availability from IMD archives, data.gov.in, or news-reported gauge readings. OSM Overpass fetch + Census/SECC load. |
| **Week 2** | Risk scoring (weighted formula with stated weight justification) and alert generation working end to end. Exposure grid fully populated. Dashboard showing live data. |
| **Week 3** | Dashboard polish. Feedback-loop demo button (Tier 2). Tier 3 modules only if ahead of schedule. |
| **Hackathon Days** | Backtest finalisation. Bug fixes. Pitch rehearsal — including the fallback/limitation answers (JUDGE_QA.md). Pre-demo checklist run. |

---

## Phase-by-Phase Build Order

| Phase | Contents | Tier |
|---|---|---|
| 0 | Repository structure, config, Docker, CI | 1 |
| 1 | Database schema (7 tables + PostGIS) | 1 |
| 1 (parallel) | Data ingestion fetchers: Open-Meteo, CWC, Bhuvan, OSM, Census | 1 |
| 1 (parallel) | Data ingestion fetchers: USGS, FIRMS, INCOIS (architecturally isolated) | 3 |
| 2 | Exposure + vulnerability grid | 1 |
| 3 | Risk fusion model (exact formula) | 1 |
| 4 | Alert and action-recommendation layer (CAP structure + bands) | 1 |
| 5 | Dashboard (map + ward panel + alert feed + admin view) | 1 |
| 6 | Feedback and recalibration loop | 2 |
| 7 | Backtest (Kerala 2018 / Wayanad 2024) | 1 |
| 8+ | Tests, Docker, seed data, documentation, demo flow | 1 |
