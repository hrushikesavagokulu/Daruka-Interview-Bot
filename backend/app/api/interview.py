from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.interview import InterviewSession
from app.schemas.interview import SessionStartRequest, SessionStartResponse

router = APIRouter()

@router.post("/session/start", response_model=SessionStartResponse, status_code=status.HTTP_201_CREATED)
async def start_interview_session(
    payload: SessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates a new interview session and registers it as 'active'.
    Validates that the selected resume exists and is owned by the candidate.
    """
    # 1. Verify target resume ownership
    stmt = select(Resume).where(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
    result = await db.execute(stmt)
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The selected resume does not exist or is not owned by you. Please upload a resume first."
        )

    # 2. Instantiate and persist session row
    session = InterviewSession(
        user_id=current_user.id,
        resume_id=payload.resume_id,
        role=payload.role,
        experience=payload.experience,
        status="active"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {"session_id": session.id}
