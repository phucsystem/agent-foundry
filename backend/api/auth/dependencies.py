"""FastAPI dependencies for authentication."""

import logging

from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from api.auth.jwt_handler import jwt_handler
from api.auth.api_key import api_key_manager

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)

ROLE_HIERARCHY: dict[str, int] = {"admin": 3, "manager": 2, "viewer": 1}


class CurrentUser:
    """Represents the authenticated user."""

    def __init__(self, user_id: str, role: str = "viewer", auth_method: str = "jwt") -> None:
        self.user_id = user_id
        self.role = role
        self.auth_method = auth_method


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_api_key: str | None = Header(None, alias="X-API-Key"),
) -> CurrentUser:
    """Extract user from JWT bearer token or API key.

    Priority: Bearer token > API key
    """
    if credentials and credentials.credentials:
        try:
            payload = jwt_handler.verify_token(credentials.credentials)
            if payload.get("type") != "access":
                raise HTTPException(status_code=401, detail="Invalid token type")
            return CurrentUser(
                user_id=payload["sub"],
                role=payload.get("role", "viewer"),
                auth_method="jwt",
            )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    if x_api_key:
        # TODO: Look up hashed key in database
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
