"""
Daruka Interview Bot — Async Redis Client

Used for:
  - OTP / verification code storage (TTL-based)
  - Session token blacklist
  - Interview state caching
"""
from functools import lru_cache

import redis.asyncio as aioredis


@lru_cache(maxsize=1)
def get_redis() -> aioredis.Redis:
    """Return a shared async Redis client (lazily created)."""
    from app.core.config import settings

    return aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
