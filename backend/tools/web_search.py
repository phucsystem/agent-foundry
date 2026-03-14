"""Web search tool — stubs until EXA_API_KEY is configured."""

import logging
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)


class WebSearchTool(BaseTool):
    """Search the web for real-time information."""

    name = "web_search"
    description = "Search the web for real-time information"

    async def execute(self, **kwargs: Any) -> str:
        query = kwargs.get("query", "")
        max_results = kwargs.get("max_results", 5)

        if not query:
            return "No query provided."

        logger.debug("Web search requested: query=%r max_results=%d", query, max_results)

        # TODO: Wire to Exa API when key available
        return (
            f"Web search stub for: '{query}'\n\n"
            "Results:\n"
            "1. [Stub] No real search configured. Set EXA_API_KEY to enable.\n\n"
            "To enable: export EXA_API_KEY=your_key"
        )


tool_registry.register(WebSearchTool())
