"""Semantic memory backed by PostgreSQL with pgvector."""

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


class PgaiMemoryService:
    """Stores and retrieves agent memories using pgvector cosine similarity."""

    def __init__(self, database: Any) -> None:
        self._db = database

    async def store_memory(
        self,
        agent_id: str,
        content: str,
        source: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Embed content and persist to agent_memories table. Returns record id."""
        from memory.embeddings import embedding_service

        embedding = await embedding_service.embed(content)

        row = await self._db.fetchrow(
            """
            INSERT INTO agent_memories (agent_id, chunk_text, embedding, source, metadata)
            VALUES ($1, $2, $3::vector, $4, $5::jsonb)
            RETURNING id
            """,
            agent_id,
            content,
            str(embedding),
            source,
            json.dumps(metadata or {}),
        )

        if row is None:
            raise RuntimeError("Insert returned no row — database write failed")

        memory_id = str(row["id"])
        logger.info("Stored memory id=%s for agent=%s", memory_id, agent_id)
        return memory_id

    async def search_similar(
        self,
        query: str,
        agent_id: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Return top-k memories by cosine similarity to query embedding."""
        from memory.embeddings import embedding_service

        query_embedding = await embedding_service.embed(query)

        rows = await self._db.fetch(
            """
            SELECT id, chunk_text, source, metadata,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM agent_memories
            WHERE agent_id = $2
            ORDER BY embedding <=> $1::vector
            LIMIT $3
            """,
            str(query_embedding),
            agent_id,
            limit,
        )

        results = [dict(row) for row in rows]
        logger.debug("Found %d similar memories for agent=%s", len(results), agent_id)
        return results

    async def delete_memories(self, agent_id: str) -> int:
        """Delete all memories for an agent. Returns count deleted."""
        status = await self._db.execute(
            "DELETE FROM agent_memories WHERE agent_id = $1",
            agent_id,
        )
        count = int(status.split()[-1]) if status else 0
        logger.info("Deleted %d memories for agent=%s", count, agent_id)
        return count
