"""
Daruka Interview Bot — WebSocket Connection Manager

Maintains a registry of active WebSocket connections keyed by session_id.
Also holds the in-memory InterviewState for each active session.
Thread-safe for asyncio (single event loop — no locks needed).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from fastapi import WebSocket

if TYPE_CHECKING:
    from app.services.interview_service import InterviewState

logger = logging.getLogger("app.ws_manager")


class ConnectionManager:
    """
    Singleton WebSocket registry for all active interview sessions.

    Usage:
        manager = ConnectionManager()
        await manager.connect(session_id, websocket)
        await manager.send_json(session_id, {"type": "pong"})
        manager.disconnect(session_id)
    """

    def __init__(self) -> None:
        # session_id → active WebSocket
        self._connections: dict[int, WebSocket] = {}
        # session_id → InterviewState
        self._states: dict[int, "InterviewState"] = {}

    # ── Connection lifecycle ──────────────────────────────────────────────────

    async def connect(self, session_id: int, websocket: WebSocket) -> None:
        """Accept the WS connection and register it."""
        await websocket.accept()
        self._connections[session_id] = websocket
        logger.info("[WS] session=%d connected", session_id)

    def disconnect(self, session_id: int) -> None:
        """Remove connection and state for the given session."""
        self._connections.pop(session_id, None)
        self._states.pop(session_id, None)
        logger.info("[WS] session=%d disconnected", session_id)

    def is_connected(self, session_id: int) -> bool:
        return session_id in self._connections

    # ── Messaging ─────────────────────────────────────────────────────────────

    async def send_json(self, session_id: int, payload: dict) -> None:
        """Send a JSON payload to the specified session's WebSocket."""
        ws = self._connections.get(session_id)
        if ws:
            try:
                await ws.send_json(payload)
            except Exception as exc:
                logger.warning("[WS] send_json failed for session=%d: %s", session_id, exc)
                self.disconnect(session_id)

    async def broadcast_json(self, payload: dict) -> None:
        """Send a payload to ALL connected sessions (rarely used)."""
        for sid in list(self._connections.keys()):
            await self.send_json(sid, payload)

    # ── State management ──────────────────────────────────────────────────────

    def get_state(self, session_id: int) -> "InterviewState | None":
        return self._states.get(session_id)

    def set_state(self, session_id: int, state: "InterviewState") -> None:
        self._states[session_id] = state

    # ── Debug ─────────────────────────────────────────────────────────────────

    @property
    def active_count(self) -> int:
        return len(self._connections)

    @property
    def active_session_ids(self) -> list[int]:
        return list(self._connections.keys())


# Singleton instance — import this everywhere
manager = ConnectionManager()
