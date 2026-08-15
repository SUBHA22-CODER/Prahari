"""PRAHARI-AI — Dashboard & District API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.exposure.grid import get_full_exposure_grid
from app.api.alerts import generate_district_alerts

router = APIRouter()

PILOT_DISTRICTS = [
    {"id": "wayanad", "name": "Wayanad", "state": "Kerala", "code": "KL-WYD", "lat": 11.605, "lng": 76.083, "zoom": 11},
    {"id": "cachar", "name": "Cachar (Silchar)", "state": "Assam", "code": "AS-CAC", "lat": 24.833, "lng": 92.778, "zoom": 11},
    {"id": "kamrup", "name": "Kamrup Metro (Guwahati)", "state": "Assam", "code": "AS-KMR", "lat": 26.144, "lng": 91.736, "zoom": 11},
    {"id": "dibrugarh", "name": "Dibrugarh", "state": "Assam", "code": "AS-DIB", "lat": 27.472, "lng": 94.912, "zoom": 11},
    {"id": "idukki", "name": "Idukki", "state": "Kerala", "code": "KL-IDK", "lat": 9.849, "lng": 76.972, "zoom": 11},
    {"id": "pathanamthitta", "name": "Pathanamthitta", "state": "Kerala", "code": "KL-PTA", "lat": 9.264, "lng": 76.787, "zoom": 11},
    {"id": "shimla", "name": "Shimla", "state": "Himachal Pradesh", "code": "HP-SML", "lat": 31.104, "lng": 77.173, "zoom": 11}
]

MOCK_EXPOSURE_POINTS = [
    {"id": "SCH-01", "name": "Meppadi Higher Secondary School", "type": "school", "lat": 11.552, "lng": 76.126, "capacity": 450},
    {"id": "SCH-02", "name": "St. Joseph Convent School", "type": "school", "lat": 11.548, "lng": 76.121, "capacity": 300},
    {"id": "HSP-01", "name": "Government Primary Health Center Meppadi", "type": "hospital", "lat": 11.554, "lng": 76.128, "beds": 25},
    {"id": "SCH-03", "name": "Vythiri High School", "type": "school", "lat": 11.558, "lng": 76.042, "capacity": 500},
    {"id": "HSP-02", "name": "Vythiri Community Health Center", "type": "hospital", "lat": 11.552, "lng": 76.039, "beds": 40},
    {"id": "SCH-04", "name": "Mundakkai Primary School", "type": "school", "lat": 11.532, "lng": 76.141, "capacity": 200},
    {"id": "SCH-05", "name": "Chooralmala GLP School", "type": "school", "lat": 11.538, "lng": 76.148, "capacity": 250}
]

DISTRICT_WARD_NAMES = {
    "wayanad": [
        ("W14", "Ward 14 (Meppadi / Vellarimala)", 82, "CRITICAL", (-0.03, -0.03), 2840),
        ("W09", "Ward 09 (Vythiri Slope)", 76, "CRITICAL", (0.02, 0.01), 3120),
        ("W18", "Ward 18 (Thariode / Banasura)", 72, "CRITICAL", (-0.01, 0.04), 1650),
        ("W02", "Ward 02 (Panamaram Lowland)", 68, "ALERT", (-0.04, 0.02), 2100),
        ("W21", "Ward 21 (Kalpetta Town)", 64, "ALERT", (0.01, -0.03), 4150),
        ("W05", "Ward 05 (Sulthan Bathery)", 48, "ALERT", (0.04, 0.03), 3600),
        ("W12", "Ward 12 (Mananthavady)", 32, "MONITOR", (-0.05, -0.01), 2900)
    ],
    "cachar": [
        ("W14", "Ward 14 (Silchar Town Central)", 92, "CRITICAL", (-0.03, -0.03), 4100),
        ("W09", "Ward 09 (Sonai River Slope)", 87, "CRITICAL", (0.02, 0.01), 3450),
        ("W18", "Ward 18 (Lakhipur Embankment)", 84, "CRITICAL", (-0.01, 0.04), 2800),
        ("W04", "Ward 04 (Barakhola Inundation)", 78, "CRITICAL", (-0.02, 0.03), 3100),
        ("W08", "Ward 08 (Bhangarpar Dyke)", 71, "CRITICAL", (0.03, -0.02), 2600),
        ("W02", "Ward 02 (Katigorah Sluice)", 66, "ALERT", (-0.04, 0.02), 2300),
        ("W21", "Ward 21 (Dholai Sector)", 61, "ALERT", (0.01, -0.03), 3800),
        ("W05", "Ward 05 (Udharbond Sector)", 49, "ALERT", (0.04, 0.03), 1850),
        ("W12", "Ward 12 (Baskandi Ridge)", 29, "MONITOR", (-0.05, -0.01), 2100)
    ],
    "kamrup": [
        ("W14", "Ward 14 (Jalukbari Riverfront)", 88, "CRITICAL", (-0.03, -0.03), 4800),
        ("W09", "Ward 09 (Dispur Hills Slope)", 83, "CRITICAL", (0.02, 0.01), 3900),
        ("W18", "Ward 18 (Guwahati Inland Basin)", 79, "CRITICAL", (-0.01, 0.04), 3100),
        ("W03", "Ward 03 (Pandu Ghat Sector)", 72, "CRITICAL", (0.03, -0.01), 2700),
        ("W02", "Ward 02 (Azara Lowland)", 65, "ALERT", (-0.04, 0.02), 3100),
        ("W21", "Ward 21 (Fancy Bazaar Market)", 58, "ALERT", (0.01, -0.03), 5200),
        ("W05", "Ward 05 (Khanapara Ridge)", 34, "MONITOR", (0.04, 0.03), 1900),
        ("W12", "Ward 12 (Maligaon Junction)", 25, "MONITOR", (-0.05, -0.01), 2700)
    ],
    "dibrugarh": [
        ("W14", "Ward 14 (Dibrugarh Town Dyke)", 79, "CRITICAL", (-0.03, -0.03), 3100),
        ("W09", "Ward 09 (Moran Oilfield Slope)", 72, "CRITICAL", (0.02, 0.01), 2700),
        ("W18", "Ward 18 (Duliajan Riverbank)", 63, "ALERT", (-0.01, 0.04), 1950),
        ("W02", "Ward 02 (Chabua Lowland)", 56, "ALERT", (-0.04, 0.02), 2200),
        ("W21", "Ward 21 (Naharkatia Junction)", 42, "ALERT", (0.01, -0.03), 3400),
        ("W12", "Ward 12 (Khowang Sector)", 26, "MONITOR", (-0.05, -0.01), 1850)
    ],
    "shimla": [
        ("W14", "Ward 14 (Rampur Sutlej Slope)", 79, "CRITICAL", (-0.03, -0.03), 1850),
        ("W09", "Ward 09 (Narkanda Ridge Slide)", 67, "ALERT", (0.02, 0.01), 1600),
        ("W18", "Ward 18 (Rohru Pabbar Basin)", 62, "ALERT", (-0.01, 0.04), 1400),
        ("W02", "Ward 02 (Theog Highway Sector)", 54, "ALERT", (-0.04, 0.02), 1900),
        ("W21", "Ward 21 (Shimla Mall Road)", 45, "ALERT", (0.01, -0.03), 3900),
        ("W05", "Ward 05 (Jubbal Valley)", 34, "MONITOR", (0.04, 0.03), 1200),
        ("W12", "Ward 12 (Kotkhai Sector)", 22, "MONITOR", (-0.05, -0.01), 1350)
    ],
    "idukki": [
        ("W14", "Ward 14 (Munnar Tea Hill Slope)", 89, "CRITICAL", (-0.03, -0.03), 2900),
        ("W09", "Ward 09 (Devikulam Ghat Road)", 83, "CRITICAL", (0.02, 0.01), 2400),
        ("W18", "Ward 18 (Periyar Dam Outflow)", 76, "CRITICAL", (-0.01, 0.04), 1750),
        ("W04", "Ward 04 (Cheruthoni Spillway)", 71, "CRITICAL", (0.03, -0.01), 2100),
        ("W02", "Ward 02 (Peerumade Lowland)", 64, "ALERT", (-0.04, 0.02), 2100),
        ("W21", "Ward 21 (Thodupuzha Town)", 57, "ALERT", (0.01, -0.03), 4300),
        ("W05", "Ward 05 (Udumbanchola)", 41, "ALERT", (0.04, 0.03), 1800),
        ("W12", "Ward 12 (Kattappana Sector)", 28, "MONITOR", (-0.05, -0.01), 2200)
    ],
    "pathanamthitta": [
        ("W14", "Ward 14 (Ranni Pamba Riverbank)", 84, "CRITICAL", (-0.03, -0.03), 2700),
        ("W09", "Ward 09 (Konni Hill Slope)", 74, "CRITICAL", (0.02, 0.01), 2300),
        ("W18", "Ward 18 (Thiruvalla Lowland)", 65, "ALERT", (-0.01, 0.04), 3100),
        ("W02", "Ward 02 (Kozhencherry Basin)", 53, "ALERT", (-0.04, 0.02), 2000),
        ("W05", "Ward 05 (Mallapally Sector)", 38, "MONITOR", (0.04, 0.03), 1600),
        ("W12", "Ward 12 (Pandalam Lowland)", 25, "MONITOR", (-0.05, -0.01), 2500)
    ]
}

def generate_district_wards(district_id: str):
    """Generate ward polygons and risk scores for any selected pilot district."""
    dist_key = district_id.lower()
    dist = next((d for d in PILOT_DISTRICTS if d["id"] == dist_key), PILOT_DISTRICTS[0])
    c_lat, c_lng = dist["lat"], dist["lng"]
    name = dist["name"]

    ward_templates = DISTRICT_WARD_NAMES.get(dist_key, DISTRICT_WARD_NAMES["wayanad"])

    wards = []
    for wid, wname, score, band, offset, pop in ward_templates:
        d_lat = c_lat + offset[0]
        d_lng = c_lng + offset[1]
        
        poly = [
            [round(d_lng - 0.02, 4), round(d_lat - 0.02, 4)],
            [round(d_lng + 0.02, 4), round(d_lat - 0.02, 4)],
            [round(d_lng + 0.025, 4), round(d_lat + 0.02, 4)],
            [round(d_lng - 0.015, 4), round(d_lat + 0.025, 4)],
            [round(d_lng - 0.02, 4), round(d_lat - 0.02, 4)]
        ]

        # Dynamic Risk Contribution breakdown based on risk score
        r_rain = int(round(score * 0.42))
        r_river = int(round(score * 0.28))
        r_slope = int(round(score * 0.18))
        r_hist = int(round(score * 0.12))

        # Dynamic Confidence Score based on score and ward ID
        last_digit = int(wid[-1]) if wid[-1].isdigit() else 2
        conf_score = min(96, max(70, int(72 + (score * 0.22) + last_digit)))

        # Dynamic Exposure Infrastructure based on population
        schools_cnt = max(2, int(round(pop / 650)))
        hospitals_cnt = max(1, int(round(pop / 1800)))
        shelters_cnt = max(2, int(round(pop / 950)))

        # Dynamic Recommended Action specific to ward hazard profile
        action_map = {
            "W14": f"MANDATORY EVACUATION: Extreme flash flood inundation & slope failure warning in {wname}. Relocate {pop:,} residents to primary relief shelter immediately.",
            "W09": f"SLOPE FAILURE ADVISORY: Soil saturation high on hill cuts in {wname}. Deploy emergency NDRF units & evacuate steep slope households.",
            "W18": f"DAM SPILLWAY OUTFLOW WARNING: Reservoir release raising river level by 1.8m in {wname}. Evacuate riverbank personnel 100m inland.",
            "W04": f"EMBANKMENT BREACH PREPAREDNESS: Position inflatable rescue boats, sandbags & dewatering pumps at {wname} river sluice gates.",
            "W08": f"DYKE INUNDATION WARNING: Monitor river gauge overflow in {wname} & prepare community flood shelters.",
            "W03": f"RIVERBANK DISCHARGE ADVISORY: Alert low-lying agricultural communities in {wname} & restrict waterway access.",
            "W02": f"RIVERINE FLOOD ADVISORY: Upstream basin discharge causing steady gauge rise in {wname}. Keep emergency kits ready.",
            "W21": f"URBAN WATERLOGGING ADVISORY: Storm drain capacity bottleneck in {wname}. Reroute town bypass traffic & clear culverts.",
            "W05": f"RIDGE MONITORING: Restrict steep road corridors in {wname} & maintain 3-hour telemetry sync.",
            "W12": f"ROUTINE WEATHER MONITORING: Maintain standard 6-hour meteorological sync in {wname} & verify wireless links."
        }

        rec_action = action_map.get(wid, f"COMMUNITY FLOOD ADVISORY: Monitor water levels and maintain emergency readiness in {wname}.")

        wards.append({
            "ward_id": wid,
            "ward_name": wname,
            "district": name,
            "risk_score": score,
            "risk_band": band,
            "confidence": conf_score,
            "contributions": {
                "rainfall": r_rain,
                "river_trend": r_river,
                "slope_saturation": r_slope,
                "historical_incidents": r_hist
            },
            "exposure": {
                "population": pop,
                "schools": schools_cnt,
                "hospitals": hospitals_cnt,
                "shelters": shelters_cnt
            },
            "recommended_action": rec_action,
            "coordinates": [d_lat, d_lng],
            "geometry": {"type": "Polygon", "coordinates": [poly]}
        })

    return wards


def generate_exposure_points(district_id: str):
    dist = next((d for d in PILOT_DISTRICTS if d["id"] == district_id), PILOT_DISTRICTS[0])
    c_lat, c_lng = dist["lat"], dist["lng"]
    name = dist["name"]

    return [
        {"id": "SCH-01", "name": f"{name} Central Model School", "type": "school", "lat": round(c_lat + 0.01, 4), "lng": round(c_lng + 0.01, 4), "capacity": 450},
        {"id": "SCH-02", "name": f"{name} St. Xavier Secondary School", "type": "school", "lat": round(c_lat - 0.02, 4), "lng": round(c_lng - 0.01, 4), "capacity": 300},
        {"id": "HSP-01", "name": f"Government District Hospital {name}", "type": "hospital", "lat": round(c_lat + 0.005, 4), "lng": round(c_lng - 0.015, 4), "beds": 60},
        {"id": "HSP-02", "name": f"{name} Community Primary Health Center", "type": "hospital", "lat": round(c_lat - 0.025, 4), "lng": round(c_lng + 0.02, 4), "beds": 30}
    ]


@router.get("/districts")
async def get_districts():
    """Return list of supported pilot districts."""
    return PILOT_DISTRICTS


@router.get("/exposure")
async def get_exposure(district: str = "wayanad"):
    """Return exposure infrastructure points (schools, hospitals)."""
    return generate_exposure_points(district)


@router.get("/dashboard")
async def get_dashboard(district: str = "wayanad", db: AsyncSession = Depends(get_db)):
    """Return complete aggregated dashboard data payload."""
    wards = []
    try:
        wards = await get_full_exposure_grid(db, district)
    except Exception as e:
        print(f"[PRAHARI-AI API] get_dashboard DB fallback: {e}")

    if not wards:
        wards = generate_district_wards(district)

    exposure_pts = generate_exposure_points(district)

    crit_count = len([w for w in wards if w.get("risk_score", 0) >= 70])
    alert_count = len([w for w in wards if 40 <= w.get("risk_score", 0) < 70])

    summary = {
        "district": district,
        "total_wards": len(wards),
        "critical_wards": crit_count,
        "alert_wards": alert_count,
        "monitor_wards": len([w for w in wards if w.get("risk_score", 0) < 40]),
        "active_alerts": crit_count + alert_count,
        "last_updated": "Just now",
        "system_status": "OPERATIONAL"
    }

    dist_alerts = generate_district_alerts(district)

    return {
        "summary": summary,
        "wards": wards,
        "alerts": dist_alerts,
        "exposure_points": exposure_pts
    }
