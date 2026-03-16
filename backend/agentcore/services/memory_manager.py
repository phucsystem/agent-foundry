"""Memory manager — AgentCore Memory SDK integration."""

import logging
import os

from bedrock_agentcore.memory import MemoryClient

logger = logging.getLogger(__name__)


class MemoryManager:
    """Manage brand context persistence via AgentCore Memory."""

    def __init__(self) -> None:
        self._region = os.environ.get("AWS_REGION", "us-east-1")
        self._memory_id = os.environ.get("AGENTCORE_MEMORY_ID", "")
        self._client: MemoryClient | None = None

    def _get_client(self) -> MemoryClient:
        """Lazy-initialize memory client."""
        if self._client is None:
            self._client = MemoryClient(region_name=self._region)
        return self._client

    def retrieve_brand_context(self, user_id: str, query: str = "brand preferences") -> list[dict]:
        """Retrieve past brand context for a user from memory."""
        if not self._memory_id:
            logger.warning("AGENTCORE_MEMORY_ID not set — skipping memory retrieval")
            return []

        try:
            client = self._get_client()
            memories = client.retrieve_memories(
                memory_id=self._memory_id,
                namespace=f"/brand/{user_id}/",
                query=query,
            )
            logger.info("Retrieved %d memories for user %s", len(memories), user_id)
            return memories
        except Exception as error:
            logger.warning("Memory retrieval failed (non-fatal): %s", error)
            return []

    def store_session_summary(
        self,
        user_id: str,
        session_id: str,
        content_type: str,
        quality_score: float,
        topic: str,
    ) -> None:
        """Store session summary after content generation."""
        if not self._memory_id:
            logger.warning("AGENTCORE_MEMORY_ID not set — skipping memory storage")
            return

        try:
            client = self._get_client()
            client.create_event(
                memory_id=self._memory_id,
                actor_id=user_id,
                session_id=session_id,
                messages=[
                    (
                        f"Generated {content_type} content on topic: {topic}. "
                        f"Quality score: {quality_score:.2f}",
                        "ASSISTANT",
                    ),
                ],
            )
            logger.info("Stored session summary for user %s, session %s", user_id, session_id)
        except Exception as error:
            logger.warning("Memory storage failed (non-fatal): %s", error)
