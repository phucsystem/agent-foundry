"""User profile endpoint."""

from fastapi import APIRouter, Depends

from gateway.auth.dependencies import CurrentUser, get_current_user
from gateway.models.api_models import UserProfileResponse
from gateway.services.credit_service import credit_service

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(user: CurrentUser = Depends(get_current_user)):
    """Get current user profile with credit balance."""
    balance = credit_service.get_balance(user.user_id)
    return UserProfileResponse(
        user_id=user.user_id,
        email=user.email,
        credit_balance_cents=balance,
    )
