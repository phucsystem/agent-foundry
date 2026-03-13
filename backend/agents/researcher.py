"""Research agent — web search, document analysis, report generation."""

from agents.base import BaseAgent, TaskInput, TaskResult


class ResearcherAgent(BaseAgent):
    """Agent specialised in research, analysis, and report generation."""

    agent_id = "researcher"
    name = "Research Analyst"
    role = "Senior research analyst"

    async def execute(self, task: TaskInput) -> TaskResult:
        """Execute research task."""
        return TaskResult(
            status="completed",
            output=f"Stub: would process research task — {task.goal}",
        )
