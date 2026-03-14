"""Coder agent — code generation, review, and debugging."""

from agents.base import BaseAgent


class CoderAgent(BaseAgent):
    """Agent specialised in code generation and software engineering tasks."""

    @property
    def expected_output(self) -> str:
        return "Code solution with explanation"
