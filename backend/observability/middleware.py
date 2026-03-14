"""Request ID middleware for tracing and duration logging."""

import uuid
import logging
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to each request and log request duration."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.monotonic()

        request.state.request_id = request_id

        response = await call_next(request)

        duration = time.monotonic() - start_time
        response.headers["X-Request-ID"] = request_id

        logger.info(
            f"{request.method} {request.url.path} {response.status_code} {duration:.3f}s",
            extra={
                "request_id": request_id,
                "duration_seconds": round(duration, 3),
            },
        )

        return response
