"""Logto JWT verification — ported from existing backend/api/auth/logto.py."""

import logging
from typing import Any

import jwt
from jwt import PyJWKClient

from gateway.config import settings

logger = logging.getLogger(__name__)

JWKS_URI = f"{settings.logto_endpoint}/oidc/jwks"
ISSUER = f"{settings.logto_endpoint}/oidc"


class LogtoVerifier:
    """Verify Logto-issued JWT tokens using JWKS."""

    def __init__(self) -> None:
        self._jwk_client: PyJWKClient | None = None

    @property
    def jwk_client(self) -> PyJWKClient:
        if self._jwk_client is None:
            self._jwk_client = PyJWKClient(
                JWKS_URI,
                cache_jwk_set=True,
                lifespan=300,
            )
        return self._jwk_client

    def verify_access_token(self, token: str) -> dict[str, Any]:
        """Verify a Logto access token and return claims."""
        signing_key = self.jwk_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES384", "RS256"],
            issuer=ISSUER,
            audience=settings.logto_api_resource,
            options={"verify_exp": True},
        )
        return claims


logto_verifier = LogtoVerifier()
