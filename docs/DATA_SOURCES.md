# PRAHARI-AI — Data Sources & Access Plan

*(Build Guide §2 / Project PDF §6 — full table with fallbacks)*

---

## Data Sources Table

| Source | Hazard Signal | Access Method | Update Frequency | Fallback |
|---|---|---|---|---|
| **Open-Meteo** | Rainfall / nowcasting (IMD-equivalent substitute — see note below) | Free REST API, no key | Every 15 min | Rarely fails; standard retry + log |
| **CWC / India-WRIS** | River gauge levels | Custom HTML scraper (BeautifulSoup) — page structure varies by station | Every 30 min | Cache-first: `river_level_snapshot_cache` table; manually refreshable last-known-good snapshot |
| **INCOIS** | Cyclone / storm-surge / ocean-state advisories | Public advisory page / API | Every 15-30 min [ASSUMPTION] | Cache last successful pull |
| **INCOIS Tsunami OPR** | Tsunami potential (past 90 days, Indian Ocean keywords only) | Free JSON endpoint, no key | Every 30 min | File-based cache of last successful response |
| **ISRO Bhuvan** | Terrain / slope / LULC / proximity (hospitals/schools) | Paid API token (free to request, see note) | Monthly refresh of cached data | Bulk-download static layers (slope GeoTIFF / CSV) — swappable with no downstream code changes |
| **USGS** | Earthquake events (Tier 3) | Free REST API, no key | Every 5 min | Standard retry + log; Tier 3 failure does not affect Tier 1 |
| **OpenStreetMap / Overpass** | Schools and hospitals (infrastructure count) | Free Overpass API, no key | Static / monthly refresh | Static — once pulled, low risk |
| **Census / SECC** | Ward/village population | Free bulk download (data.gov.in) | Static — one-time load, re-import on Census update | N/A — no live API |
| **NASA FIRMS** | Active fire detections — VIIRS 375m NRT (Tier 3) | Free MAP_KEY (registration required, no cost) | Every 2 hours | Standard retry + log; Tier 3 failure does not affect Tier 1 |

---

## IMD Substitution Note

**Open-Meteo substitutes for IMD's rainfall / nowcasting feed.**
IMD's role in the production vision includes **Mission Mausam AI forecasts** (next-generation AI-driven weather prediction). Open-Meteo provides equivalent near-real-time rainfall data through a public API that requires no MOU. The substitution is documented explicitly here — it is not a hidden workaround.

Production upgrade path: replace Open-Meteo calls with IMD's Mission Mausam API once available under an NDMA/IMD data-sharing agreement.

---

## GSI Substitution Note

**The slope-saturation proxy substitutes for GSI's live landslide feed.**
GSI's landslide susceptibility and forecasting coverage is **currently limited to 3 districts: Kalimpong, Darjeeling, and Nilgiris**. Wayanad — where the 2024 landslide occurred — is not in GSI's live coverage area.

Our substitute: `slope_saturation_proxy = cumulative_rainfall_72h + static_slope_angle_from_Bhuvan`. This is documented as a proxy, not a claim of equivalence to a live GSI feed.

Production upgrade path: ingest GSI's susceptibility layer directly as it expands coverage.

---

## DRDO / Avalanche Note

DRDO's geohazard R&D (including avalanche risk for mountain districts) is explicitly out of MVP scope. Documented in [FUTURE_WORK.md](FUTURE_WORK.md).

---

## Bhuvan Token Request

Request the ISRO Bhuvan API token on **Day 1**, in parallel with all other setup. Token approval can take several business days — never let it sit on the critical path. If the token is not approved in time, the bulk-download fallback (pre-downloaded LULC/slope layers) populates `wards.slope_proxy_cached` with no downstream code changes required.

Register at: https://bhuvan-app1.nrsc.gov.in/api/
