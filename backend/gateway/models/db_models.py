"""Lightweight database access layer using psycopg2 (no ORM for Lambda cold start)."""

import logging
from contextlib import contextmanager
from typing import Any

import psycopg2
import psycopg2.extras

from gateway.config import settings

logger = logging.getLogger(__name__)


@contextmanager
def get_db_connection():
    """Get a database connection from DATABASE_URL."""
    connection = psycopg2.connect(settings.database_url)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def fetch_one(query: str, params: tuple = ()) -> dict[str, Any] | None:
    """Execute query and return one row as dict."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None


def fetch_all(query: str, params: tuple = ()) -> list[dict[str, Any]]:
    """Execute query and return all rows as list of dicts."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]


def execute(query: str, params: tuple = ()) -> None:
    """Execute a write query."""
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)


def execute_returning(query: str, params: tuple = ()) -> dict[str, Any] | None:
    """Execute a write query with RETURNING clause."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None
