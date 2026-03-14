"""Logto OIDC token verification via JWKS."""

import os
import logging
from typing import Any

import jwt
from jwt import PyJWKClient

logger = logging.getLogger(__name__)

LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT", "http://localhost:3001")
LOGTO_APP_ID = os.getenv("LOGTO_APP_ID", "")
LOGTO_API_RESOURCE = os.getenv("LOGTO_API_RESOURCE", "http://localhost:8000")

JWKS_URI = f"{LOGTO_ENDPOINT}/oidc/jwks"
ISSUER = f"{LOGTO_ENDPOINT}/oidc"


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
        """Verify a Logto access token and return claims.

        Validates: signature (via JWKS), issuer, audience, expiration.
        """
        signing_key = self.jwk_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES384", "RS256"],
            issuer=ISSUER,
            audience=LOGTO_API_RESOURCE,
            options={"verify_exp": True},
        )
        return claims

    def verify_id_token(self, token: str) -> dict[str, Any]:
        """Verify a Logto ID token (for frontend use)."""
        signing_key = self.jwk_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES384", "RS256"],
            issuer=ISSUER,
            audience=LOGTO_APP_ID,
            options={"verify_exp": True},
        )
        return claims


logto_verifier = LogtoVerifier()
