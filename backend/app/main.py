"""
Daruka Interview Bot — FastAPI Application Entry Point
Phase 1: DB layer wired up; routes will be added in subsequent phases.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: verify DB engine can connect (fast ping, not migrations).
    Shutdown: dispose connection pool cleanly.
    """
    from app.db.database import get_engine
    engine = get_engine()

    # Ping the DB so we fail fast if credentials are wrong
    async with engine.begin() as conn:
        from sqlalchemy import text
        await conn.execute(text("SELECT 1"))

    yield  # ← app runs here

    await engine.dispose()


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Daruka Interview Bot API",
    description="AI-powered mock interview platform — voice, code execution, evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Allow Vite dev server (and any origin for now — lock this down in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Router ───────────────────────────────────────────────────────────────
from app.api.auth import router as auth_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])


# ── Health probe ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe — returns 200 when server + DB are reachable."""
    from app.db.database import get_engine
    from sqlalchemy import text

    async with get_engine().connect() as conn:
        await conn.execute(text("SELECT 1"))

    return {"status": "ok", "service": "daruka-backend", "db": "connected"}
