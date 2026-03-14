"""Redis-backed sliding window rate limiter."""

import os
import time
import logging
import redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

TIER_LIMITS: dict[str, int] = {
    "free": 10,
    "solo": 60,
    "team": 300,
    "enterprise": 1000,
    "admin": 10000,
}


class RateLimiter:
    """Redis sliding window rate limiter per user + tier."""

    def __init__(self) -> None:
        try:
            self._redis = redis.from_url(REDIS_URL)
        except Exception:
            self._redis = None
            logger.warning("Redis not available for rate limiting")

    def check(self, user_id: str, tier: str = "free") -> tuple[bool, int]:
        """Check if request is allowed. Returns (allowed, remaining)."""
        if not self._redis:
            return True, 999

        limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        window_key = f"rate:{user_id}:{int(time.time()) // 60}"

        try:
            current = self._redis.incr(window_key)
            if current == 1:
                self._redis.expire(window_key, 120)

            remaining = max(0, limit - current)
            return current <= limit, remaining
        except Exception as error:
            logger.error(f"Rate limiter error: {error}")
            return True, 999


rate_limiter = RateLimiter()
