"""
PRAHARI-AI — Database Session & Engine
=======================================
Provides async SQLAlchemy engine and session factory for use across the app.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Async engine — used by FastAPI dependency injection and lifecycle hooks
engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,  # validate connections before use
)

# Session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for all ORM models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session or None if DB is offline,
    ensuring zero-latency fallback for local presentations.
    """
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
            finally:
                await session.close()
    except Exception as e:
        # DB offline — yield None safely
        yield None
