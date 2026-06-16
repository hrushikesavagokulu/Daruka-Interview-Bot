"""
ORM Models — users + candidate_profiles tables
Spec: README Section 5.1 & 5.2
"""
from sqlalchemy import (
    JSON,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Enum as SAEnum,
)
from sqlalchemy.dialects.mysql import BIGINT, TINYINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        SAEnum("candidate", "admin", name="user_role"),
        nullable=False,
        server_default="candidate",
    )
    is_active: Mapped[int] = mapped_column(TINYINT(1), server_default="1")
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    # Relationships
    profile: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    resumes: Mapped[list["Resume"]] = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    interview_sessions: Mapped[list["InterviewSession"]] = relationship(
        "InterviewSession",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    __table_args__ = (UniqueConstraint("user_id"),)

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    about: Mapped[str | None] = mapped_column(Text, nullable=True)
    skills: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    years_experience: Mapped[int] = mapped_column(
        TINYINT(unsigned=True), server_default="0"
    )
    target_role: Mapped[str | None] = mapped_column(String(100), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<CandidateProfile user_id={self.user_id}>"
