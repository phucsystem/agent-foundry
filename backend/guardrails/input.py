"""Input guardrail — basic prompt injection detection."""

from agents.config import GuardrailConfig, TaskInput
from agents.exceptions import InputValidationError
from guardrails.base import GuardrailBase

INJECTION_PATTERNS = [
    "ignore previous instructions",
    "ignore all previous",
    "disregard your instructions",
    "forget your instructions",
    "you are now",
    "new instructions:",
    "system prompt:",
    "override:",
    "jailbreak",
]


class InputGuardrail(GuardrailBase):
    """Pattern-based prompt injection filter.

    Checks task goal and context against known injection patterns.
    Disable per-agent via guardrails.block_prompt_injection: false.
    """

    name = "input"

    async def validate_input(self, task: TaskInput, config: GuardrailConfig) -> None:
        """Check for prompt injection patterns in task input."""
        if not config.block_prompt_injection:
            return

        text_to_check = f"{task.goal} {task.context or ''}".lower()

        for pattern in INJECTION_PATTERNS:
            if pattern in text_to_check:
                raise InputValidationError(
                    f"Potential prompt injection detected: '{pattern}'"
                )
