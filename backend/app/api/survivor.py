"""
PRAHARI-AI — Telecom Dead-Zone Survivor Triangulation
Simulates CDR (Call Detail Record) mobile signal dropout cluster detection
for post-disaster survivor pocket identification.

In production: CDR dropout streams come from BSNL/Airtel/Jio via
DoT-mandated NDMA Telecom Integration API (ITU CAP v1.2 compliant).
"""

from fastapi import APIRouter
from datetime import datetime
import random
from app.core.config import settings

router = APIRouter()

# Simulated survivor zone cluster data — district-aware, ward-accurate
SURVIVOR_ZONE_DATA = {
    "wayanad": [
        {
            "id": "SZ-WYD-001",
            "ward_name": "Ward 14 (Meppadi / Chooralmala)",
            "lat": 11.538,
            "lng": 76.054,
            "phone_count": 47,
            "operator": "BSNL / Jio",
            "dropout_time": "02:04:17",
            "dropout_date": "2024-07-30",
            "radius_m": 200,
            "probability": 94,
            "signal_strength_before": -67,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 42,
            "tower_id": "KL-WYD-BTS-114"
        },
        {
            "id": "SZ-WYD-002",
            "ward_name": "Ward 11 (Mundakkai / Vellarimala)",
            "lat": 11.561,
            "lng": 76.061,
            "phone_count": 31,
            "operator": "Airtel / BSNL",
            "dropout_time": "02:06:43",
            "dropout_date": "2024-07-30",
            "radius_m": 150,
            "probability": 88,
            "signal_strength_before": -71,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 27,
            "tower_id": "KL-WYD-BTS-108"
        },
        {
            "id": "SZ-WYD-003",
            "ward_name": "Ward 08 (Kaniyambetta / Ambalavayal)",
            "lat": 11.623,
            "lng": 76.143,
            "phone_count": 19,
            "operator": "Jio / Vi",
            "dropout_time": "02:11:05",
            "dropout_date": "2024-07-30",
            "radius_m": 120,
            "probability": 79,
            "signal_strength_before": -74,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 16,
            "tower_id": "KL-WYD-BTS-082"
        }
    ],
    "kamrup": [
        {
            "id": "SZ-KMR-001",
            "ward_name": "Ward 04 (Chandmari / Zoo Road)",
            "lat": 26.154,
            "lng": 91.746,
            "phone_count": 63,
            "operator": "BSNL / Airtel",
            "dropout_time": "06:22:11",
            "dropout_date": "2024-06-18",
            "radius_m": 250,
            "probability": 91,
            "signal_strength_before": -65,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 57,
            "tower_id": "AS-KMR-BTS-204"
        },
        {
            "id": "SZ-KMR-002",
            "ward_name": "Ward 08 (Jalukbari / Pandu)",
            "lat": 26.124,
            "lng": 91.716,
            "phone_count": 38,
            "operator": "Jio / BSNL",
            "dropout_time": "06:25:33",
            "dropout_date": "2024-06-18",
            "radius_m": 180,
            "probability": 85,
            "signal_strength_before": -69,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 34,
            "tower_id": "AS-KMR-BTS-188"
        },
        {
            "id": "SZ-KMR-003",
            "ward_name": "Ward 01 (Bharalumukh / Fancy Bazar)",
            "lat": 26.164,
            "lng": 91.756,
            "phone_count": 24,
            "operator": "Vi / Airtel",
            "dropout_time": "06:29:47",
            "dropout_date": "2024-06-18",
            "radius_m": 140,
            "probability": 76,
            "signal_strength_before": -72,
            "signal_strength_after": 0,
            "rescue_priority": "MEDIUM",
            "estimated_survivors": 21,
            "tower_id": "AS-KMR-BTS-171"
        }
    ],
    "cachar": [
        {
            "id": "SZ-CAC-001",
            "ward_name": "Ward 06 (Barak Riverbank / Tarapur)",
            "lat": 24.843,
            "lng": 92.788,
            "phone_count": 55,
            "operator": "BSNL / Jio",
            "dropout_time": "08:14:22",
            "dropout_date": "2024-06-22",
            "radius_m": 220,
            "probability": 92,
            "signal_strength_before": -68,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 49,
            "tower_id": "AS-CAC-BTS-106"
        },
        {
            "id": "SZ-CAC-002",
            "ward_name": "Ward 02 (Rangirkhari / Silchar Town)",
            "lat": 24.823,
            "lng": 92.768,
            "phone_count": 41,
            "operator": "Airtel / BSNL",
            "dropout_time": "08:17:09",
            "dropout_date": "2024-06-22",
            "radius_m": 160,
            "probability": 86,
            "signal_strength_before": -70,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 37,
            "tower_id": "AS-CAC-BTS-092"
        },
        {
            "id": "SZ-CAC-003",
            "ward_name": "Ward 08 (Ambicapatty / Public School)",
            "lat": 24.853,
            "lng": 92.798,
            "phone_count": 22,
            "operator": "Jio / Vi",
            "dropout_time": "08:21:44",
            "dropout_date": "2024-06-22",
            "radius_m": 110,
            "probability": 74,
            "signal_strength_before": -75,
            "signal_strength_after": 0,
            "rescue_priority": "MEDIUM",
            "estimated_survivors": 19,
            "tower_id": "AS-CAC-BTS-078"
        }
    ],
    "dibrugarh": [
        {
            "id": "SZ-DIB-001",
            "ward_name": "Ward 03 (Brahmaputra Embankment / Maijan)",
            "lat": 27.482,
            "lng": 94.922,
            "phone_count": 44,
            "operator": "BSNL / Airtel",
            "dropout_time": "04:33:15",
            "dropout_date": "2024-07-08",
            "radius_m": 190,
            "probability": 89,
            "signal_strength_before": -66,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 39,
            "tower_id": "AS-DIB-BTS-133"
        },
        {
            "id": "SZ-DIB-002",
            "ward_name": "Ward 07 (Chowkidinghee / Town)",
            "lat": 27.462,
            "lng": 94.902,
            "phone_count": 29,
            "operator": "Jio / BSNL",
            "dropout_time": "04:36:51",
            "dropout_date": "2024-07-08",
            "radius_m": 145,
            "probability": 81,
            "signal_strength_before": -73,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 26,
            "tower_id": "AS-DIB-BTS-117"
        }
    ],
    "shimla": [
        {
            "id": "SZ-SML-001",
            "ward_name": "Ward 05 (Summer Hill / University)",
            "lat": 31.114,
            "lng": 77.183,
            "phone_count": 36,
            "operator": "BSNL / Airtel",
            "dropout_time": "03:18:29",
            "dropout_date": "2024-08-08",
            "radius_m": 165,
            "probability": 87,
            "signal_strength_before": -69,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 32,
            "tower_id": "HP-SML-BTS-055"
        },
        {
            "id": "SZ-SML-002",
            "ward_name": "Ward 11 (Mall Road / Ridge)",
            "lat": 31.094,
            "lng": 77.163,
            "phone_count": 28,
            "operator": "Jio / Vi",
            "dropout_time": "03:21:04",
            "dropout_date": "2024-08-08",
            "radius_m": 130,
            "probability": 80,
            "signal_strength_before": -72,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 25,
            "tower_id": "HP-SML-BTS-041"
        }
    ],
    "idukki": [
        {
            "id": "SZ-IDK-001",
            "ward_name": "Ward 12 (Munnar / Gap Road)",
            "lat": 9.859,
            "lng": 76.982,
            "phone_count": 52,
            "operator": "BSNL / Jio",
            "dropout_time": "05:44:18",
            "dropout_date": "2024-07-21",
            "radius_m": 210,
            "probability": 93,
            "signal_strength_before": -64,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 47,
            "tower_id": "KL-IDK-BTS-212"
        },
        {
            "id": "SZ-IDK-002",
            "ward_name": "Ward 08 (Cheruthoni Dam Site)",
            "lat": 9.829,
            "lng": 76.952,
            "phone_count": 34,
            "operator": "Airtel / BSNL",
            "dropout_time": "05:48:55",
            "dropout_date": "2024-07-21",
            "radius_m": 155,
            "probability": 84,
            "signal_strength_before": -71,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 30,
            "tower_id": "KL-IDK-BTS-198"
        }
    ],
    "pathanamthitta": [
        {
            "id": "SZ-PTA-001",
            "ward_name": "Ward 08 (Ranni / Pamba Basin)",
            "lat": 9.274,
            "lng": 76.797,
            "phone_count": 48,
            "operator": "BSNL / Airtel",
            "dropout_time": "07:12:33",
            "dropout_date": "2024-08-15",
            "radius_m": 200,
            "probability": 91,
            "signal_strength_before": -67,
            "signal_strength_after": 0,
            "rescue_priority": "CRITICAL",
            "estimated_survivors": 43,
            "tower_id": "KL-PTA-BTS-108"
        },
        {
            "id": "SZ-PTA-002",
            "ward_name": "Ward 03 (Konni / Elephant Reserve)",
            "lat": 9.254,
            "lng": 76.777,
            "phone_count": 27,
            "operator": "Jio / BSNL",
            "dropout_time": "07:15:47",
            "dropout_date": "2024-08-15",
            "radius_m": 135,
            "probability": 82,
            "signal_strength_before": -70,
            "signal_strength_after": 0,
            "rescue_priority": "HIGH",
            "estimated_survivors": 24,
            "tower_id": "KL-PTA-BTS-094"
        }
    ]
}


@router.get("/zones")
async def get_survivor_zones(district: str = "wayanad"):
    """
    Returns simulated CDR dropout survivor pocket clusters for a given district.
    """
    district_key = district.lower().strip()
    zones = SURVIVOR_ZONE_DATA.get(district_key, SURVIVOR_ZONE_DATA["wayanad"])
    
    total_phones = sum(z["phone_count"] for z in zones)
    total_survivors = sum(z["estimated_survivors"] for z in zones)
    critical_count = sum(1 for z in zones if z["rescue_priority"] == "CRITICAL")
    
    return {
        "district": district_key,
        "scan_timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "SIMULATED — CDR Dropout Pattern Analysis (BSNL/Airtel/Jio Tower Heartbeat Monitor)",
        "total_zones_detected": len(zones),
        "total_phones_offline": total_phones,
        "total_estimated_survivors": total_survivors,
        "critical_zones": critical_count,
        "zones": zones
    }


from pydantic import BaseModel
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class DispatchRequest(BaseModel):
    cluster_id: str = "SZ-WYD-001"
    ward_name: str = "Ward 14 (Meppadi / Chooralmala)"
    phone_count: int = 47
    estimated_survivors: int = 42
    rescue_priority: str = "CRITICAL"
    radius_m: int = 200
    lat: float = 11.538
    lng: float = 76.054
    tower_id: str = "KL-WYD-BTS-114"
    recipient_email: str | None = None
    recipient_phone: str | None = None


@router.post("/dispatch")
async def dispatch_ndrf_team(payload: DispatchRequest):
    """
    Triggers Live Dual-Channel Dispatch (Brevo HTML Mandate Email + Twilio Voice Call)
    to the NDRF Battalion Team Lead for post-disaster survivor rescue.
    """
    recipient_email = (payload.recipient_email or settings.ndrf_lead_email or os.getenv("NDRF_LEAD_EMAIL", "decodinggen07@gmail.com")).strip()
    recipient_phone = (payload.recipient_phone or settings.ndrf_lead_phone or os.getenv("NDRF_LEAD_PHONE", "+919876543210")).strip()
    
    timestamp_str = datetime.now().strftime("%I:%M:%S %p IST, %d %b %Y")
    
    # 1. Brevo SMTP HTML Email Dispatch
    email_sent = False
    email_message = ""
    smtp_key = (settings.brevo_smtp_key or os.getenv("BREVO_SMTP_KEY", "")).strip()
    sender_email = (settings.brevo_sender_email or os.getenv("BREVO_SENDER_EMAIL", "decodinggen07@gmail.com")).strip()
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #e2e8f0; }}
        .card {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 2px solid #ef4444; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .header {{ background-color: #7f1d1d; padding: 20px; text-align: center; border-bottom: 2px solid #ef4444; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1.5px; }}
        .header p {{ color: #fca5a5; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; }}
        .content {{ padding: 24px; }}
        .badge {{ display: inline-block; background-color: #dc2626; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; background-color: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155; }}
        .stat-label {{ font-size: 11px; color: #94a3b8; text-transform: uppercase; }}
        .stat-val {{ font-size: 16px; font-weight: bold; color: #f8fafc; margin-top: 2px; }}
        .highlight {{ color: #f87171; font-weight: bold; }}
        .btn {{ display: inline-block; width: 100%; background-color: #dc2626; color: white; text-align: center; padding: 12px 0; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 14px; margin-top: 16px; }}
        .footer {{ background-color: #0f172a; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚨 EMERGENCY NDRF DISPATCH MANDATE</h1>
          <p>PRAHARI-AI TELECOM DEAD-ZONE SURVIVOR TRIANGULATION LAYER</p>
        </div>
        <div class="content">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge">{payload.rescue_priority} PRIORITY DEPLOYMENT</span>
            <span style="font-size: 11px; color: #94a3b8;">{timestamp_str}</span>
          </div>
          
          <h2 style="color: #ffffff; font-size: 18px; margin: 16px 0 8px 0;">{payload.ward_name}</h2>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin: 0;">
            A sudden mobile network signal void has been detected via BSNL/Airtel tower CDR heartbeat dropouts. 
            Immediate Urban Search & Rescue (USAR) deployment is mandated by District EOC Command.
          </p>
          
          <div class="grid">
            <div>
              <div class="stat-label">Silent Phones</div>
              <div class="stat-val highlight">📱 {payload.phone_count} Phones</div>
            </div>
            <div>
              <div class="stat-label">Est. Survivors</div>
              <div class="stat-val" style="color: #60a5fa;">👥 {payload.estimated_survivors} Trapped</div>
            </div>
            <div>
              <div class="stat-label">Target Radius</div>
              <div class="stat-val">{payload.radius_m} Meters</div>
            </div>
            <div>
              <div class="stat-label">Tower BTS ID</div>
              <div class="stat-val" style="font-family: monospace; font-size: 13px;">{payload.tower_id}</div>
            </div>
          </div>
          
          <div style="background-color: #0f172a; padding: 12px; border-radius: 6px; border-left: 4px solid #38bdf8; font-size: 12px; color: #94a3b8;">
            📍 <strong>GPS Coordinates:</strong> {payload.lat}° N, {payload.lng}° E<br>
            🗺️ <strong>Google Maps Location:</strong> <a href="https://maps.google.com/?q={payload.lat},{payload.lng}" style="color: #38bdf8; font-weight: bold;">Open Coordinates in Maps ➔</a>
          </div>
          
          <a href="http://localhost:5173/rescue-intel" class="btn">VIEW LIVE RESCUE MAP & ROUTE ➔</a>
        </div>
        <div class="footer">
          PRAHARI-AI Decision Intelligence Layer | Smart India Hackathon 2026<br>
          Automated Emergency Dispatch Engine • ITU CAP v1.2 Compliant
        </div>
      </div>
    </body>
    </html>
    """
    
    # 1. Brevo REST API HTML Email Dispatch Engine
    email_sent = False
    email_message = ""
    smtp_key = (settings.brevo_smtp_key or os.getenv("BREVO_SMTP_KEY", "")).strip()
    sender_email = (settings.brevo_sender_email or os.getenv("BREVO_SENDER_EMAIL", "decodinggen07@gmail.com")).strip()
    
    if smtp_key:
        try:
            import urllib.request
            import json
            
            brevo_url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": smtp_key
            }
            brevo_payload = {
                "sender": {"name": "PRAHARI-AI EOC Dispatch", "email": sender_email},
                "to": [{"email": recipient_email}],
                "subject": f"🚨 EMERGENCY NDRF DISPATCH MANDATE — {payload.ward_name} ({payload.cluster_id})",
                "htmlContent": html_body
            }
            req = urllib.request.Request(brevo_url, data=json.dumps(brevo_payload).encode('utf-8'), headers=headers)
            res = urllib.request.urlopen(req, timeout=12)
            
            email_sent = True
            email_message = f"HTML Dispatch Mandate Email delivered to {recipient_email} (Brevo HTTP {res.status})"
        except Exception as e:
            email_message = f"Brevo Email dispatch failed ({e})"
    else:
        email_message = "BREVO_SMTP_KEY not configured in .env"

    # 2. Twilio Voice Call Dispatch Engine
    call_sent = False
    call_message = ""
    twilio_sid = (settings.twilio_account_sid or os.getenv("TWILIO_ACCOUNT_SID", "")).strip()
    twilio_token = (settings.twilio_auth_token or os.getenv("TWILIO_AUTH_TOKEN", "")).strip()
    twilio_from = (settings.twilio_from_number or os.getenv("TWILIO_FROM_NUMBER", "")).strip()

    # Format phone number for E.164 (+91...)
    formatted_phone = recipient_phone
    if formatted_phone and not formatted_phone.startswith("+"):
        if len(formatted_phone) == 10:
            formatted_phone = f"+91{formatted_phone}"
        else:
            formatted_phone = f"+{formatted_phone}"

    if twilio_sid and twilio_token and twilio_from:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)

            twiml_speech = f"""<Response>
                <Say voice="alice" language="en-US">
                    Emergency Alert from PRAHARI A I Command Center. 
                    A post disaster survivor cluster has been detected in {payload.ward_name}. 
                    {payload.estimated_survivors} trapped survivors estimated. 
                    Priority is {payload.rescue_priority}. 
                    Check your email for exact G P S coordinates and official dispatch mandate.
                </Say>
            </Response>"""

            call = client.calls.create(
                to=formatted_phone,
                from_=twilio_from,
                twiml=twiml_speech
            )
            call_sent = True
            call_message = f"Twilio Voice Call initiated to {formatted_phone} (Call SID: {call.sid})"
        except Exception as e:
            call_message = f"Twilio Voice Call dispatch error ({e})"
    else:
        call_message = "Twilio credentials not configured in .env (Simulated Voice Call Ready)"

    return {
        "success": True,
        "dispatch_id": f"DSP-{payload.cluster_id}-{int(datetime.now().timestamp())}",
        "timestamp": timestamp_str,
        "ward_name": payload.ward_name,
        "estimated_survivors": payload.estimated_survivors,
        "recipient_email": recipient_email,
        "recipient_phone": formatted_phone,
        "email_sent": email_sent,
        "email_message": email_message,
        "call_sent": call_sent,
        "call_message": call_message
    }

