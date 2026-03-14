"""Authentication endpoints — login, refresh, API key generation."""

import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from api.auth.jwt_handler import jwt_handler
from api.auth.api_key import api_key_manager
from api.auth.dependencies import get_current_user, CurrentUser

logger = logging.getLogger(__name__)
router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class APIKeyResponse(BaseModel):
    api_key: str
    message: str


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    """Login and receive tokens. Stub: accepts any email/password for dev."""
    # TODO: Validate against database when user model is ready
    access = jwt_handler.create_access_token(user_id=request.email, role="viewer")
    refresh = jwt_handler.create_refresh_token(user_id=request.email)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest) -> TokenResponse:
    """Refresh access token using refresh token."""
    try:
        payload = jwt_handler.verify_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        access = jwt_handler.create_access_token(user_id=payload["sub"], role="viewer")
        refresh = jwt_handler.create_refresh_token(user_id=payload["sub"])
        return TokenResponse(access_token=access, refresh_token=refresh)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.post("/api-key", response_model=APIKeyResponse)
async def generate_api_key(user: CurrentUser = Depends(get_current_user)) -> APIKeyResponse:
    """Generate a new API key for the authenticated user."""
    raw_key, _hashed_key = api_key_manager.generate()
    # TODO: Store hashed_key in database linked to user
    return APIKeyResponse(
        api_key=raw_key,
        message="Store this key securely. It cannot be retrieved again.",
    )


@router.get("/me")
async def get_current_user_info(user: CurrentUser = Depends(get_current_user)) -> dict:
    """Get current authenticated user info."""
    return {"user_id": user.user_id, "role": user.role, "auth_method": user.auth_method}
