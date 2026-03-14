"""Celery task definitions for async agent execution."""

import asyncio
import logging

from celery.exceptions import SoftTimeLimitExceeded

from workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="execute_agent_task",
    max_retries=3,
    soft_time_limit=1500,
    time_limit=1800,
    acks_late=True,
    reject_on_worker_lost=True,
)
def execute_agent_task(self, task_id: str, agent_id: str, input_data: dict) -> dict:
    """Execute an agent task asynchronously.

    Steps:
    1. Load agent from registry
    2. Build TaskInput from input_data
    3. Execute agent (runs async via event loop)
    4. Return serialized TaskResult
    """
    from agents import agent_registry
    from agents.config import TaskInput
    from agents.exceptions import AgentNotFoundError

    logger.info("Starting task %s for agent %s", task_id, agent_id)

    try:
        agent = agent_registry.get_agent(agent_id)
        task_input = TaskInput(task_id=task_id, agent_id=agent_id, **input_data)

        result = asyncio.run(agent.execute(task_input))

        logger.info("Task %s completed with status: %s", task_id, result.status)
        return result.model_dump()

    except AgentNotFoundError as error:
        logger.error("Task %s — agent not found: %s", task_id, error)
        raise

    except SoftTimeLimitExceeded:
        logger.warning("Task %s hit soft time limit, will not retry", task_id)
        raise

    except Exception as error:
        logger.error("Task %s failed (attempt %d): %s", task_id, self.request.retries + 1, error)
        retry_delay = 60 * (2 ** self.request.retries)
        raise self.retry(exc=error, countdown=retry_delay)
