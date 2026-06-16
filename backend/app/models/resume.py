"""
ORM Model — resumes table
Spec: README Section 5.3
"""
from sqlalchemy import JSON, ForeignKey, String, TIMESTAMP, Enum as SAEnum
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    parsed_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    parse_status: Mapped[str] = mapped_column(
        SAEnum("pending", "done", "failed", name="parse_status_enum"),
        server_default="pending",
        nullable=False,
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resumes")  # type: ignore[name-defined]
    interview_sessions: Mapped[list["InterviewSession"]] = relationship(  # type: ignore[name-defined]
        "InterviewSession",
        back_populates="resume",
    )

    def __repr__(self) -> str:
        return f"<Resume id={self.id} name={self.name!r} status={self.parse_status!r}>"
