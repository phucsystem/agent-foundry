"""Output guardrail — validates task results against expected schema."""

from agents.config import GuardrailConfig, TaskResult
from agents.exceptions import OutputValidationError
from guardrails.base import GuardrailBase

VALID_STATUSES = {"completed", "failed", "partial"}


class OutputGuardrail(GuardrailBase):
    """Validates TaskResult has required fields and valid status."""

    name = "output"

    async def validate_output(self, result: TaskResult, config: GuardrailConfig) -> None:
        """Check status validity and required fields based on status."""
        if result.status not in VALID_STATUSES:
            raise OutputValidationError(
                f"Invalid status '{result.status}'. Must be one of: {VALID_STATUSES}"
            )

        if result.status == "completed" and not result.output.strip():
            raise OutputValidationError("Completed task must have non-empty output")

        if result.status == "failed" and not result.error:
            raise OutputValidationError("Failed task must include error message")
