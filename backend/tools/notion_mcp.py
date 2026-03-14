"""Notion MCP tool — stub wrapper for Notion operations via MCP protocol."""

import logging
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)


class NotionMCPTool(BaseTool):
    """Wraps Notion operations (read/write pages, databases) via MCP protocol.

    Currently a stub — real integration requires Notion MCP server runtime.
    TODO: Wire to MCPServerAdapter when npx @notionhq/notion-mcp-server is available.
    """

    name = "notion_mcp"
    description = "Read/write Notion pages, create databases, manage content"

    async def execute(self, **kwargs: Any) -> str:
        """Dispatch to the appropriate Notion action.

        Args:
            action: One of read_page | write_page | create_database | query_database | create_page
            **kwargs: Action-specific parameters
        """
        action = kwargs.get("action", "read_page")
        dispatch = {
            "read_page": self._read_page,
            "write_page": self._write_page,
            "create_database": self._create_database,
            "query_database": self._query_database,
            "create_page": self._create_page,
        }
        handler = dispatch.get(action)
        if handler is None:
            return f"Unknown action '{action}'. Available: {list(dispatch.keys())}"
        return await handler(**kwargs)

    async def _read_page(self, **kwargs: Any) -> str:
        """Read content from a Notion page."""
        page_id = kwargs.get("page_id", "")
        logger.info(f"notion_mcp.read_page page_id={page_id!r}")
        return f"[stub] read_page: page_id={page_id!r}. No real MCP connection yet."

    async def _write_page(self, **kwargs: Any) -> str:
        """Write/update content on a Notion page."""
        page_id = kwargs.get("page_id", "")
        content = kwargs.get("content", "")
        logger.info(f"notion_mcp.write_page page_id={page_id!r}")
        return f"[stub] write_page: page_id={page_id!r}, content_length={len(content)}. No real MCP connection yet."

    async def _create_database(self, **kwargs: Any) -> str:
        """Create a new Notion database."""
        parent_id = kwargs.get("parent_id", "")
        title = kwargs.get("title", "")
        logger.info(f"notion_mcp.create_database parent={parent_id!r} title={title!r}")
        return f"[stub] create_database: parent_id={parent_id!r}, title={title!r}. No real MCP connection yet."

    async def _query_database(self, **kwargs: Any) -> str:
        """Query a Notion database with optional filters."""
        database_id = kwargs.get("database_id", "")
        filter_params = kwargs.get("filter", {})
        logger.info(f"notion_mcp.query_database database_id={database_id!r}")
        return f"[stub] query_database: database_id={database_id!r}, filter={filter_params}. No real MCP connection yet."

    async def _create_page(self, **kwargs: Any) -> str:
        """Create a new page in a Notion database or as a child page."""
        parent_id = kwargs.get("parent_id", "")
        title = kwargs.get("title", "")
        properties = kwargs.get("properties", {})
        logger.info(f"notion_mcp.create_page parent={parent_id!r} title={title!r}")
        return f"[stub] create_page: parent_id={parent_id!r}, title={title!r}, properties={list(properties.keys())}. No real MCP connection yet."


tool_registry.register(NotionMCPTool())
