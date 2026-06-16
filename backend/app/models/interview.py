"""
ORM Model — interview_sessions table
Spec: README Section 5.4
"""
from sqlalchemy import ForeignKey, String, TIMESTAMP, Enum as SAEnum
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    resume_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("resumes.id"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    experience: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("active", "completed", "expired", name="session_status_enum"),
        server_default="active",
        nullable=False,
    )
    started_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )
    completed_at: Mapped[str | None] = mapped_column(TIMESTAMP, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]
        "User", back_populates="interview_sessions"
    )
    resume: Mapped["Resume"] = relationship(  # type: ignore[name-defined]
        "Resume", back_populates="interview_sessions"
    )
    report: Mapped["Report"] = relationship(  # type: ignore[name-defined]
        "Report", back_populates="session", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<InterviewSession id={self.id} role={self.role!r} status={self.status!r}>"
        )
