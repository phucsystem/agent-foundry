"""Database package — connection pool and Pydantic record models."""

from database.connection import Database, DatabaseSettings, database
from database.models import AgentMemoryRecord, TaskRecord, UserRecord

__all__ = [
    "Database",
    "DatabaseSettings",
    "database",
    "UserRecord",
    "TaskRecord",
    "AgentMemoryRecord",
]
