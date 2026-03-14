"""Memory router — dispatches store/search calls to the appropriate backend."""

import logging
from typing import Any

from memory.memgraph import MemgraphService
from memory.pgai import PgaiMemoryService
from memory.session import SessionMemory

logger = logging.getLogger(__name__)

MemoryType = str  # "episodic" | "semantic" | "session" | "graph"


class MemoryRouter:
    """Routes memory operations to pgvector, Memgraph, or Redis session store."""

    def __init__(
        self,
        pgai: PgaiMemoryService,
        memgraph: MemgraphService,
        session: SessionMemory,
    ) -> None:
        self._pgai = pgai
        self._memgraph = memgraph
        self._session = session

    async def store(
        self,
        agent_id: str,
        content: str,
        memory_type: MemoryType = "episodic",
        **kwargs: Any,
    ) -> str | None:
        """Store a memory in the appropriate backend.

        Keyword args per type:
          session  → session_id (str)
          episodic / semantic → source (str), metadata (dict)
          graph    → task_id (str), success (bool, default True)
        """
        if memory_type == "session":
            session_id = kwargs.get("session_id", "")
            self._session.add_turn(session_id, "assistant", content)
            logger.debug("Session store: session=%s", session_id)
            return None

        if memory_type in ("episodic", "semantic"):
            source = kwargs.get("source", "")
            metadata = kwargs.get("metadata")
            memory_id = await self._pgai.store_memory(agent_id, content, source=source, metadata=metadata)
            return memory_id

        if memory_type == "graph":
            task_id = kwargs.get("task_id", "")
            success = bool(kwargs.get("success", True))
            await self._memgraph.record_execution(agent_id, task_id, success)
            return None

        logger.warning("Unknown memory_type=%s — store ignored", memory_type)
        return None

    async def search(
        self,
        query: str,
        agent_id: str,
        memory_type: MemoryType = "semantic",
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        """Search the appropriate backend and return results.

        Keyword args per type:
          session  → session_id (str)
          semantic / episodic → limit (int, default 5)
          graph    → limit (int, default 5)
        """
        if memory_type == "session":
            session_id = kwargs.get("session_id", "")
            return self._session.get_context(session_id)  # type: ignore[return-value]

        if memory_type in ("semantic", "episodic"):
            limit = int(kwargs.get("limit", 5))
            return await self._pgai.search_similar(query, agent_id, limit=limit)

        if memory_type == "graph":
            limit = int(kwargs.get("limit", 5))
            return await self._memgraph.find_similar_agents(agent_id, limit=limit)

        logger.warning("Unknown memory_type=%s — search returned empty", memory_type)
        return []
