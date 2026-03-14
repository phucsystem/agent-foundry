"""Task lifecycle signal handlers for Celery."""

import logging

from celery import signals

logger = logging.getLogger(__name__)


@signals.task_success.connect
def on_task_success(result: object, sender: object = None, **kwargs: object) -> None:
    """Log task success and placeholder for DB status update."""
    task_id = getattr(sender.request, "id", "unknown") if sender else "unknown"
    logger.info("Task %s succeeded", task_id)


@signals.task_failure.connect
def on_task_failure(
    exc: Exception,
    task_id: str,
    args: list,
    kwargs: dict,
    traceback: object,
    einfo: object,
    sender: object = None,
    **extra: object,
) -> None:
    """Log task failure and placeholder for DB status update."""
    logger.error("Task %s failed: %s", task_id, exc)


@signals.task_retry.connect
def on_task_retry(
    request: object,
    reason: object,
    einfo: object,
    sender: object = None,
    **kwargs: object,
) -> None:
    """Log retry attempt."""
    task_id = getattr(request, "id", "unknown")
    retry_count = getattr(request, "retries", 0)
    logger.warning("Task %s retrying (attempt %d): %s", task_id, retry_count + 1, reason)


@signals.task_revoked.connect
def on_task_revoked(
    request: object,
    terminated: bool,
    signum: object,
    expired: bool,
    sender: object = None,
    **kwargs: object,
) -> None:
    """Log task revocation."""
    task_id = getattr(request, "id", "unknown")
    logger.warning("Task %s revoked (terminated=%s, expired=%s)", task_id, terminated, expired)
