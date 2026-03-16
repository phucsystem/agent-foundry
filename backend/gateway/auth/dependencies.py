"""FastAPI auth dependencies for Lambda gateway."""

import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from gateway.config import settings
from gateway.models.db_models import fetch_one, execute_returning

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)

MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


class CurrentUser:
    """Authenticated user context."""

    def __init__(self, user_id: str, logto_sub: str = "", email: str = "") -> None:
        self.user_id = user_id
        self.logto_sub = logto_sub
        self.email = email


def _resolve_or_create_user(logto_sub: str, email: str) -> str:
    """Map Logto sub to DB user UUID. Auto-provisions on first login with $5 free credit."""
    row = fetch_one("SELECT id FROM users WHERE logto_id = %s", (logto_sub,))
    if row:
        return str(row["id"])

    new_row = execute_returning(
        """INSERT INTO users (email, logto_id, credit_balance_cents)
           VALUES (%s, %s, 500)
           ON CONFLICT (logto_id) DO UPDATE SET email = EXCLUDED.email
           RETURNING id""",
        (email or f"{logto_sub}@logto", logto_sub),
    )
    user_id = str(new_row["id"])
    logger.info("Auto-provisioned user %s for Logto sub %s", user_id, logto_sub)

    execute_returning(
        """INSERT INTO credit_transactions (user_id, amount_cents, type, description)
           VALUES (%s, 500, 'signup_bonus', 'Welcome bonus: $5.00 free credits')
           RETURNING id""",
        (user_id,),
    )
    return user_id


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

        email = claims.get("email", "")
        user_id = _resolve_or_create_user(logto_sub, email)

        return CurrentUser(user_id=user_id, logto_sub=logto_sub, email=email)
    except HTTPException:
        raise
    except Exception as error:
        logger.warning("JWT verification failed: %s", error)
        raise HTTPException(status_code=401, detail={"error": "UNAUTHORIZED", "message": "Invalid or expired token"})
