"""
Alembic runtime environment for Daruka Interview Bot.

Key design choices:
  - Uses async engine (async_engine_from_config) to match the aiomysql driver.
  - DATABASE_URL is read from the OS environment, NOT from alembic.ini,
    so credentials never live in source control.
  - All ORM models are imported here (via app.models) so autogenerate
    sees the full Base.metadata.
"""
from __future__ import annotations

import asyncio
import os
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.pool import NullPool

from alembic import context

# ── Alembic Config object ─────────────────────────────────────────────────────
config = context.config

# Set up Python logging from alembic.ini [loggers] section
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Override DB URL from environment ─────────────────────────────────────────
# Reads DATABASE_URL set by docker-compose; falls back to alembic.ini placeholder
_db_url = os.environ.get("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
config.set_main_option("sqlalchemy.url", _db_url)

# ── Import Base + all models (safe — no engine created at import time) ────────
from app.db.database import Base   # noqa: E402
import app.models                  # noqa: E402, F401 — registers all tables on Base.metadata

target_metadata = Base.metadata


# ── Offline mode (generate SQL without connecting) ───────────────────────────
def run_migrations_offline() -> None:
    """Emit SQL to stdout; useful for review before applying."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (connect and apply) ──────────────────────────────────────────
def do_run_migrations(connection) -> None:  # type: ignore[type-arg]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,            # detect column type changes on autogenerate
        compare_server_default=True,  # detect server_default changes
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine and run migrations inside run_sync."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=NullPool,           # no connection pooling for migration runs
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ── Entry point ───────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
