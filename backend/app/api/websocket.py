"""
Daruka Interview Bot — WebSocket Interview Endpoint (Phase 9)

Route: ws://host/ws/interview/{session_id}?token={jwt}

Protocol:
  Server → Client messages:
    {type: "question",    q_type, topic, text, difficulty, is_followup, index, total}
    {type: "pong"}
    {type: "transcript",  text}        ← audio stub (real STT in Phase 10)
    {type: "evaluation",  technical, communication, depth, overall, feedback}
    {type: "interview_end", summary: {...}}
    {type: "error",       message}

  Client → Server messages:
    {type: "ping"}
    {type: "answer",  text: "..."}     ← typed/transcribed answer
    {type: "audio",   data: "..."}     ← raw audio bytes (stubbed this phase)
"""
from __future__ import annotations

import logging
from datetime import timedelta

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.security import verify_token
from app.db.database import get_session_factory
from app.models.interview import InterviewSession
from app.models.question import Question
from app.models.user import User
from app.services.interview_service import (
    InterviewState,
    TARGET_QUESTIONS,
    evaluate_answer,
    generate_next_question,
)
from app.websocket.manager import manager

logger = logging.getLogger("app.ws")

router = APIRouter()

# ─── Close codes ──────────────────────────────────────────────────────────────
WS_CLOSE_UNAUTHORIZED = 4001
WS_CLOSE_NOT_FOUND    = 4004
WS_CLOSE_BAD_REQUEST  = 4000


# ─── Auth helper ──────────────────────────────────────────────────────────────

async def _authenticate(token: str | None) -> str | None:
    """Return email from JWT or None if invalid."""
    if not token:
        return None
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        return None
    return payload.get("sub")


# ─── Main WebSocket endpoint ──────────────────────────────────────────────────

@router.websocket("/interview/{session_id}")
async def interview_ws(websocket: WebSocket, session_id: int) -> None:
    """
    Adaptive AI interview WebSocket.
    Authenticates via ?token= query param, then drives the full interview loop.
    """
    token = websocket.query_params.get("token")
    email = await _authenticate(token)

    if not email:
        await websocket.close(code=WS_CLOSE_UNAUTHORIZED, reason="Invalid or missing token")
        return

    # Accept connection first so we can send error messages if needed
    await manager.connect(session_id, websocket)

    session_factory = get_session_factory()

    try:
        async with session_factory() as db:
            # ── Load session + resume ─────────────────────────────────────────
            stmt = (
                select(InterviewSession)
                .where(InterviewSession.id == session_id)
                .options(selectinload(InterviewSession.resume))
                .options(selectinload(InterviewSession.user))
            )
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()

            if not session:
                await manager.send_json(session_id, {"type": "error", "message": "Session not found"})
                await websocket.close(code=WS_CLOSE_NOT_FOUND, reason="Session not found")
                return

            if session.user.email != email:
                await manager.send_json(session_id, {"type": "error", "message": "Unauthorized"})
                await websocket.close(code=WS_CLOSE_UNAUTHORIZED, reason="Not your session")
                return

            if session.status != "active":
                await manager.send_json(session_id, {"type": "error", "message": f"Session is {session.status}"})
                await websocket.close(code=WS_CLOSE_BAD_REQUEST, reason="Session not active")
                return

            # ── Parse resume data ─────────────────────────────────────────────
            parsed = session.resume.parsed_data or {}
            resume_skills   = parsed.get("skills", [])
            resume_summary  = parsed.get("summary", "")

            # ── Initialize InterviewState ─────────────────────────────────────
            state = InterviewState(
                session_id=session_id,
                role=session.role,
                experience=session.experience,
                resume_summary=resume_summary,
                resume_skills=resume_skills,
            )
            manager.set_state(session_id, state)

            # ── Send first question ───────────────────────────────────────────
            await manager.send_json(session_id, {"type": "status", "message": "Generating your first question..."})
            first_q = await generate_next_question(state, db)
            await manager.send_json(session_id, first_q)

        # ── Message loop ─────────────────────────────────────────────────────
        while True:
            try:
                data = await websocket.receive_json()
            except WebSocketDisconnect:
                logger.info("[WS] session=%d client disconnected", session_id)
                break

            msg_type = data.get("type", "")

            # ── Ping / keep-alive ─────────────────────────────────────────────
            if msg_type == "ping":
                await manager.send_json(session_id, {"type": "pong"})
                continue

            # ── Audio stub (real Whisper in Phase 10) ─────────────────────────
            if msg_type == "audio":
                await manager.send_json(session_id, {
                    "type": "transcript",
                    "text": "[stub — Whisper STT integration coming in Phase 10]",
                })
                continue

            # ── Candidate text answer ─────────────────────────────────────────
            if msg_type == "answer":
                answer_text = str(data.get("text", "")).strip()
                if not answer_text:
                    await manager.send_json(session_id, {"type": "error", "message": "Empty answer received"})
                    continue

                current_state = manager.get_state(session_id)
                if not current_state:
                    await manager.send_json(session_id, {"type": "error", "message": "Session state lost — reconnect"})
                    break

                async with session_factory() as db:
                    # Load the current question from DB
                    if current_state.current_question_db_id is None:
                        await manager.send_json(session_id, {"type": "error", "message": "No active question"})
                        continue

                    q_stmt = select(Question).where(Question.id == current_state.current_question_db_id)
                    q_result = await db.execute(q_stmt)
                    current_question = q_result.scalar_one_or_none()

                    if not current_question:
                        await manager.send_json(session_id, {"type": "error", "message": "Question not found in DB"})
                        continue

                    # Evaluate the answer
                    eval_result = await evaluate_answer(
                        state=current_state,
                        question=current_question,
                        answer_text=answer_text,
                        db=db,
                    )

                    # Send evaluation back to client
                    await manager.send_json(session_id, {
                        "type": "evaluation",
                        "technical":     eval_result["technical"],
                        "communication": eval_result["communication"],
                        "depth":         eval_result["depth"],
                        "overall":       eval_result["overall"],
                        "feedback":      eval_result["feedback"],
                    })

                    decision = eval_result["decision"]
                    logger.info("[WS] session=%d decision=%s", session_id, decision)

                    # ── Act on decision ───────────────────────────────────────
                    if decision == "finish":
                        current_state.finished = True
                        # Mark session as completed in DB
                        sess_stmt = select(InterviewSession).where(InterviewSession.id == session_id)
                        sess_res = await db.execute(sess_stmt)
                        sess_obj = sess_res.scalar_one_or_none()
                        if sess_obj:
                            from sqlalchemy.sql import func as sqlfunc
                            sess_obj.status = "completed"
                            await db.commit()

                        await manager.send_json(session_id, {
                            "type": "interview_end",
                            "message": "Interview complete! Your detailed feedback report is being generated.",
                            "summary": {
                                "total_questions": current_state.current_question_index,
                                "covered_topics":  current_state.covered_topics,
                                "strong_topics":   current_state.strong_topics,
                                "weak_topics":     current_state.weak_topics,
                                "final_difficulty": current_state.difficulty,
                            },
                        })
                        break

                    elif decision == "followup":
                        await manager.send_json(session_id, {"type": "status", "message": "Generating follow-up question..."})
                        next_q = await generate_next_question(
                            current_state,
                            db,
                            force_followup=True,
                            last_answer=answer_text,
                            last_eval=eval_result,
                        )
                        await manager.send_json(session_id, next_q)

                    elif decision == "coding":
                        await manager.send_json(session_id, {"type": "status", "message": "Preparing coding challenge..."})
                        coding_q = await generate_next_question(current_state, db, force_followup=False)
                        # Ensure it's actually a coding question
                        if coding_q.get("q_type") != "coding":
                            coding_q["q_type"] = "coding"
                        await manager.send_json(session_id, coding_q)

                    else:  # "next"
                        await manager.send_json(session_id, {"type": "status", "message": "Moving to next question..."})
                        next_q = await generate_next_question(current_state, db)
                        await manager.send_json(session_id, next_q)

                continue  # end of "answer" handler

            # ── Unknown message type ──────────────────────────────────────────
            logger.debug("[WS] session=%d unknown message type: %s", session_id, msg_type)
            await manager.send_json(session_id, {
                "type": "error",
                "message": f"Unknown message type: {msg_type!r}",
            })

    except WebSocketDisconnect:
        logger.info("[WS] session=%d disconnected during setup", session_id)
    except Exception as exc:
        logger.exception("[WS] session=%d unexpected error: %s", session_id, exc)
        try:
            await manager.send_json(session_id, {"type": "error", "message": "Internal server error"})
        except Exception:
            pass
    finally:
        manager.disconnect(session_id)
