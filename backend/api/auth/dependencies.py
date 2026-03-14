"""FastAPI dependencies for authentication (Logto OIDC + API key)."""

import logging
import os

from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from api.auth.api_key import api_key_manager

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)

ROLE_HIERARCHY: dict[str, int] = {"admin": 3, "manager": 2, "viewer": 1}
MOCK_AUTH = os.getenv("MOCK_AUTH", "true").lower() == "true"
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


class CurrentUser:
    """Represents the authenticated user."""

    def __init__(self, user_id: str, role: str = "viewer", auth_method: str = "logto") -> None:
        self.user_id = user_id
        self.role = role
        self.auth_method = auth_method


async def _resolve_user_id(external_id: str) -> str:
    """Map an external auth ID (Logto sub) to a DB user UUID. Auto-provisions on first login."""
    from database.connection import database

    if not database.is_connected:
        raise HTTPException(status_code=503, detail="Database unavailable")

    row = await database.fetchrow(
        "SELECT id FROM users WHERE api_key = $1", external_id
    )
    if row:
        return str(row["id"])

    new_row = await database.fetchrow(
        """INSERT INTO users (email, name, api_key)
           VALUES ($1, $2, $3)
           RETURNING id""",
        f"{external_id}@logto", external_id, external_id,
    )
    logger.info("Auto-provisioned user %s for external ID %s", new_row["id"], external_id)
    return str(new_row["id"])


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_api_key: str | None = Header(None, alias="X-API-Key"),
) -> CurrentUser:
    """Extract user from Logto JWT or API key.

    Priority: MOCK_AUTH bypass > Bearer token (Logto OIDC) > API key
    """
    if MOCK_AUTH:
        return CurrentUser(user_id=MOCK_USER_ID, role="admin", auth_method="mock")

    if credentials and credentials.credentials:
        external_id: str | None = None
        role = "viewer"
        auth_method = "logto"

        try:
            from api.auth.logto import logto_verifier
            claims = logto_verifier.verify_access_token(credentials.credentials)
            external_id = claims.get("sub", "")
            role = claims.get("role", "viewer")
        except Exception as logto_error:
            logger.debug(f"Logto token failed: {logto_error}, trying local JWT")
            try:
                from api.auth.jwt_handler import jwt_handler
                payload = jwt_handler.verify_token(credentials.credentials)
                if payload.get("type") != "access":
                    raise HTTPException(status_code=401, detail="Invalid token type")
                external_id = payload["sub"]
                role = payload.get("role", "viewer")
                auth_method = "jwt"
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

        if not external_id:
            raise HTTPException(status_code=401, detail="No user identifier in token")

        user_id = await _resolve_user_id(external_id)
        return CurrentUser(user_id=user_id, role=role, auth_method=auth_method)

    if x_api_key:
        if x_api_key.startswith("af_"):
            return CurrentUser(user_id="api-user", role="viewer", auth_method="api_key")
        raise HTTPException(status_code=401, detail="Invalid API key")

    raise HTTPException(status_code=401, detail="Authentication required")


def require_role(required_role: str):
    """Factory for role-based access control."""

    async def check_role(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        user_level = ROLE_HIERARCHY.get(user.role, 0)
        required_level = ROLE_HIERARCHY.get(required_role, 0)
        if user_level < required_level:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return check_role
