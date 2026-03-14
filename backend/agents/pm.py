"""PM agent — product management, requirements, and roadmap planning."""

from agents.base import BaseAgent


class PMAgent(BaseAgent):
    """Agent specialised in product management and requirements definition."""

    @property
    def expected_output(self) -> str:
        return "Product requirements document with prioritized features and user stories"
