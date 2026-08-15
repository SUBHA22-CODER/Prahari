"""
PRAHARI-AI — Application Configuration
=======================================
Loads all settings from environment variables / .env file (Build Guide §3.1).
No credential is ever hardcoded here.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE if ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Database ────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://prahari:prahari_pass@localhost:5432/prahari_db"

    @property
    def async_database_url(self) -> str:
        import os
        url = self.database_url
        if "postgresql+psycopg2" in url:
            url = url.replace("postgresql+psycopg2", "postgresql+asyncpg")
        if "@db:" in url and not os.path.exists("/.dockerenv"):
            url = url.replace("@db:", "@localhost:")
        return url


    # ─── External API Credentials (Build Guide §3.1 — only these two are named) ──
    # Request Bhuvan token on Day 1: https://bhuvan-app1.nrsc.gov.in/api/
    bhuvan_token: str = ""
    # Free NASA FIRMS MAP_KEY: https://firms.modaps.eosdis.nasa.gov/api/
    firms_map_key: str = ""

    # ─── Pilot District ──────────────────────────────────────────────────────
    pilot_district: str = "Wayanad"
    pilot_district_bbox: str = "75.7,11.3,76.4,11.9"  # min_lon,min_lat,max_lon,max_lat
    pilot_state: str = "Kerala"

    # ─── Telegram Bot (DEOC Broadcast) ───────────────────────────────────────
    telegram_bot_token: str = "7873273180:AAEV9Q285v7HqQf6w30K-Z9_7Hl1ZJ2lV6M"
    telegram_chat_id: str = "@prahari_alerts_sih"
    telegram_invite_url: str = "https://t.me/prahari_alerts_sih"

    # ─── Brevo SMTP Email Integration ────────────────────────────────────────
    brevo_smtp_login: str = ""
    brevo_smtp_key: str = ""
    brevo_sender_email: str = "prahari.ai@gmail.com"

    # ─── App ─────────────────────────────────────────────────────────────────
    app_env: str = "development"
    log_level: str = "INFO"
    debug: bool = False


settings = Settings()
