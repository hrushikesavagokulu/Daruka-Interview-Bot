"""Initial schema — 5 core tables

Creates: users, candidate_profiles, resumes, interview_sessions, reports
with all foreign keys, ENUM types, JSON columns, and ON DELETE CASCADE
as specified in README Section 5.

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("candidate", "admin", name="user_role"),
            nullable=False,
            server_default="candidate",
        ),
        sa.Column(
            "is_active",
            mysql.TINYINT(1),
            server_default=sa.text("1"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # ── 2. candidate_profiles ────────────────────────────────────────────────
    op.create_table(
        "candidate_profiles",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("mobile", sa.String(20), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("skills", sa.JSON(), nullable=True),
        sa.Column(
            "years_experience",
            mysql.TINYINT(unsigned=True),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("target_role", sa.String(100), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("github_url", sa.String(500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_candidate_profiles_user_id"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_candidate_profiles_user_id",
            ondelete="CASCADE",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # ── 3. resumes ───────────────────────────────────────────────────────────
    op.create_table(
        "resumes",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("parsed_data", sa.JSON(), nullable=True),
        sa.Column(
            "parse_status",
            sa.Enum("pending", "done", "failed", name="parse_status_enum"),
            server_default="pending",
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
            ["user_id"],
            ["users.id"],
            name="fk_resumes_user_id",
            ondelete="CASCADE",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # ── 4. interview_sessions ────────────────────────────────────────────────
    op.create_table(
        "interview_sessions",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column(
            "resume_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("role", sa.String(100), nullable=False),
        sa.Column("experience", sa.String(50), nullable=False),
        sa.Column(
            "status",
            sa.Enum("active", "completed", "expired", name="session_status_enum"),
            server_default="active",
            nullable=False,
        ),
        sa.Column(
            "started_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("completed_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_interview_sessions_user_id",
        ),
        sa.ForeignKeyConstraint(
            ["resume_id"],
            ["resumes.id"],
            name="fk_interview_sessions_resume_id",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # ── 5. reports ───────────────────────────────────────────────────────────
    op.create_table(
        "reports",
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
        sa.Column("technical_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("programming_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("role_gap_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("communication_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("overall_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("strengths", sa.JSON(), nullable=True),
        sa.Column("weaknesses", sa.JSON(), nullable=True),
        sa.Column("tips", sa.JSON(), nullable=True),
        sa.Column("transcript", sa.JSON(), nullable=True),
        sa.Column("pdf_path", sa.String(500), nullable=True),
        sa.Column(
            "generated_at",
            sa.TIMESTAMP(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", name="uq_reports_session_id"),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_sessions.id"],
            name="fk_reports_session_id",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("reports")
    op.drop_table("interview_sessions")
    op.drop_table("resumes")
    op.drop_table("candidate_profiles")
    op.drop_table("users")

    # Clean up named ENUM types (MySQL ignores this but good practice)
    sa.Enum(name="session_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="parse_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
