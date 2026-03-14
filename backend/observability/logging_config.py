"""Structured JSON logging configuration for Agent Foundry."""

import logging
import json
import sys
from datetime import datetime, timezone

_EXTRA_FIELDS = (
    "agent_id",
    "task_id",
    "user_id",
    "request_id",
    "duration_seconds",
    "cost_usd",
    "tokens_used",
)

_NOISY_LOGGERS = ("httpx", "httpcore", "urllib3", "asyncio")


class JSONFormatter(logging.Formatter):
    """Structured JSON log formatter."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": "agent-foundry",
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in _EXTRA_FIELDS:
            value = getattr(record, field, None)
            if value is not None:
                log_entry[field] = value

        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def configure_logging(level: str = "INFO", json_output: bool = True) -> None:
    """Configure application-wide logging."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if json_output:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)-8s %(name)s — %(message)s")
        )

    root_logger.addHandler(handler)

    for noisy_logger in _NOISY_LOGGERS:
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)
