"""Research agent — web search, document analysis, report generation."""

from agents.base import BaseAgent


class ResearcherAgent(BaseAgent):
    """Agent specialised in research, analysis, and report generation."""

    @property
    def expected_output(self) -> str:
        return "Research report with citations and analysis"
