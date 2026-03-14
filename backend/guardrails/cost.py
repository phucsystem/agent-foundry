"""Cost guardrail — budget pre-flight check and post-execution monitoring."""

import logging

from agents.config import GuardrailConfig, TaskInput, TaskResult
from agents.exceptions import BudgetExceededError
from guardrails.base import GuardrailBase

logger = logging.getLogger(__name__)


class CostGuardrail(GuardrailBase):
    """Enforces budget limits before and after task execution."""

    name = "cost"

    async def validate_input(self, task: TaskInput, config: GuardrailConfig) -> None:
        """Pre-flight budget check. Block if task budget exceeds agent limit."""
        if task.budget_usd > config.max_budget_usd:
            raise BudgetExceededError(
                f"Task budget ${task.budget_usd:.2f} exceeds agent limit "
                f"${config.max_budget_usd:.2f}"
            )

    async def validate_output(self, result: TaskResult, config: GuardrailConfig) -> None:
        """Post-execution cost check. Warning-only (actual cost from Langfuse)."""
        if result.cost_usd > config.max_budget_usd:
            logger.warning(
                f"Task {result.task_id} actual cost ${result.cost_usd:.2f} "
                f"exceeded budget ${config.max_budget_usd:.2f}"
            )
