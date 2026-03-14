"""Graph memory for agent-task-project relationships using Memgraph (neo4j driver)."""

import logging
import os
from typing import Any

from neo4j import AsyncGraphDatabase

logger = logging.getLogger(__name__)

MEMGRAPH_BOLT_URL = os.getenv("MEMGRAPH_BOLT_URL", "bolt://localhost:7687")


class MemgraphService:
    """Stores and queries agent execution relationships in Memgraph."""

    def __init__(self, bolt_url: str = MEMGRAPH_BOLT_URL) -> None:
        self.bolt_url = bolt_url
        self._driver: Any = None

    async def connect(self) -> None:
        """Open the async driver connection."""
        self._driver = AsyncGraphDatabase.driver(self.bolt_url)
        logger.info("Memgraph driver connected to %s", self.bolt_url)

    async def disconnect(self) -> None:
        """Close the async driver gracefully."""
        if self._driver:
            await self._driver.close()
            self._driver = None
            logger.info("Memgraph driver disconnected")

    def _require_driver(self) -> Any:
        if self._driver is None:
            raise RuntimeError("Memgraph driver not initialised — call connect() first")
        return self._driver

    async def record_execution(
        self, agent_id: str, task_id: str, success: bool
    ) -> None:
        """Create or merge Agent and Task nodes, then add EXECUTED relationship."""
        driver = self._require_driver()
        async with driver.session() as graph_session:
            await graph_session.run(
                """
                MERGE (a:Agent {id: $agent_id})
                MERGE (t:Task {id: $task_id})
                CREATE (a)-[:EXECUTED {success: $success, timestamp: timestamp()}]->(t)
                """,
                agent_id=agent_id,
                task_id=task_id,
                success=success,
            )
        logger.debug("Recorded execution agent=%s task=%s success=%s", agent_id, task_id, success)

    async def find_similar_agents(
        self, agent_id: str, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Return agents sharing the most task executions with the given agent."""
        driver = self._require_driver()
        async with driver.session() as graph_session:
            result = await graph_session.run(
                """
                MATCH (a:Agent {id: $agent_id})-[:EXECUTED]->(t:Task)<-[:EXECUTED]-(other:Agent)
                WHERE other.id <> $agent_id
                RETURN other.id AS agent_id, count(t) AS shared_tasks
                ORDER BY shared_tasks DESC
                LIMIT $limit
                """,
                agent_id=agent_id,
                limit=limit,
            )
            return [dict(record) async for record in result]

    async def get_agent_task_history(
        self, agent_id: str, limit: int = 20
    ) -> list[dict[str, Any]]:
        """Return recent task IDs and success flags for an agent."""
        driver = self._require_driver()
        async with driver.session() as graph_session:
            result = await graph_session.run(
                """
                MATCH (a:Agent {id: $agent_id})-[e:EXECUTED]->(t:Task)
                RETURN t.id AS task_id, e.success AS success, e.timestamp AS timestamp
                ORDER BY e.timestamp DESC
                LIMIT $limit
                """,
                agent_id=agent_id,
                limit=limit,
            )
            return [dict(record) async for record in result]


memgraph_service = MemgraphService()
