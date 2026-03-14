"""Task classification and routing for the orchestrator."""

import logging

logger = logging.getLogger(__name__)

ROUTE_KEYWORDS: dict[str, list[str]] = {
    "coder": [
        "code", "bug", "fix", "pr", "pull request", "refactor",
        "implement", "function", "api", "endpoint", "debug",
    ],
    "researcher": [
        "research", "analyze", "report", "find", "investigate", "compare",
        "summarize", "study", "review literature",
    ],
    "pm": [
        "product", "requirements", "prd", "user story", "stories", "roadmap",
        "backlog", "sprint", "epic", "feature spec",
    ],
    "qa": [
        "qa", "quality", "regression", "playwright", "selenium",
        "automation", "coverage", "test case", "test plan", "test report",
    ],
    "copywriter": [
        "copy", "email", "blog", "marketing", "seo", "headline", "cta",
        "newsletter", "content", "landing page",
    ],
}

DEFAULT_AGENT = "researcher"


class TaskRouter:
    """Classify tasks and route to appropriate agent(s)."""

    def classify(self, goal: str) -> str:
        """Classify task goal into agent type. Returns agent_id."""
        goal_lower = goal.lower()

        scores: dict[str, int] = {}
        for agent_id, keywords in ROUTE_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in goal_lower)
            if score > 0:
                scores[agent_id] = score

        if not scores:
            logger.info(f"No keyword match for goal, defaulting to {DEFAULT_AGENT}")
            return DEFAULT_AGENT

        best_agent = max(scores, key=lambda agent: scores[agent])
        logger.info(f"Classified goal as '{best_agent}' (score: {scores[best_agent]})")
        return best_agent

    def route(self, goal: str, available_agents: list[str] | None = None) -> list[str]:
        """Route to one or more agents. Returns ordered list of agent_ids."""
        primary = self.classify(goal)

        if available_agents and primary not in available_agents:
            logger.warning(f"Agent '{primary}' not available, falling back to {DEFAULT_AGENT}")
            primary = DEFAULT_AGENT

        return [primary]

    def route_multi(self, goal: str, agent_count: int = 2) -> list[str]:
        """Route to multiple agents for parallel execution."""
        goal_lower = goal.lower()
        scores: dict[str, int] = {}
        for agent_id, keywords in ROUTE_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in goal_lower)
            scores[agent_id] = score

        sorted_agents = sorted(scores, key=lambda agent: scores[agent], reverse=True)
        return sorted_agents[:agent_count]


task_router = TaskRouter()
