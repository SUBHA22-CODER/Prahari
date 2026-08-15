# PRAHARI-AI — Future Work & ML Upgrade Path

*(Build Guide §5.7 / Project PDF §5 — explicitly out of MVP scope)*

> **Nothing in this document is part of the MVP or SIH demo scope.**
> Every item below is documented future work only. The live pipeline uses
> the weighted scoring model in `backend/app/risk/engine.py` exclusively.

---

## ML Model Upgrade Path (Build Guide §5.7)

**Trigger:** Once enough historical events are logged via the Phase 6 feedback loop.

**Upgrade:** Replace the fixed weights (0.4/0.3/0.2/0.1) with weights learned by a gradient boosting model — **Ensemble ML: XGBoost / Random Forest** — trained on the same four features:
- `rainfall_intensity`
- `river_level_trend`
- `slope_saturation_proxy`
- `historical_incident_density`

...with real confirmed outcomes (from the feedback table) as labels.

The four features remain unchanged — only the weights become learned rather than fixed. The feedback loop in Phase 6 is the explicit mechanism that accumulates this training data over time.

**Why this is future work and not MVP:** The weighted formula is the right starting point for a hackathon prototype — it is explainable, auditable, and honest about its calibration status. Replacing it with a trained model before you have real labelled outcomes would be optimising prematurely and would make accuracy claims that cannot be supported.

---

## Further Future Architecture (Project PDF §5 — explicitly future work)

| Item | Description |
|---|---|
| **CNN / U-Net** | Lightweight convolutional model for short-range spatial rainfall/flood nowcasting, trained on gridded rainfall + DEM data |
| **LSTM** | Sequence model for short-range river-level trend forecasting — captures temporal patterns in gauge readings that the current trend heuristic approximates |
| **Graph-based spatial propagation** | Model flood and landslide risk propagation along river networks and slope cascades using a graph neural network — for compound multi-ward events |
| **Vector tile serving** | As the system scales beyond one pilot district, replace direct GeoJSON/PostGIS reads with vector tile delivery for performant multi-district map rendering |
| **QGIS integration** | For offline grid-overlay analysis and visualisation of multi-district risk patterns |

---

## DRDO Avalanche Integration (Future Work)

DRDO's geohazard R&D covers avalanche risk in Himalayan mountain districts. This is architecturally independent from flood/landslide (consistent with the Tier 3 isolation pattern) and would be added as:
- A dedicated `incois_avalanche` or `drdo_avalanche` fetcher module
- A separate `avalanche_scores` table (same pattern as `wildfire_scores`)
- A toggleable dashboard layer

No DRDO data API is publicly accessible for the MVP — this integration requires an MOU with DRDO and is explicitly deferred.

---

## Honest Framing

The existence of this upgrade path is the *concrete mechanism behind the honest-justification talking point* for the MVP's fixed weights (Build Guide §5.7). When judges ask "why these weights?", the answer points here: the weights are the starting point, and this is the documented path by which they become calibrated over time.
