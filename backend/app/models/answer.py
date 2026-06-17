"""
ORM Model — answers table
Each row stores a candidate's answer to a single question, plus AI evaluation scores.
"""
from sqlalchemy import ForeignKey, JSON, Numeric, Text, TIMESTAMP
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    question_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # one answer per question
        index=True,
    )
    session_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    text: Mapped[str] = mapped_column(
        Text, nullable=False, comment="Raw candidate answer text (from STT or manual input)"
    )

    # AI evaluation scores (0-10 scale stored as DECIMAL)
    technical_score: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    communication_score: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    depth_score: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)

    # Full raw evaluation JSON returned by Ollama
    evaluation: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    # Relationships
    question: Mapped["Question"] = relationship(  # type: ignore[name-defined]
        "Question", back_populates="answer"
    )
    session: Mapped["InterviewSession"] = relationship(  # type: ignore[name-defined]
        "InterviewSession", back_populates="answers"
    )

    def __repr__(self) -> str:
        return (
            f"<Answer id={self.id} question_id={self.question_id} "
            f"overall={self.overall_score}>"
        )
