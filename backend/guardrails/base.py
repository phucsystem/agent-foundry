"""Base guardrail classes and pipeline for composing validation checks."""

from abc import ABC

from agents.config import GuardrailConfig, TaskInput, TaskResult


class GuardrailBase(ABC):
    """Base class for all guardrails. Override validate_input and/or validate_output."""

    name: str = "base"

    async def validate_input(self, task: TaskInput, config: GuardrailConfig) -> None:
        """Validate before execution. Raise GuardrailViolation on failure."""

    async def validate_output(self, result: TaskResult, config: GuardrailConfig) -> None:
        """Validate after execution. Raise GuardrailViolation on failure."""


class GuardrailPipeline:
    """Runs multiple guardrails in sequence. First failure raises."""

    def __init__(self, guardrails: list[GuardrailBase] | None = None) -> None:
        self._guardrails = guardrails or []

    def add(self, guardrail: GuardrailBase) -> None:
        """Add a guardrail to the pipeline."""
        self._guardrails.append(guardrail)

    async def run_input_checks(self, task: TaskInput, config: GuardrailConfig) -> None:
        """Run all input validations. First failure raises."""
        for guardrail in self._guardrails:
            await guardrail.validate_input(task, config)

    async def run_output_checks(self, result: TaskResult, config: GuardrailConfig) -> None:
        """Run all output validations. First failure raises."""
        for guardrail in self._guardrails:
            await guardrail.validate_output(result, config)
