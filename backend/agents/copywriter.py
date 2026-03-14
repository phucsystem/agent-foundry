"""Copywriter agent — marketing copy, email campaigns, and content creation."""

from agents.base import BaseAgent


class CopywriterAgent(BaseAgent):
    """Agent specialised in marketing copywriting and content strategy."""

    @property
    def expected_output(self) -> str:
        return "Marketing copy with headline variants and call-to-action suggestions"
