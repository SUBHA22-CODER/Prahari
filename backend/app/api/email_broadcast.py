"""PRAHARI-AI — EOC Email Dissemination and Brevo SMTP Integration."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import socket
import urllib.request
import json
from app.core.config import settings
from app.api.dashboard import generate_district_wards

router = APIRouter()

# In-memory recipient emails list (persisted during daemon lifecycle)
RECIPIENTS = [
    "collector.wayanad@kerala.gov.in",
    "controlroom.sih@gmail.com",
    "paridasubhaprasana@gmail.com",
    "decodinggen07@gmail.com"
]

class RecipientRequest(BaseModel):
    email: EmailStr

class EmailAlertRequest(BaseModel):
    district_id: str

def get_local_ip():
    """Detect local IP address of the machine to construct callback URLs."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@router.get("/recipients")
async def get_recipients():
    """Get all registered EOC email receivers."""
    return {"recipients": RECIPIENTS}

@router.post("/recipients/add")
async def add_recipient(req: RecipientRequest):
    """Add a new receiver email to EOC list."""
    email = req.email.strip().lower()
    if email not in RECIPIENTS:
        RECIPIENTS.append(email)
    return {"success": True, "recipients": RECIPIENTS}

@router.post("/test-alert")
async def send_email_alert(req: EmailAlertRequest):
    """Simulate critical alert and broadcast HTML email with inline feedback loop buttons using Brevo SMTP."""
    # Retrieve district wards to find risk info
    wards_data = generate_district_wards(req.district_id)
    critical_ward = next((w for w in wards_data if w["risk_score"] >= 70), wards_data[0])
    
    local_ip = get_local_ip()
    callback_base = f"http://{local_ip}:8080/api/v1/feedback/submit"
    
    # Construct feedback urls for buttons
    url_yes = f"{callback_base}?feedback=yes&district={req.district_id}&ward={critical_ward['ward_name']}&source=email"
    url_partial = f"{callback_base}?feedback=partial&district={req.district_id}&ward={critical_ward['ward_name']}&source=email"
    url_no = f"{callback_base}?feedback=no&district={req.district_id}&ward={critical_ward['ward_name']}&source=email"

    # HTML Email layout with premium alert styling and feedback buttons
    html_content = f"""
    <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #ef4444; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #ef4444; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">🚨 EMERGENCY DEOC BROADCAST 🚨</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: bold; opacity: 0.9;">PRAHARI-AI DECISION LAYER</p>
          </div>
          <div style="padding: 25px; line-height: 1.6;">
            <h3 style="color: #ef4444; margin-top: 0;">CRITICAL RISK WARNING DETECTED</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: bold;">District:</td>
                <td style="padding: 6px 0; color: #f8fafc; font-weight: bold; text-transform: uppercase;">{req.district_id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: bold;">Ward / Block:</td>
                <td style="padding: 6px 0; color: #f8fafc; font-weight: bold;">{critical_ward['ward_name']}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: bold;">Confidence Score:</td>
                <td style="padding: 6px 0; color: #f43f5e; font-weight: bold;">{critical_ward.get('confidence', 85)}%</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: bold;">Recommended Action:</td>
                <td style="padding: 6px 0; color: #38bdf8; font-weight: bold;">{critical_ward['recommended_action']}</td>
              </tr>
            </table>
            
            <p style="font-size: 13px; color: #cbd5e1; border-top: 1px solid #334155; padding-top: 15px;">
              As an authorized EOC duty officer, please verify this threat simulation instantly using the feedback buttons below:
            </p>
            
            <div style="text-align: center; margin: 30px 0; display: block;">
              <a href="{url_yes}" style="background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 5px; display: inline-block; font-size: 13px;">✅ Yes, Occurred</a>
              <a href="{url_partial}" style="background-color: #f59e0b; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 5px; display: inline-block; font-size: 13px;">⚠️ Partial</a>
              <a href="{url_no}" style="background-color: #ef4444; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 5px; display: inline-block; font-size: 13px;">❌ False Alarm</a>
            </div>
            
            <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; border-top: 1px solid #334155; padding-top: 15px;">
              This is a secure automated broadcast. Clicks will dynamically trigger reinforcement learning recalibration.
            </p>
          </div>
        </div>
      </body>
    </html>
    """

    # Retrieve Brevo credentials from settings / environment
    api_key = getattr(settings, "brevo_smtp_key", "") or os.getenv("BREVO_SMTP_KEY", "")
    sender_email = getattr(settings, "brevo_sender_email", "") or os.getenv("BREVO_SENDER_EMAIL", "decodinggen07@gmail.com")

    if not api_key:
        # Fallback to Local Log Simulation (Prevents code crash when credentials are empty)
        print("====== BREVO API SIMULATION LOG ======")
        print(f"To Recipients: {RECIPIENTS}")
        print(f"Alert: Critical Ward {critical_ward['ward_name']} Risk: {critical_ward['risk_score']}")
        print(f"URLs: YES={url_yes} | NO={url_no}")
        print("=======================================")
        return {
            "success": True,
            "simulated": True,
            "message": "Brevo credentials missing. Logged alert dispatch details to server console successfully.",
            "recipients": RECIPIENTS
        }

    try:
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": api_key
        }
        to_list = [{"email": addr} for addr in RECIPIENTS]
        payload = {
            "sender": {"name": "PRAHARI-AI DEOC", "email": sender_email},
            "to": to_list,
            "subject": f"🚨 EMERGENCY: Critical CAP Alert Broadcast for {req.district_id.upper()}",
            "htmlContent": html_content
        }

        req_obj = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        res_data = urllib.request.urlopen(req_obj, timeout=4).read().decode()
        
        print(f"Brevo REST API Response: {res_data}")

        return {
            "success": True,
            "simulated": False,
            "message": f"Evacuation warning broadcasted live to {len(RECIPIENTS)} EOC officers via Brevo!",
            "recipients": RECIPIENTS
        }
    except Exception as e:
        print(f"Brevo Dispatch Error: {e}")
        return {
            "success": True,
            "simulated": True,
            "message": f"Brevo API Error ({e}). Logged locally: YES={url_yes}",
            "recipients": RECIPIENTS
        }
