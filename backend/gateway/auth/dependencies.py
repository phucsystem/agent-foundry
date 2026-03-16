"""FastAPI auth dependencies for Lambda gateway."""

import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from gateway.config import settings

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)

MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


class CurrentUser:
    """Authenticated user context."""

    def __init__(self, user_id: str, logto_sub: str = "", email: str = "") -> None:
        self.user_id = user_id
        self.logto_sub = logto_sub
        self.email = email


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Extract and verify user from Logto JWT bearer token."""
    if settings.mock_auth:
        return CurrentUser(user_id=MOCK_USER_ID, logto_sub="mock", email="test@example.com")

    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail={"error": "UNAUTHORIZED", "message": "Authentication required"})

    try:
        from gateway.auth.logto_jwt import logto_verifier
        claims = logto_verifier.verify_access_token(credentials.credentials)
        logto_sub = claims.get("sub", "")
        if not logto_sub:
            raise HTTPException(status_code=401, detail={"error": "UNAUTHORIZED", "message": "Invalid token"})

        return CurrentUser(
            user_id=logto_sub,  # resolved to DB UUID by service layer
            logto_sub=logto_sub,
            email=claims.get("email", ""),
        )
    except HTTPException:
        raise
    except Exception as error:
        logger.warning("JWT verification failed: %s", error)
        raise HTTPException(status_code=401, detail={"error": "UNAUTHORIZED", "message": "Invalid or expired token"})
