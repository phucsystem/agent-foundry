"""Redis-backed session memory with rolling conversation window."""

import json
import logging
import os

import redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
SESSION_TTL = 86400  # 24 hours in seconds
MAX_TURNS = 20


class SessionMemory:
    """Stores conversation turns per session in Redis with a rolling window."""

    def __init__(self, redis_url: str = REDIS_URL) -> None:
        self._redis = redis.from_url(redis_url, decode_responses=True)

    def _key(self, session_id: str) -> str:
        return f"session:{session_id}:turns"

    def add_turn(self, session_id: str, role: str, content: str) -> None:
        """Append a conversation turn; trims to MAX_TURNS and refreshes TTL."""
        key = self._key(session_id)
        turn = json.dumps({"role": role, "content": content})
        self._redis.rpush(key, turn)
        self._redis.ltrim(key, -MAX_TURNS, -1)
        self._redis.expire(key, SESSION_TTL)
        logger.debug("Added turn role=%s to session=%s", role, session_id)

    def get_context(self, session_id: str) -> list[dict[str, str]]:
        """Return all stored turns for the session, oldest first."""
        key = self._key(session_id)
        raw_turns = self._redis.lrange(key, 0, -1)
        return [json.loads(turn) for turn in raw_turns]

    def clear(self, session_id: str) -> None:
        """Delete all turns for a session."""
        self._redis.delete(self._key(session_id))
        logger.info("Cleared session=%s", session_id)

    def turn_count(self, session_id: str) -> int:
        """Return number of stored turns for a session."""
        return self._redis.llen(self._key(session_id))


session_memory = SessionMemory()
