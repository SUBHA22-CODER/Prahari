# PRAHARI-AI — Judge Q&A

**"Why SIH Judges Would Select It" + Anticipated Judge Questions with Direct Answers**
*(Build Guide §11 / Project PDF §12, §13 — verbatim where specified)*

---

## Why SIH Judges Would Select PRAHARI-AI (Project PDF §12)

- **Evidence-grounded** — built on named, current, documented gaps in NDMA/IMD/GSI/CWC systems, not invented problems.
- **Strengthens government infrastructure instead of duplicating it** — realistic adoption path via SACHET (TSPs, TV, radio, cable, satellite).
- **Realistically buildable as a working MVP** in hackathon time, using mostly free data, with a fallback for every fragile source.
- **Honest about its limits** — does not claim to predict earthquakes, does not overclaim accuracy, states weight estimates as estimates.
- **Directly ties to recent, real national tragedies** (Kerala 2018, Wayanad 2024), making the pitch concrete and emotionally resonant.
- **Self-improving by design** via the feedback loop — shows judges a path from hackathon prototype to real deployment.

---

## Anticipated Judge Questions & Direct Answers

### Q1: "How accurate is the model? What is your precision/recall?"

**Answer:** The model outputs a relative risk ranking with a confidence score, not a certainty claim. We validated it by backtesting against historical data — the model would have flagged Critical risk in Wayanad several hours before the confirmed event. The weights (0.4/0.3/0.2/0.1) are the system's starting point, not its final claim. The Phase 6 feedback loop is what converts them from a domain-informed estimate into a calibrated, zone-specific value over time — we show a before/after accuracy comparison in the dashboard.

---

### Q2: "Can PRAHARI-AI predict earthquakes?"

**Answer:** No system can predict earthquakes with useful lead time — that is a physical limitation, not a design gap. For this hazard, the system switches from prediction to rapid post-event response prioritisation: when a significant seismic event is detected (via USGS), the system generates a ward-level damage-priority map input using building age, population density, and proximity to known landslide-prone zones — to support NDRF rapid response. This is in the codebase and is honest about the distinction.

---

### Q3: "Why aren't you using actual IMD / GSI / DRDO data directly?"

**Answer:**
- **IMD rainfall**: We use Open-Meteo as a direct IMD-equivalent substitute — it provides the same rainfall/nowcasting feed used by IMD-adjacent systems and is publicly accessible without an MOU. IMD's Mission Mausam AI forecasts are the production upgrade target.
- **GSI landslide**: GSI's live landslide feed currently covers only 3 districts (Kalimpong, Darjeeling, Nilgiris). Our slope-saturation proxy (cumulative rainfall + Bhuvan terrain data) fills exactly this gap — the documented reason for its absence in affected areas like Wayanad.
- **DRDO avalanche**: Out of MVP scope — documented in FUTURE_WORK.md.
This is not a workaround we hide — it is the stated, documented rationale in our data sources table.

---

### Q4: "Is PRAHARI-AI connected to SACHET? Can it actually send alerts?"

**Answer:** Not in the MVP — the alert layer is built to the same CAP structure SACHET uses, with a simulated dissemination panel, ready for integration in a production deployment. The simulated panel shows exactly what would be sent. Connecting to SACHET's real intake requires an MOU with NDMA — a production step, not a hackathon step. This is stated openly in every part of the UI that touches dissemination.

---

### Q5: "What happens if CWC or Bhuvan goes down during your demo?"

**Answer:** The dashboard reads from a cached last-known-good snapshot first; a live-fetch failure degrades to cached data rather than breaking the demo. This is stated openly, not hidden. We have a pre-demo checklist (DEMO_CHECKLIST.md) that includes manually refreshing the CWC snapshot and verifying Bhuvan-cached data before the presentation. In the code, every fetcher is isolated — one source failing never blocks another.

---

### Q6: "How does this scale beyond one district?"

**Answer:** The architecture is hazard-agnostic and district-agnostic by design. Adding a new state means re-running the same ingestion pipeline against that state's Bhuvan/Census layers and recalibrating thresholds — not rebuilding the system. The contrast with today's fragmented pilots is concrete: Mumbai's flood nowcasting, Lucknow's pump-automation system, and GSI's 3-district landslide coverage each work in isolation. PRAHARI-AI is the fusion and translation layer that works across all of them.

---

### Q7: "Why should we trust the weights you chose?"

**Answer:** We shouldn't — not yet. That's the point. Rainfall and river trend carry the most weight (0.4 and 0.3) because they are the two fastest-moving, most causally direct flood signals in the literature. But these are the system's starting point, not its final claim. The feedback loop — where officials report actual outcomes against predictions — is what converts these estimates into calibrated, zone-specific weights over time. The dashboard shows a before/after comparison of what adjustment looks like on real feedback data.
