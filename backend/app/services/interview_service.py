"""
Daruka Interview Bot — Adaptive AI Interview Service (Phase 9)

Responsibilities:
  - Maintain per-session InterviewState (in-memory, transferred via WS manager)
  - Generate one question at a time via Ollama (never upfront, always adaptive)
  - Evaluate candidate answers and return a structured decision
  - Adapt difficulty based on running scores
  - Enforce exactly one coding question per session
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Literal

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.answer import Answer
from app.models.question import Question

logger = logging.getLogger("app.interview_service")

# ─── Constants ────────────────────────────────────────────────────────────────
TARGET_QUESTIONS = 8          # total questions per interview (excl. follow-ups)
MAX_FOLLOWUPS = 2             # consecutive follow-ups allowed before moving on
OLLAMA_TIMEOUT = 45.0         # seconds — Ollama can be slow on first call

# Score thresholds for difficulty adaptation
STRONG_THRESHOLD = 7.5        # overall >= this → candidate is strong
WEAK_THRESHOLD   = 4.5        # overall <= this → candidate is struggling

# Fallback questions used when Ollama is unavailable
_FALLBACK_VERBAL = "Tell me about a challenging technical problem you solved recently and how you approached it."
_FALLBACK_CODING = "Write a function that checks whether a given string is a palindrome."


# ─── InterviewState ───────────────────────────────────────────────────────────

@dataclass
class InterviewState:
    """
    In-memory state for a single active interview session.
    Stored in ConnectionManager.states keyed by session_id.
    """
    session_id: int
    role: str
    experience: str
    resume_summary: str
    resume_skills: list[str]

    # Progress tracking
    current_question_index: int = 0       # 0-based, counts non-follow-up questions
    followup_count: int = 0               # consecutive follow-ups on current topic
    coding_done: bool = False             # True once coding question has been sent
    finished: bool = False

    # Conversation history for Ollama context
    # Each entry: {"role": "interviewer"|"candidate", "text": str, "topic": str}
    history: list[dict] = field(default_factory=list)

    # Topic management
    covered_topics: list[str] = field(default_factory=list)
    weak_topics: list[str]  = field(default_factory=list)
    strong_topics: list[str] = field(default_factory=list)

    # Adaptive difficulty
    difficulty: Literal["easy", "medium", "hard"] = "medium"

    # DB ids of current question (set after each generation)
    current_question_db_id: int | None = None

    @property
    def total_answered(self) -> int:
        return len([h for h in self.history if h["role"] == "candidate"])

    @property
    def is_complete(self) -> bool:
        return self.finished or (
            self.current_question_index >= TARGET_QUESTIONS and self.coding_done
        )


# ─── Ollama Helper ────────────────────────────────────────────────────────────

async def _call_ollama(prompt: str) -> dict | None:
    """
    POST to Ollama /api/generate with JSON format enforcement.
    Returns parsed dict or None on failure.
    """
    url = f"{settings.OLLAMA_URL}/api/generate"
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(
                url,
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.7, "num_predict": 512},
                },
            )
            resp.raise_for_status()
            raw = resp.json().get("response", "").strip()
            # Strip Qwen3 thinking tags if present
            if "<think>" in raw:
                end = raw.rfind("</think>")
                if end != -1:
                    raw = raw[end + 8:].strip()
            # Parse JSON
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                start = raw.find("{")
                end = raw.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(raw[start : end + 1])
                logger.warning("[InterviewService] Could not parse Ollama JSON: %s", raw[:200])
                return None
    except Exception as exc:
        logger.warning("[InterviewService] Ollama call failed: %s", exc)
        return None


# ─── Question Generation ──────────────────────────────────────────────────────

def _build_question_prompt(state: InterviewState, force_coding: bool = False) -> str:
    history_text = ""
    for h in state.history[-6:]:  # last 6 turns for context
        prefix = "Interviewer" if h["role"] == "interviewer" else "Candidate"
        history_text += f"{prefix}: {h['text']}\n"

    covered = ", ".join(state.covered_topics[-8:]) if state.covered_topics else "none yet"
    weak    = ", ".join(state.weak_topics[-4:])    if state.weak_topics    else "none"
    strong  = ", ".join(state.strong_topics[-4:])  if state.strong_topics  else "none"

    type_instruction = (
        'You MUST set "type" to "coding" and provide a concrete algorithmic/coding problem as the question.'
        if force_coding
        else (
            'Set "type" to "verbal" for a conceptual/behavioural question. '
            'Do NOT generate a coding question (it will come later).'
        )
    )

    return f"""You are a senior technical interviewer conducting a real interview.

Candidate Profile:
- Target Role: {state.role}
- Experience Level: {state.experience}
- Skills: {", ".join(state.resume_skills[:15])}
- Background: {state.resume_summary[:300]}

Interview Progress:
- Questions asked so far: {state.current_question_index}/{TARGET_QUESTIONS}
- Current difficulty: {state.difficulty}
- Topics already covered: {covered}
- Candidate's weak areas: {weak}
- Candidate's strong areas: {strong}

Recent conversation:
{history_text if history_text else "(no history yet)"}

Instructions:
1. Generate ONE new interview question based on the candidate's profile.
2. {type_instruction}
3. Choose a topic NOT already covered unless it's a follow-up.
4. Match the difficulty to "{state.difficulty}".
5. If the candidate showed weakness in a topic, probe it gently.
6. Keep the question concise and professional.

Return STRICT JSON (no extra text, no markdown):
{{
  "type": "verbal" | "coding",
  "topic": "<short topic label like 'Python async', 'System Design', 'Data Structures'>",
  "text": "<the full interview question>",
  "difficulty": "easy" | "medium" | "hard",
  "is_followup": false
}}"""


def _build_followup_prompt(state: InterviewState, last_answer: str, evaluation: dict) -> str:
    last_q = state.history[-2]["text"] if len(state.history) >= 2 else ""
    return f"""You are a senior technical interviewer.

The candidate just answered this question:
"{last_q}"

Their answer:
"{last_answer}"

Evaluation scores: technical={evaluation.get('technical', 5)}/10, depth={evaluation.get('depth', 5)}/10

Instructions:
- Generate ONE targeted follow-up question to probe deeper into their answer.
- Keep it related to the same topic but push for more detail or challenge a specific point.
- Be concise and professional.

Return STRICT JSON:
{{
  "type": "verbal",
  "topic": "<same topic as previous question>",
  "text": "<follow-up question>",
  "difficulty": "{state.difficulty}",
  "is_followup": true
}}"""


async def generate_next_question(
    state: InterviewState,
    db: AsyncSession,
    force_followup: bool = False,
    last_answer: str = "",
    last_eval: dict | None = None,
) -> dict:
    """
    Generate the next question, persist to DB, update state.
    Returns the question dict {type, topic, text, difficulty, is_followup, db_id, index, total}.
    """
    # Decide if this should be a coding question
    should_code = (
        not state.coding_done
        and not force_followup
        and state.current_question_index >= TARGET_QUESTIONS - 2
    )

    # Build prompt
    if force_followup and last_eval:
        prompt = _build_followup_prompt(state, last_answer, last_eval)
    else:
        prompt = _build_question_prompt(state, force_coding=should_code)

    # Call Ollama
    result = await _call_ollama(prompt)

    # Fallback if Ollama fails
    if not result or "text" not in result:
        logger.warning("[InterviewService] Using fallback question for session %d", state.session_id)
        if should_code:
            result = {
                "type": "coding",
                "topic": "Algorithms",
                "text": _FALLBACK_CODING,
                "difficulty": state.difficulty,
                "is_followup": False,
            }
        else:
            result = {
                "type": "verbal",
                "topic": "General",
                "text": _FALLBACK_VERBAL,
                "difficulty": state.difficulty,
                "is_followup": force_followup,
            }

    # Normalize fields
    q_type = result.get("type", "verbal")
    q_topic = str(result.get("topic", "General"))[:150]
    q_text = str(result.get("text", _FALLBACK_VERBAL))
    q_diff = result.get("difficulty", state.difficulty)
    q_followup = bool(result.get("is_followup", force_followup))

    if q_type not in ("verbal", "coding"):
        q_type = "verbal"
    if q_diff not in ("easy", "medium", "hard"):
        q_diff = state.difficulty

    # Persist to DB
    question = Question(
        session_id=state.session_id,
        index=state.current_question_index,
        type=q_type,
        topic=q_topic,
        text=q_text,
        difficulty=q_diff,
        is_followup=q_followup,
    )
    db.add(question)
    await db.flush()  # get the ID without committing

    # Update state
    if not q_followup:
        state.current_question_index += 1
        if q_topic not in state.covered_topics:
            state.covered_topics.append(q_topic)
    if q_type == "coding":
        state.coding_done = True

    state.current_question_db_id = question.id
    state.history.append({"role": "interviewer", "text": q_text, "topic": q_topic})

    await db.commit()

    return {
        "type": "question",
        "q_type": q_type,
        "topic": q_topic,
        "text": q_text,
        "difficulty": q_diff,
        "is_followup": q_followup,
        "index": state.current_question_index - (0 if q_followup else 0),
        "total": TARGET_QUESTIONS,
        "db_id": question.id,
    }


# ─── Answer Evaluation ────────────────────────────────────────────────────────

def _build_eval_prompt(state: InterviewState, question_text: str, answer_text: str) -> str:
    return f"""You are a senior technical interviewer evaluating a candidate's answer.

Role being interviewed for: {state.role} ({state.experience} level)
Candidate skills: {", ".join(state.resume_skills[:10])}

Question asked:
"{question_text}"

Candidate's answer:
"{answer_text}"

Evaluate the answer on a scale of 0-10 for each dimension.
Then decide what to do next:
- "followup": the answer needs deeper probing (use if score < {STRONG_THRESHOLD} and topic not exhausted)
- "next": move to the next topic
- "coding": time to give a coding challenge (use when {TARGET_QUESTIONS - 2} verbal questions done and no coding yet)
- "finish": the interview is complete

Consider: questions answered so far = {state.current_question_index}, coding done = {state.coding_done}, followup_count = {state.followup_count}

Return STRICT JSON (no extra text):
{{
  "technical": <0-10>,
  "communication": <0-10>,
  "depth": <0-10>,
  "overall": <0-10>,
  "decision": "followup" | "next" | "coding" | "finish",
  "followup_question": "<optional follow-up question text if decision is followup, else null>",
  "feedback": "<one sentence of private evaluator feedback>"
}}"""


async def evaluate_answer(
    state: InterviewState,
    question: Question,
    answer_text: str,
    db: AsyncSession,
) -> dict:
    """
    Evaluate a candidate's answer via Ollama. Updates state.difficulty, weak/strong topics.
    Persists Answer row to DB.
    Returns evaluation dict with 'decision'.
    """
    prompt = _build_eval_prompt(state, question.text, answer_text)
    result = await _call_ollama(prompt)

    # Fallback evaluation if Ollama fails
    if not result or "overall" not in result:
        logger.warning("[InterviewService] Evaluation fallback for session %d", state.session_id)
        # Default: move to next question
        need_coding = not state.coding_done and state.current_question_index >= TARGET_QUESTIONS - 2
        result = {
            "technical": 5.0, "communication": 5.0, "depth": 5.0, "overall": 5.0,
            "decision": "coding" if need_coding else ("finish" if state.current_question_index >= TARGET_QUESTIONS else "next"),
            "followup_question": None,
            "feedback": "Unable to evaluate — defaulting to next question.",
        }

    # Extract scores
    def _score(key: str) -> float:
        try:
            return max(0.0, min(10.0, float(result.get(key, 5.0))))
        except (TypeError, ValueError):
            return 5.0

    tech   = _score("technical")
    comm   = _score("communication")
    depth  = _score("depth")
    overall= _score("overall")

    # Adapt difficulty
    if overall >= STRONG_THRESHOLD:
        if state.difficulty == "easy":
            state.difficulty = "medium"
        elif state.difficulty == "medium":
            state.difficulty = "hard"
        if question.topic not in state.strong_topics:
            state.strong_topics.append(question.topic)
    elif overall <= WEAK_THRESHOLD:
        if state.difficulty == "hard":
            state.difficulty = "medium"
        elif state.difficulty == "medium":
            state.difficulty = "easy"
        if question.topic not in state.weak_topics:
            state.weak_topics.append(question.topic)

    # Add candidate answer to history
    state.history.append({"role": "candidate", "text": answer_text, "topic": question.topic})

    # Determine decision (override Ollama if state demands it)
    decision = result.get("decision", "next")
    if state.coding_done and decision == "coding":
        decision = "next"
    if state.current_question_index >= TARGET_QUESTIONS and state.coding_done:
        decision = "finish"
    if state.followup_count >= MAX_FOLLOWUPS and decision == "followup":
        decision = "next"
        state.followup_count = 0
    if decision == "followup":
        state.followup_count += 1
    else:
        state.followup_count = 0

    # Persist Answer to DB
    answer_row = Answer(
        question_id=question.id,
        session_id=state.session_id,
        text=answer_text,
        technical_score=tech,
        communication_score=comm,
        depth_score=depth,
        overall_score=overall,
        evaluation=result,
    )
    db.add(answer_row)
    await db.commit()

    return {
        "technical": tech,
        "communication": comm,
        "depth": depth,
        "overall": overall,
        "decision": decision,
        "followup_question": result.get("followup_question"),
        "feedback": result.get("feedback", ""),
    }
