"""
ORM Model — questions table
Each row is a single interview question generated during a session.
"""
from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True), primary_key=True, autoincrement=True
    )
    session_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    index: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="Zero-based question order within the session"
    )
    type: Mapped[str] = mapped_column(
        SAEnum("verbal", "coding", name="question_type_enum"),
        nullable=False,
        server_default="verbal",
    )
    topic: Mapped[str] = mapped_column(
        String(150), nullable=False, comment="Topic label, e.g. 'Python', 'System Design'"
    )
    text: Mapped[str] = mapped_column(
        Text, nullable=False, comment="Full question text shown to the candidate"
    )
    difficulty: Mapped[str] = mapped_column(
        SAEnum("easy", "medium", "hard", name="question_difficulty_enum"),
        nullable=False,
        server_default="medium",
    )
    is_followup: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="0"
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    # Relationships
    session: Mapped["InterviewSession"] = relationship(  # type: ignore[name-defined]
        "InterviewSession", back_populates="questions"
    )
    answer: Mapped["Answer"] = relationship(  # type: ignore[name-defined]
        "Answer", back_populates="question", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<Question id={self.id} session={self.session_id} "
            f"index={self.index} type={self.type!r} difficulty={self.difficulty!r}>"
        )
