"""OpenTelemetry instrumentation setup for FastAPI and asyncpg."""

import os
import logging

logger = logging.getLogger(__name__)

OTEL_ENABLED = os.getenv("OTEL_ENABLED", "false").lower() == "true"
OTEL_SERVICE_NAME = os.getenv("OTEL_SERVICE_NAME", "agent-foundry-api")


class TelemetrySetup:
    """OpenTelemetry instrumentation for FastAPI + asyncpg."""

    def __init__(self) -> None:
        self._initialized = False

    def initialize(self) -> None:
        """Set up OpenTelemetry tracing. No-op if disabled or missing deps."""
        if not OTEL_ENABLED:
            logger.info("OpenTelemetry disabled (set OTEL_ENABLED=true to enable)")
            return

        try:
            from opentelemetry import trace
            from opentelemetry.sdk.trace import TracerProvider
            from opentelemetry.sdk.resources import Resource

            resource = Resource.create({"service.name": OTEL_SERVICE_NAME})
            provider = TracerProvider(resource=resource)
            trace.set_tracer_provider(provider)

            self._initialized = True
            logger.info(f"OpenTelemetry initialized for {OTEL_SERVICE_NAME}")

        except ImportError:
            logger.info("OpenTelemetry packages not installed, skipping")
        except Exception as error:
            logger.error(f"OpenTelemetry setup failed: {error}")

    def instrument_fastapi(self, app) -> None:
        """Instrument FastAPI with OTel middleware."""
        if not self._initialized:
            return
        try:
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

            FastAPIInstrumentor.instrument_app(app)
            logger.info("FastAPI instrumented with OpenTelemetry")
        except ImportError:
            logger.debug("opentelemetry-instrumentation-fastapi not installed")

    def instrument_asyncpg(self) -> None:
        """Instrument asyncpg with OTel."""
        if not self._initialized:
            return
        try:
            from opentelemetry.instrumentation.asyncpg import AsyncPGInstrumentor

            AsyncPGInstrumentor().instrument()
            logger.info("asyncpg instrumented with OpenTelemetry")
        except ImportError:
            logger.debug("opentelemetry-instrumentation-asyncpg not installed")


telemetry_setup = TelemetrySetup()
