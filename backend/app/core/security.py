"""
Daruka Interview Bot — Security, Hashing, JWT, and OTP Helpers
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
import bcrypt
from jose import jwt, JWTError

from app.core.config import settings
from app.db.redis import get_redis

ALGORITHM = "HS256"


# ─── Password Hashing & Verification ──────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    pw_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a bcrypt hash."""
    pw_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pw_bytes, hashed_bytes)
    except Exception:
        return False


# ─── JWT Tokens (HS256) ────────────────────────────────────────────────────────
def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Generate a JWT access token.
    Default expiry is 30 minutes if not specified.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """
    Decode and verify a JWT.
    Returns the payload dictionary if valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ─── OTP Generator & Redis Cache ──────────────────────────────────────────────
def generate_otp() -> str:
    """Generate a random 6-digit verification code."""
    # Generate random number between 100000 and 999999
    return str(secrets.randbelow(900000) + 100000)


async def store_otp(email: str, otp: str, expire_seconds: int = 600) -> None:
    """Store the OTP in Redis with a specific key and TTL (expiry)."""
    redis_client = get_redis()
    key = f"otp:{email}"
    await redis_client.set(key, otp, ex=expire_seconds)


async def get_otp(email: str) -> str | None:
    """Retrieve the stored OTP for a given email from Redis."""
    redis_client = get_redis()
    key = f"otp:{email}"
    return await redis_client.get(key)


async def delete_otp(email: str) -> None:
    """Remove the OTP for a given email from Redis."""
    redis_client = get_redis()
    key = f"otp:{email}"
    await redis_client.delete(key)
