"""Credit topup endpoints — Stripe integration."""

import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request

from gateway.auth.dependencies import CurrentUser, get_current_user
from gateway.config import settings
from gateway.models.api_models import CreateTopupRequest, TopupResponse
from gateway.services.credit_service import credit_service, TOPUP_PACKAGES

logger = logging.getLogger(__name__)
router = APIRouter()

stripe.api_key = settings.stripe_secret_key


@router.post("/topup", response_model=TopupResponse)
async def create_topup_session(
    request: CreateTopupRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """Create Stripe Checkout session for credit topup."""
    package = TOPUP_PACKAGES.get(request.package)
    if not package:
        raise HTTPException(status_code=400, detail={"error": "INVALID_REQUEST", "message": "Invalid package"})

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"Agent Foundry Credits — {request.package.capitalize()} Package",
                        "description": f"{package['credits_cents']} credits (${package['credits_cents'] / 100:.2f} value)",
                    },
                    "unit_amount": package["price_cents"],
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.frontend_url}/credits?success=true",
            cancel_url=f"{settings.frontend_url}/credits?cancelled=true",
            metadata={
                "user_id": user.user_id,
                "package": request.package,
                "credits_cents": str(package["credits_cents"]),
            },
        )

        return TopupResponse(checkout_url=session.url, session_id=session.id)

    except stripe.error.StripeError as error:
        logger.error("Stripe error: %s", error)
        raise HTTPException(status_code=500, detail={"error": "PAYMENT_ERROR", "message": str(error)})


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook for payment confirmation."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as error:
        logger.warning("Webhook verification failed: %s", error)
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        credits_cents = int(metadata.get("credits_cents", 0))
        package_name = metadata.get("package", "unknown")

        if user_id and credits_cents > 0:
            credit_service.topup_credits(
                user_id=user_id,
                amount_cents=credits_cents,
                description=f"Stripe topup: {package_name} package",
            )
            logger.info("Processed topup: user=%s, credits=%d", user_id, credits_cents)

    return {"received": True}
