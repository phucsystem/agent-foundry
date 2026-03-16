"""URL reader tool wrapper using WebsiteSearchTool."""

import logging

from crewai_tools import WebsiteSearchTool

logger = logging.getLogger(__name__)


def create_url_reader_tool() -> WebsiteSearchTool:
    """Create configured website reader/search tool.

    Reads and searches content from specified URLs.
    """
    return WebsiteSearchTool()
