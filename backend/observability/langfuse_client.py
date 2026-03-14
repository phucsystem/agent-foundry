"""Langfuse client setup and callback handler for LLM call tracing."""

import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST", "http://localhost:3200")


class LangfuseTracer:
    """Langfuse integration for LLM call tracing."""

    def __init__(self) -> None:
        self._client = None
        self._enabled = bool(LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY)

    @property
    def enabled(self) -> bool:
        return self._enabled

    def get_client(self):
        """Lazy-init Langfuse client."""
        if not self._enabled:
            return None
        if self._client is None:
            try:
                from langfuse import Langfuse

                self._client = Langfuse(
                    public_key=LANGFUSE_PUBLIC_KEY,
                    secret_key=LANGFUSE_SECRET_KEY,
                    host=LANGFUSE_HOST,
                )
                logger.info("Langfuse client initialized")
            except ImportError:
                logger.warning("langfuse package not installed")
                self._enabled = False
            except Exception as error:
                logger.error(f"Langfuse init failed: {error}")
                self._enabled = False
        return self._client

    def create_trace(self, name: str, metadata: dict[str, Any] | None = None):
        """Create a new Langfuse trace."""
        client = self.get_client()
        if not client:
            return None
        return client.trace(name=name, metadata=metadata or {})

    def get_callback_handler(self, trace_id: str | None = None):
        """Get CrewAI/LangChain compatible callback handler."""
        client = self.get_client()
        if not client:
            return None
        try:
            from langfuse.callback import CallbackHandler

            return CallbackHandler(
                public_key=LANGFUSE_PUBLIC_KEY,
                secret_key=LANGFUSE_SECRET_KEY,
                host=LANGFUSE_HOST,
                trace_id=trace_id,
            )
        except ImportError:
            logger.warning("langfuse callback not available")
            return None

    def flush(self) -> None:
        """Flush pending events to Langfuse."""
        if self._client:
            self._client.flush()


langfuse_tracer = LangfuseTracer()
