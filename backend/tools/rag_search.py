"""RAG search tool — semantic search over agent memories via pgvector."""

import logging
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)


class RAGSearchTool(BaseTool):
    """Search past documents and agent outputs by semantic similarity."""

    name = "rag_search"
    description = "Search past documents and agent outputs by semantic similarity"

    async def execute(self, **kwargs: Any) -> str:
        query = kwargs.get("query", "")
        agent_id = kwargs.get("agent_id", "researcher")
        top_k = kwargs.get("top_k", 5)

        if not query:
            return "No query provided."

        logger.debug("RAG search: query=%r agent_id=%r top_k=%d", query, agent_id, top_k)

        try:
            from database.connection import database
            from memory.pgai import PgaiMemoryService

            if database._pool is None:
                return (
                    "RAG search unavailable: database not connected. "
                    "Start with `make up` and connect DB."
                )

            pgai = PgaiMemoryService(database)
            results = await pgai.search_similar(query, agent_id, limit=top_k)

            if not results:
                return f"No results found for: '{query}'"

            formatted = []
            for idx, result in enumerate(results, 1):
                chunk = result.get("chunk_text", "")
                source = result.get("source", "unknown")
                similarity = result.get("similarity", 0)
                formatted.append(
                    f"{idx}. [{source}] (sim: {similarity:.3f})\n   {chunk[:200]}..."
                )

            return f"Found {len(results)} results for: '{query}'\n\n" + "\n\n".join(formatted)

        except Exception as error:
            logger.error("RAG search failed: %s", error)
            return f"RAG search error: {error}"


tool_registry.register(RAGSearchTool())
