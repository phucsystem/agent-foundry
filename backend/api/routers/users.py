"""User profile endpoints."""

import logging

from fastapi import APIRouter, Depends
from api.auth.dependencies import get_current_user, CurrentUser

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me")
async def get_profile(user: CurrentUser = Depends(get_current_user)) -> dict:
    """Get user profile."""
    # TODO: Fetch from database when user model is ready
    return {
        "user_id": user.user_id,
        "role": user.role,
        "tier": "free",
    }


@router.patch("/me")
async def update_profile(user: CurrentUser = Depends(get_current_user)) -> dict:
    """Update user profile."""
    # TODO: Implement when database user model is ready
    return {"message": "Profile update not yet implemented", "user_id": user.user_id}
