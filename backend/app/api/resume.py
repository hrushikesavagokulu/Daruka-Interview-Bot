import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.db.database import get_session_factory
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.services.resume_service import parse_resume_background

router = APIRouter()
UPLOAD_DIR = "/app/uploads"

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a list of all resumes uploaded by the currently logged-in user.
    """
    stmt = select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    result = await db.execute(stmt)
    resumes = result.scalars().all()
    return resumes

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a new PDF resume, saves it to disk, and schedules background parsing.
    """
    # Verify file is a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files are supported."
        )

    # Ensure uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate a unique path to avoid name collisions
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    saved_file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Read and save the file contents
    try:
        contents = await file.read()
        with open(saved_file_path, "wb") as f:
            f.write(contents)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file to disk: {str(err)}"
        )

    # Create new Resume database entry
    new_resume = Resume(
        user_id=current_user.id,
        name=file.filename,
        file_path=saved_file_path,
        parse_status="pending",
        parsed_data=None
    )
    db.add(new_resume)
    await db.commit()
    await db.refresh(new_resume)

    # Enqueue the background parser
    session_factory = get_session_factory()
    background_tasks.add_task(
        parse_resume_background,
        resume_id=new_resume.id,
        file_path=saved_file_path,
        user_id=current_user.id,
        session_factory=session_factory
    )

    return new_resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes the specified resume from both the database and the storage directory.
    """
    stmt = select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    result = await db.execute(stmt)
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or not owned by the current user."
        )

    # Remove the file from the filesystem if it exists
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception as err:
            print(f"Warning: Failed to delete file {resume.file_path} from disk: {err}")

    # Remove the resume from the database
    await db.delete(resume)
    await db.commit()
