"""API key generation and validation."""

import hashlib
import secrets
import logging

logger = logging.getLogger(__name__)

API_KEY_PREFIX = "af_"
API_KEY_LENGTH = 32


class APIKeyManager:
    """Generate and validate API keys."""

    def generate(self) -> tuple[str, str]:
        """Generate a new API key. Returns (raw_key, hashed_key)."""
        raw_key = API_KEY_PREFIX + secrets.token_urlsafe(API_KEY_LENGTH)
        hashed = self.hash_key(raw_key)
        return raw_key, hashed

    def hash_key(self, raw_key: str) -> str:
        """Hash an API key for storage."""
        return hashlib.sha256(raw_key.encode()).hexdigest()

    def verify(self, raw_key: str, stored_hash: str) -> bool:
        """Verify a raw key against stored hash."""
        return self.hash_key(raw_key) == stored_hash


api_key_manager = APIKeyManager()
