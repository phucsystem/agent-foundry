"""Task service — CRUD for content tasks in RDS."""

import json
import logging

from gateway.models.db_models import fetch_one, fetch_all, execute_returning

logger = logging.getLogger(__name__)


class TaskService:
    """Content task CRUD operations."""

    def create_task(
        self,
        user_id: str,
        brand_config_id: str,
        task_type: str,
        input_data: dict,
    ) -> dict:
        """Create a new content task (status: pending)."""
        row = execute_returning(
            """INSERT INTO content_tasks (user_id, brand_config_id, task_type, input_json, status)
               VALUES (%s, %s, %s, %s, 'pending')
               RETURNING id, status, created_at""",
            (user_id, brand_config_id, task_type, json.dumps(input_data)),
        )
        logger.info("Created task %s for user %s", row["id"], user_id)
        return row

    def get_task(self, task_id: str, user_id: str) -> dict | None:
        """Get task by ID, scoped to user."""
        return fetch_one(
            """SELECT id, user_id, brand_config_id, task_type, status,
                      input_json, output_json, tokens_used, cost_cents,
                      created_at, completed_at
               FROM content_tasks WHERE id = %s AND user_id = %s""",
            (task_id, user_id),
        )

    def list_tasks(
        self,
        user_id: str,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[dict]:
        """List user's tasks with optional status filter."""
        if status:
            return fetch_all(
                """SELECT id, task_type, status, input_json, created_at, completed_at
                   FROM content_tasks WHERE user_id = %s AND status = %s
                   ORDER BY created_at DESC LIMIT %s OFFSET %s""",
                (user_id, status, limit, offset),
            )
        return fetch_all(
            """SELECT id, task_type, status, input_json, created_at, completed_at
               FROM content_tasks WHERE user_id = %s
               ORDER BY created_at DESC LIMIT %s OFFSET %s""",
            (user_id, limit, offset),
        )

    def update_task_result(
        self,
        task_id: str,
        output_data: dict,
        tokens_used: int,
        cost_cents: int,
        status: str = "completed",
    ) -> None:
        """Update task with result after agent completion."""
        from gateway.models.db_models import execute
        execute(
            """UPDATE content_tasks
               SET output_json = %s, tokens_used = %s, cost_cents = %s,
                   status = %s, completed_at = NOW()
               WHERE id = %s""",
            (json.dumps(output_data), tokens_used, cost_cents, status, task_id),
        )
        logger.info("Updated task %s: status=%s, tokens=%d", task_id, status, tokens_used)

    def mark_task_failed(self, task_id: str, error: str) -> None:
        """Mark task as failed with error message."""
        from gateway.models.db_models import execute
        execute(
            """UPDATE content_tasks
               SET status = 'failed', output_json = %s, completed_at = NOW()
               WHERE id = %s""",
            (json.dumps({"error": error}), task_id),
        )


task_service = TaskService()
