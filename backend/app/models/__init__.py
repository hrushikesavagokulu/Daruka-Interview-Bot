# backend/app/models/__init__.py
"""
Import all ORM models here so that:
  1. Alembic's env.py sees the full Base.metadata.
  2. SQLAlchemy relationship back-references resolve correctly.
"""
from app.models.user import User, CandidateProfile       # noqa: F401
from app.models.resume import Resume                      # noqa: F401
from app.models.interview import InterviewSession         # noqa: F401
from app.models.report import Report                      # noqa: F401

__all__ = [
    "User",
    "CandidateProfile",
    "Resume",
    "InterviewSession",
    "Report",
]
