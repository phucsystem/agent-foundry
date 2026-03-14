"""Async database connection pool using asyncpg."""

import logging

import asyncpg
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class DatabaseSettings(BaseSettings):
    database_url: str = "postgresql://app:changeme@localhost:5432/agentfoundry"
    pool_min_size: int = 5
    pool_max_size: int = 20

    model_config = {"env_prefix": ""}


class Database:
    """Async PostgreSQL connection pool wrapper."""

    def __init__(self, settings: DatabaseSettings | None = None) -> None:
        self.settings = settings or DatabaseSettings()
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        """Create connection pool."""
        self._pool = await asyncpg.create_pool(
            self.settings.database_url,
            min_size=self.settings.pool_min_size,
            max_size=self.settings.pool_max_size,
        )
        logger.info("Database connection pool created (min=%d, max=%d)",
                    self.settings.pool_min_size, self.settings.pool_max_size)

    async def disconnect(self) -> None:
        """Close connection pool gracefully."""
        if self._pool:
            await self._pool.close()
            logger.info("Database connection pool closed")

    async def execute(self, query: str, *args: object) -> str:
        """Execute a write query, return status string."""
        if self._pool is None:
            raise RuntimeError("Database pool not initialised — call connect() first")
        async with self._pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args: object) -> list[asyncpg.Record]:
        """Fetch multiple rows."""
        if self._pool is None:
            raise RuntimeError("Database pool not initialised — call connect() first")
        async with self._pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args: object) -> asyncpg.Record | None:
        """Fetch a single row."""
        if self._pool is None:
            raise RuntimeError("Database pool not initialised — call connect() first")
        async with self._pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args: object) -> object:
        """Fetch a single scalar value."""
        if self._pool is None:
            raise RuntimeError("Database pool not initialised — call connect() first")
        async with self._pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    @property
    def is_connected(self) -> bool:
        return self._pool is not None


# Module-level singleton — initialised at application startup via lifespan.
database = Database()
