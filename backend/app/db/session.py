"""
Daruka Interview Bot — Async DB Session Dependency

Usage in a route:
    from app.db.session import get_db
    from sqlalchemy.ext.asyncio import AsyncSession

    @router.get("/example")
    async def example(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(User))
        ...
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an AsyncSession and guarantees
    commit on success / rollback on exception.
    """
    async_session = get_session_factory()
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
