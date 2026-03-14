"""Domain exceptions for the agent framework."""


class AgentError(Exception):
    """Base exception for all agent-related errors."""


class AgentConfigError(AgentError):
    """Raised when agent configuration is invalid or missing."""


class AgentExecutionError(AgentError):
    """Raised when agent fails during task execution."""


class AgentNotFoundError(AgentError):
    """Raised when requested agent does not exist in registry."""


class ToolNotFoundError(AgentError):
    """Raised when requested tool does not exist in registry."""


class GuardrailViolation(AgentError):
    """Base exception for guardrail failures."""


class BudgetExceededError(GuardrailViolation):
    """Raised when task budget exceeds agent or user limit."""


class OutputValidationError(GuardrailViolation):
    """Raised when task output fails schema validation."""


class InputValidationError(GuardrailViolation):
    """Raised when task input fails validation (e.g. prompt injection)."""
