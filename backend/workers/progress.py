"""Redis pub/sub utilities for real-time task progress events."""

import json
import logging
import os

import redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_CHANNEL_PREFIX = "task"
_PROGRESS_SUFFIX = "progress"


def _channel_name(task_id: str) -> str:
    return f"{_CHANNEL_PREFIX}:{task_id}:{_PROGRESS_SUFFIX}"


class ProgressPublisher:
    """Publish task progress events via Redis pub/sub."""

    def __init__(self) -> None:
        self._redis: redis.Redis = redis.from_url(REDIS_URL)

    def publish(self, task_id: str, event_type: str, data: dict) -> None:
        """Publish a progress event for a task."""
        channel = _channel_name(task_id)
        message = json.dumps({"type": event_type, **data})
        try:
            self._redis.publish(channel, message)
            logger.debug("Published '%s' event for task %s", event_type, task_id)
        except redis.RedisError as error:
            logger.error("Failed to publish progress for task %s: %s", task_id, error)

    def subscribe(self, task_id: str) -> redis.client.PubSub:
        """Subscribe to all progress events for a task.

        Returns a pubsub object — caller is responsible for unsubscribing.
        """
        pubsub = self._redis.pubsub()
        pubsub.subscribe(_channel_name(task_id))
        logger.debug("Subscribed to progress channel for task %s", task_id)
        return pubsub


progress_publisher = ProgressPublisher()
