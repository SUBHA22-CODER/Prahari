"""PRAHARI-AI — Telegram Bot Integration and EOC Alert Dissemination."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import urllib.request
import urllib.parse
import json
import socket
import asyncio
from app.api.dashboard import PILOT_DISTRICTS, generate_district_wards

from app.core.config import settings

router = APIRouter()

BOT_TOKEN = settings.telegram_bot_token

# Segregated channels map (falling back to user settings for DEMO functionality)
TELEGRAM_CHANNELS = {
    "wayanad": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Wayanad DEOC Alerts"},
    "kamrup": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Kamrup Metro DEOC Alerts"},
    "cachar": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Cachar DEOC Alerts"},
    "dibrugarh": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Dibrugarh DEOC Alerts"},
    "shimla": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Shimla DEOC Alerts"},
    "idukki": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Idukki DEOC Alerts"},
    "pathanamthitta": {"chat_id": settings.telegram_chat_id, "invite": settings.telegram_invite_url, "name": "Pathanamthitta DEOC Alerts"}
}

def get_local_ip():
    """Detect local IP address of the machine to allow phones on the same Wi-Fi to hit the feedback callback."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class AlertRequest(BaseModel):
    district_id: str

@router.get("/channels")
async def get_telegram_channels():
    """Return all configured Telegram invite channels."""
    return TELEGRAM_CHANNELS

@router.post("/test-alert")
async def trigger_test_alert(payload: AlertRequest):
    """Trigger a simulated critical alert and push it directly to the district's Telegram channel."""
    dist_id = payload.district_id.lower()
    
    if dist_id not in TELEGRAM_CHANNELS:
        raise HTTPException(status_code=404, detail="District Telegram channel not found.")

    channel = TELEGRAM_CHANNELS[dist_id]
    chat_id = channel["chat_id"]
    invite_url = channel["invite"]

    # Fetch district wards to grab the highest risk ward for simulation
    wards = generate_district_wards(dist_id)
    critical_ward = max(wards, key=lambda w: w["risk_score"])
    
    alert_id = f"PRAHARI-{critical_ward['ward_id']}-SIM"
    ward_name = critical_ward["ward_name"]
    risk_score = critical_ward["risk_score"]
    action = critical_ward["recommended_action"]

    # Resolve local IP address dynamically for local Wi-Fi feedback routing
    local_ip = get_local_ip()
    base_callback_url = f"http://{local_ip}:8080/api/v1/feedback/submit"

    # Define URL buttons for inline keyboard feedback loop
    url_yes = f"{base_callback_url}?alert_id={alert_id}&status=occurred&district={dist_id}"
    url_no = f"{base_callback_url}?alert_id={alert_id}&status=false_alarm&district={dist_id}"
    url_partial = f"{base_callback_url}?alert_id={alert_id}&status=partial&district={dist_id}"

    # Telegram Message in clean HTML format
    message_text = (
        f"🚨 <b>PRAHARI-AI CRITICAL BROADCAST</b>\n"
        f"-----------------------------------------\n"
        f"<b>Ref ID:</b> <code>{alert_id}</code>\n"
        f"<b>District:</b> {dist_id.upper()}\n"
        f"<b>Ward:</b> {ward_name}\n"
        f"<b>Hazard Level:</b> CRITICAL (Score: {risk_score}/100)\n"
        f"<b>Mandate:</b> {action}\n\n"
        f"<i>Please verify ground truth status from the EOC command console below:</i>"
    )

    inline_keyboard = {
        "inline_keyboard": [
            [
                {"text": "✅ Yes, Occurred", "url": url_yes},
                {"text": "⚠️ Partial", "url": url_partial},
                {"text": "❌ False Alarm", "url": url_no}
            ]
        ]
    }

    # Prepare HTTP POST call parameters
    post_data = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": "HTML",
        "reply_markup": inline_keyboard
    }

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    def send_request():
        req = urllib.request.Request(
            url,
            data=json.dumps(post_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            return response.read().decode()

    try:
        response_text = await asyncio.to_thread(send_request)
        return {
            "success": True,
            "message": "Critical alert broadcasted to Telegram!",
            "channel_name": channel["name"],
            "invite_url": invite_url,
            "local_ip_used": local_ip,
            "response": json.loads(response_text)
        }
    except Exception as e:
        # Resilient local fallback in case of no internet or rate limits
        return {
            "success": False,
            "message": f"Telegram API offline or rate-limited. Logged locally: {e}",
            "channel_name": channel["name"],
            "invite_url": invite_url,
            "simulated_alert": {
                "alert_id": alert_id,
                "ward_name": ward_name,
                "risk_score": risk_score,
                "action": action
            }
        }
