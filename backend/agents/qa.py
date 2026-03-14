"""QA agent — quality assurance, test strategy, and bug reporting."""

from agents.base import BaseAgent


class QAAgent(BaseAgent):
    """Agent specialised in quality assurance and automated testing."""

    @property
    def expected_output(self) -> str:
        return "Test report with test cases, results, and bug reports"
