"""
PRAHARI-AI — Backtest Engine
==============================
Tier: 1 (never cut) | Phase: 7

Runs the Phase 3 compute_risk() function against historical rainfall and
river-level data to produce a time-series risk score chart.

CRITICAL (Build Guide §7):
    The backtest is the "single strongest credibility slide" — it MUST NOT be cut.
    It directly reuses Phase 3's compute_risk() — no separate scoring function.

TARGET OUTCOME (Build Guide §7 acceptance criterion):
    "A chart showing the model would have flagged high risk before the event was
    confirmed" — must visibly cross the Critical (70) threshold at a timestamp
    EARLIER than the recorded actual event confirmation time.

DATA (Build Guide §7, §3.1):
    Historical rainfall and river-level data around:
    - Kerala 2018 floods (confirmed event: 15-17 August 2018)
    - Wayanad 2024 landslide (confirmed event: 30 July 2024)
    Sourced from: IMD archives, data.gov.in, or news-reported gauge readings.
    Daily resolution is acceptable if hourly is not obtainable (Build Guide §7).

HONEST FRAMING:
    The model outputs a relative risk ranking with a confidence score, not a certainty claim.
"""

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

from app.risk.engine import compute_risk

logger = logging.getLogger(__name__)

# Critical threshold from Build Guide §6.1
CRITICAL_THRESHOLD = 70.0

# Default historical event markers for the two target events
KNOWN_EVENTS = {
    "kerala_2018": {
        "label": "Kerala 2018 Floods — Official Confirmation",
        "confirmed_at": datetime(2018, 8, 15, 12, 0, tzinfo=timezone.utc),
    },
    "wayanad_2024": {
        "label": "Wayanad 2024 Landslide — Official Confirmation",
        "confirmed_at": datetime(2024, 7, 30, 6, 0, tzinfo=timezone.utc),
    },
}


def load_historical_data(csv_path: str) -> pd.DataFrame:
    """
    Load historical rainfall + river-level dataset from a CSV file.

    Expected CSV columns:
        timestamp       : ISO-8601 datetime string
        rainfall_mm_hr  : rainfall value (mm/hr or mm/day)
        river_level_m   : river gauge level in metres
        slope_proxy     : slope saturation proxy (static or daily estimate)
        hist_density    : historical incident density for the ward (static)

    Supports both hourly and daily resolution (Build Guide §7).
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Historical data CSV not found: {csv_path}")

    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    required_cols = {"timestamp", "rainfall_mm_hr", "river_level_m", "slope_proxy", "hist_density"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Historical CSV missing required columns: {missing}")

    logger.info("Backtest: loaded %d historical data points from %s", len(df), csv_path)
    return df


def _normalise_rainfall(value: float, threshold_mm: float = 100.0) -> float:
    """Normalise rainfall to 0-100 against the flood-triggering threshold."""
    return min(100.0, (value / threshold_mm) * 100.0)


def _normalise_river(value: float, danger_level_m: float = 10.0) -> float:
    """Normalise river level to 0-100 against the danger gauge level."""
    return min(100.0, (value / danger_level_m) * 100.0)


def run_backtest(
    historical_df: pd.DataFrame,
    rain_threshold: float = 100.0,
    river_danger_level: float = 10.0,
) -> pd.DataFrame:
    """
    Run compute_risk() against the historical dataset, timestamp by timestamp.
    Returns a DataFrame with columns: timestamp, risk_score, contributions.

    Directly reuses Phase 3's compute_risk() — no separate scoring function
    (Build Guide §7 requirement).
    """
    results = []
    for _, row in historical_df.iterrows():
        rainfall_norm = _normalise_rainfall(float(row["rainfall_mm_hr"]), rain_threshold)
        river_norm = _normalise_river(float(row["river_level_m"]), river_danger_level)
        slope = float(row["slope_proxy"])
        hist = float(row["hist_density"])

        score, contributions = compute_risk(rainfall_norm, river_norm, slope, hist)

        results.append({
            "timestamp": row["timestamp"],
            "risk_score": score,
            "contribution_rainfall": contributions["rainfall"],
            "contribution_river": contributions["river"],
            "contribution_slope": contributions["slope"],
            "contribution_history": contributions["history"],
        })

    results_df = pd.DataFrame(results)
    logger.info(
        "Backtest: scored %d timestamps; peak score = %.1f",
        len(results_df),
        results_df["risk_score"].max() if not results_df.empty else 0,
    )
    return results_df


def find_threshold_crossing(results_df: pd.DataFrame, threshold: float = CRITICAL_THRESHOLD):
    """
    Find the first timestamp where risk_score crosses the Critical threshold.
    Returns the timestamp or None if the threshold is never crossed.
    """
    crossings = results_df[results_df["risk_score"] >= threshold]
    if crossings.empty:
        return None
    return crossings.iloc[0]["timestamp"]


def plot_backtest_chart(
    results_df: pd.DataFrame,
    event_key: str = "kerala_2018",
    output_path: Optional[str] = None,
) -> str:
    """
    Generate the backtest chart: risk score over time, Critical threshold line,
    and the actual event confirmation marker.

    Build Guide §7 acceptance criterion: the chart must show the score crossing
    Critical (70) BEFORE the confirmed event time.

    Returns the path to the saved chart image.
    """
    event = KNOWN_EVENTS.get(event_key, {})
    confirmed_at = event.get("confirmed_at")
    event_label = event.get("label", "Actual Event")

    fig, ax = plt.subplots(figsize=(12, 5))
    ax.set_facecolor("#0f1117")
    fig.patch.set_facecolor("#0f1117")

    # Risk score line
    ax.plot(
        results_df["timestamp"],
        results_df["risk_score"],
        color="#f97316",
        linewidth=2,
        label="PRAHARI-AI Risk Score",
    )

    # Critical threshold
    ax.axhline(
        y=CRITICAL_THRESHOLD,
        color="#ef4444",
        linestyle="--",
        linewidth=1.5,
        label=f"Critical Threshold ({CRITICAL_THRESHOLD})",
    )

    # Alert threshold
    ax.axhline(y=40, color="#eab308", linestyle=":", linewidth=1.2, label="Alert Threshold (40)")

    # First threshold crossing
    first_crossing = find_threshold_crossing(results_df)
    if first_crossing:
        ax.axvline(
            x=first_crossing,
            color="#a855f7",
            linestyle="-.",
            linewidth=1.5,
            label=f"Model Flagged Critical: {pd.Timestamp(first_crossing).strftime('%b %d %H:%M')}",
        )

    # Confirmed event marker
    if confirmed_at:
        ax.axvline(
            x=confirmed_at,
            color="#22c55e",
            linestyle="-",
            linewidth=2,
            label=event_label,
        )

    ax.set_ylim(0, 105)
    ax.set_xlabel("Time", color="#9ca3af")
    ax.set_ylabel("Risk Score (0-100)", color="#9ca3af")
    ax.set_title("PRAHARI-AI Backtest — Risk Score vs Confirmed Event", color="#f1f5f9", pad=12)
    ax.tick_params(colors="#9ca3af")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
    plt.xticks(rotation=30, ha="right")

    legend = ax.legend(facecolor="#1e2330", labelcolor="#f1f5f9", loc="upper left")
    for line in legend.get_lines():
        line.set_linewidth(2)

    plt.tight_layout()

    if output_path is None:
        output_path = "scripts/backtest_chart.png"

    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    logger.info("Backtest chart saved to: %s", output_path)
    return output_path
