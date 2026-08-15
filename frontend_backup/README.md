# PRAHARI-AI — National Multi-Hazard Impact-Based Decision Intelligence Layer

**SIH Disaster Management Theme Command Dashboard Frontend**

PRAHARI-AI fuses hazard information (rainfall, river level, slope saturation) with hyperlocal exposure data (population, schools, healthcare infrastructure) to produce ward-level impact-based risk intelligence and CAP v1.2 dissemination alerts for emergency operations centers (EOC).

---

## Key Features & Architecture

1. **EOC Command Interface**: Clean government-tech theme built for high clarity, credibility, and immediate decision support.
2. **Interactive Geospatial Risk Map**: React-Leaflet map centered on pilot district (Wayanad, Kerala) visualizing ward polygons color-coded by standard risk bands:
   - **CRITICAL (70–100)**: Immediate Evacuation Mandate (Red)
   - **ALERT (40–70)**: Heightened Preparedness (Orange)
   - **MONITOR (0–40)**: Routine Telemetry Monitoring (Green)
3. **Hyperlocal Ward Risk Intelligence**:
   - 4 Backend Risk Contributions: Rainfall, River Trend, Slope Saturation, Historical Incidents.
   - Data Confidence Score & Data Freshness indicators.
   - Hyperlocal Exposure Metrics: Vulnerable Population, Schools/Shelters, Healthcare Centers.
   - Prominent Mandated Actions & Supporting Tactical Protocols.
4. **CAP v1.2 Alert Feed & Simulated SACHET Dissemination**:
   - Common Alerting Protocol payload viewer (JSON/XML).
   - Clear **SIMULATED DISSEMINATION** badge for SACHET target.
5. **Official Response Triage Table**:
   - Prioritized decision matrix sorted descending by risk score.
   - Interactive search and band filters.
6. **Historical Backtest Evaluation**:
   - Recharts timeline comparing model risk trajectory against the 70 Critical threshold and disaster occurrence markers for **Wayanad July 2024** and **Kerala August 2018** floods (+18hr early lead time).
7. **Official Field Feedback & Recalibration**:
   - Ground-truth logging (Confirmed, Partially Confirmed, False Alarm) and before/after recalibration demonstration.
8. **Data Source & Infrastructure Status**:
   - Telemetry sync status grid (Open-Meteo, CWC, Bhuvan DEM, OSM Overpass, Census SECC) with `LIVE`, `CACHED`, and `STATIC` status badges.

---

## Quick Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd C:\Users\Dhrubojyoti\.gemini\antigravity-ide\scratch\prahari-ai-frontend

# Install dependencies
npm install

# Start local dev server
npm run dev
```

The application will launch on `http://localhost:5173`.

---

## Environment Configuration

Copy `.env.example` to `.env`:

```env
# FastAPI Backend REST API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Demo Mode (Enable offline seeded demo data for hackathon presentation)
VITE_DEMO_MODE=true
```

---

## Running Automated Tests

```bash
npm test
```

---

## Demo Presentation Flow (10-Second Judge Walkthrough)

1. **Open Overview (`/`)**: Judge immediately sees the **Wayanad Pilot District** command summary, active alerts (5), and critical ward count (3).
2. **Interact with Map**: Point to Ward 14 (Meppadi / Vellarimala) polygon highlighted in Red.
3. **Inspect Ward Details**: Show the **82 Impact Risk Score**, **84% Confidence**, the 4 backend risk contributions (Rainfall 32, River 21, Slope 14, History 15), and exposure (2,840 population, 7 schools, 2 hospitals).
4. **Action Mandate**: Point to **"EVACUATE LOW-LYING HOUSEHOLDS"**.
5. **View Alert**: Click **"VIEW ALERT"** to show the CAP v1.2 payload and **SIMULATED SACHET DISSEMINATION** badge.
6. **Backtest (`/backtest`)**: Show that PRAHARI-AI crossed the Critical 70 threshold **18 hours before** the Wayanad 2024 disaster occurred.
