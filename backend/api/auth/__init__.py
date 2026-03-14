"""Auth package — JWT, API keys, dependencies, rate limiting."""

from api.auth.jwt_handler import jwt_handler, JWTHandler
from api.auth.api_key import api_key_manager, APIKeyManager
from api.auth.dependencies import get_current_user, require_role, CurrentUser
from api.auth.rate_limiter import rate_limiter, RateLimiter

__all__ = [
    "jwt_handler",
    "JWTHandler",
    "api_key_manager",
    "APIKeyManager",
    "get_current_user",
    "require_role",
    "CurrentUser",
    "rate_limiter",
    "RateLimiter",
]
