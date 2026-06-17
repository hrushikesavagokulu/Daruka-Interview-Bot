"""Add questions and answers tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2025-01-02 00:00:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. questions ──────────────────────────────────────────────────────────
    op.create_table(
        "questions",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "session_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("index", sa.Integer(), nullable=False),
        sa.Column(
            "type",
            sa.Enum("verbal", "coding", name="question_type_enum"),
            server_default="verbal",
            nullable=False,
        ),
        sa.Column("topic", sa.String(150), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column(
            "difficulty",
            sa.Enum("easy", "medium", "hard", name="question_difficulty_enum"),
            server_default="medium",
            nullable=False,
        ),
        sa.Column(
            "is_followup",
            sa.Boolean(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_sessions.id"],
            name="fk_questions_session_id",
            ondelete="CASCADE",
        ),
        sa.Index("ix_questions_session_id", "session_id"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # ── 2. answers ────────────────────────────────────────────────────────────
    op.create_table(
        "answers",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "question_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column(
            "session_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("technical_score", sa.Numeric(4, 1), nullable=True),
        sa.Column("communication_score", sa.Numeric(4, 1), nullable=True),
        sa.Column("depth_score", sa.Numeric(4, 1), nullable=True),
        sa.Column("overall_score", sa.Numeric(4, 1), nullable=True),
        sa.Column("evaluation", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", name="uq_answers_question_id"),
        sa.ForeignKeyConstraint(
            ["question_id"],
            ["questions.id"],
            name="fk_answers_question_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_sessions.id"],
            name="fk_answers_session_id",
            ondelete="CASCADE",
        ),
        sa.Index("ix_answers_session_id", "session_id"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )


def downgrade() -> None:
    op.drop_table("answers")
    op.drop_table("questions")
    sa.Enum(name="question_difficulty_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="question_type_enum").drop(op.get_bind(), checkfirst=True)
