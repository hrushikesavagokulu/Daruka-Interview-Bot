from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, CandidateProfile
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter()

@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the current candidate's profile.
    Autocreates a default empty profile if none is currently present.
    """
    stmt = select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        # Create default empty profile
        profile = CandidateProfile(
            user_id=current_user.id,
            skills=[]
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile

@router.put("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the current candidate's profile details.
    """
    stmt = select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    # Apply updates
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile
