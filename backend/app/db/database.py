"""
Daruka Interview Bot — SQLAlchemy Async DB Layer

Design decisions:
  - Base is a plain DeclarativeBase with NO engine created at import time.
    This lets Alembic's env.py safely import Base + all models without
    needing DATABASE_URL available at module load.
  - Engine and session factory are created lazily via lru_cache so that
    settings are only read when the first DB call is made (i.e. at runtime,
    not at import time in tests or alembic).
"""
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase


# ── Declarative Base ─────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """All ORM models inherit from this."""
    pass


# ── Lazy engine / session factory ────────────────────────────────────────────
@lru_cache(maxsize=1)
def get_engine() -> AsyncEngine:
    """Create (once) the async SQLAlchemy engine from settings."""
    from app.core.config import settings  # late import avoids circular / early load

    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=False,      # disabled — aiomysql ping() is incompatible; pool_recycle handles stale conns
        pool_recycle=3600,        # recycle connections every hour
        pool_size=10,
        max_overflow=20,
    )


@lru_cache(maxsize=1)
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Create (once) the async session factory."""
    return async_sessionmaker(
        get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )
