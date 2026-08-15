"""
PRAHARI-AI — Alembic Migration Environment
============================================
Phase 1 (Build Guide §4 / Playbook §4).

Wired to the PRAHARI-AI ORM models so `alembic revision --autogenerate`
detects all table changes from app.db.models automatically.

The DATABASE_URL env var uses asyncpg for the FastAPI app, but Alembic
runs migrations synchronously via psycopg2 (the standard sync driver).
We strip the async prefix here so Alembic gets a compatible URL.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ── Make app package importable from the backend/ root ────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ── Import all models so Alembic sees them for autogenerate ───────────────────
from app.db.session import Base          # noqa: F401 — Base must be imported
import app.db.models                     # noqa: F401 — registers all ORM tables

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# Wire to PRAHARI-AI ORM metadata for autogenerate support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def _get_sync_url() -> str:
    """
    Alembic uses a synchronous SQLAlchemy driver (psycopg2).
    The app's DATABASE_URL uses asyncpg — strip the +asyncpg dialect suffix
    so Alembic gets a compatible URL.
    Also falls back to the alembic.ini sqlalchemy.url if env var not set.
    """
    db_url = os.environ.get("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
    # Convert asyncpg URL to psycopg2 URL for Alembic
    db_url = db_url.replace("postgresql+asyncpg", "postgresql+psycopg2")
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    return db_url


def run_migrations_offline() -> None:
    """Run migrations in offline mode (no live DB connection required).
    Emits SQL to stdout — useful for reviewing changes before applying.
    """
    url = _get_sync_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Include PostGIS server_default columns in autogenerate comparison
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode — connects to the live database."""
    url = _get_sync_url()
    # Override sqlalchemy.url in config so engine_from_config uses our URL
    config.set_main_option("sqlalchemy.url", url)

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
