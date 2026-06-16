"""
ORM Model — reports table
Spec: README Section 5.5
"""
from sqlalchemy import JSON, ForeignKey, Numeric, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (UniqueConstraint("session_id"),)

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    session_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("interview_sessions.id"),
        nullable=False,
        unique=True,
    )

    # Score metrics — DECIMAL(5,2) = max 999.99, but 0.00–100.00 is the range
    technical_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    programming_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    role_gap_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    communication_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    overall_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)

    # AI-generated content (stored as JSON arrays of strings)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tips: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Full Q&A transcript — [{q: "...", a: "..."}, ...]
    transcript: Mapped[list | None] = mapped_column(JSON, nullable=True)

    pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    generated_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    # Relationship
    session: Mapped["InterviewSession"] = relationship(  # type: ignore[name-defined]
        "InterviewSession", back_populates="report"
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id} session_id={self.session_id} overall={self.overall_pct}>"
