"""Web search tool wrapper using SerperDevTool."""

import os
import logging

from crewai_tools import SerperDevTool

logger = logging.getLogger(__name__)


def create_web_search_tool() -> SerperDevTool:
    """Create configured SerperDev web search tool.

    Requires SERPER_API_KEY environment variable.
    """
    api_key = os.environ.get("SERPER_API_KEY", "")
    if not api_key:
        logger.warning("SERPER_API_KEY not set — web search will fail at runtime")

    return SerperDevTool(
        n_results=10,
        search_url="https://google.serper.dev/search",
    )
