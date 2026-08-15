# PRAHARI-AI — Risk Model Specification

*(Build Guide §5.1-§5.5 — authoritative)*

---

## Exact Weighted Formula

```
risk_score = (
    0.4 * rainfall_intensity +
    0.3 * river_level_trend +
    0.2 * slope_saturation_proxy +
    0.1 * historical_incident_density
)
```

**All inputs are normalised to 0-100.**
**risk_score is bounded 0-100, rounded to 1 decimal place.**

---

## Input Definitions (Build Guide §5.2 — exact)

| Input | Definition |
|---|---|
| `rainfall_intensity` | Current rainfall normalised against a locally calibrated flood-triggering threshold. |
| `river_level_trend` | Rate of change of river level over the last few hours — NOT the absolute level. |
| `slope_saturation_proxy` | Derived from cumulative rainfall over the past 72h plus static slope angle from Bhuvan cache. Used as a landslide-risk substitute since GSI's live feed currently covers only 3 districts (Kalimpong, Darjeeling, Nilgiris). |
| `historical_incident_density` | Static background factor from compiled record of past events in that ward. |

---

## Weight Justification

> **"These weights are the system's starting point, not its final claim — the Phase 6 feedback loop is what converts them from an estimate into a calibrated, zone-specific value over time."**

Rainfall and river trend carry the most weight (0.4 and 0.3 respectively) because they are the two fastest-moving, most causally direct flood signals in the literature. This is a domain-informed estimate, not a tuned/validated result.

---

## Per-Factor Contributions (Explainability — Build Guide §5.5)

The `contributions` dict from `compute_risk()` IS the explainability output. No additional library is needed.

```python
contributions = {
    "rainfall": 0.4 * rainfall_intensity,
    "river":    0.3 * river_level_trend,
    "slope":    0.2 * slope_saturation_proxy,
    "history":  0.1 * historical_incident_density,
}
# sum(contributions.values()) == risk_score (within rounding)
```

Displayed in the ward click-through panel as a bar chart showing each factor's weighted contribution as both an absolute value and % of the total score.

---

## Confidence Heuristic (Build Guide §5.4 — MVP only)

- **Higher** when more of the four inputs have fresh, recent data.
- **Lower** when a source is stale or missing (e.g., CWC scrape failed, Bhuvan token not yet approved).
- MVP formula: `confidence = (count of fresh inputs) / 4`
- "Fresh" means within: 30 min for rainfall, 60 min for river level, 35 days for slope (monthly cache), 1 year for history.
- **No trained uncertainty model** — this is an explicit MVP simplification.

---

## Risk Bands and Actions (Build Guide §6.1)

| Risk Score | Band | Action |
|---|---|---|
| 0–40 | **Monitor** | No public alert; log internally only |
| 40–70 | **Alert** | Notify officials; advise preparedness |
| 70–100 | **Critical** | Evacuate zone; close schools; activate pumps; alert NDRF |

---

## Wildfire — Separate Module

Wildfire does NOT use the four-factor formula above.
**Wildfire score is never merged into `risk_scores`.**

Independent wildfire scoring (Build Guide §5.6):
```
wildfire_risk_score = min(100, detection_count * 5 + avg_frp * 0.1 + dryness_context * 10)
```

Stored in `wildfire_scores` table. Shown alongside (never merged into) the flood/landslide risk layer.

---

## Honest Framing (preserve verbatim in all UI copy)

> "The model outputs a relative risk ranking with a confidence score, not a certainty claim."
