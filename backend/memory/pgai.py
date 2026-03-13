"""PostgreSQL + pgvector semantic memory service."""

from typing import Any


class PgaiMemoryService:
    """Semantic memory backed by PostgreSQL with pgvector."""

    def __init__(self, database_url: str) -> None:
        """Initialize with database connection URL."""
        self.database_url = database_url

    async def store_memory(
        self, agent_id: str, content: str, memory_type: str = "episodic"
    ) -> str:
        """Store a memory with embedding. Returns memory ID."""
        raise NotImplementedError("pgai store not yet implemented")

    async def search_similar(
        self, query: str, agent_id: str, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Search for similar memories using cosine similarity."""
        raise NotImplementedError("pgai search not yet implemented")
