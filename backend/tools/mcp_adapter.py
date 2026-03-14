"""MCP (Model Context Protocol) tool adapter with cached discovery."""

import logging
import time
from typing import Any

from tools.base import BaseTool

logger = logging.getLogger(__name__)


class MCPTool(BaseTool):
    """Wraps a single MCP tool discovered from a server."""

    def __init__(self, name: str, description: str, server_url: str) -> None:
        self.name = name
        self.description = description
        self._server_url = server_url

    async def execute(self, **kwargs: Any) -> str:
        """Invoke the MCP tool via the server connection."""
        # TODO: Implement actual MCP tool invocation when servers are configured
        logger.warning(f"MCP tool '{self.name}' invoked but not connected to server")
        return f"MCP stub: {self.name} called with {kwargs}"


class MCPToolAdapter:
    """Adapter for MCP tool servers with cached discovery.

    Discovers tools from an MCP server and wraps them as BaseTool instances.
    Caches tool list with configurable TTL to avoid repeated discovery latency.
    """

    def __init__(
        self,
        server_url: str,
        server_name: str = "",
        cache_ttl_seconds: int = 300,
    ) -> None:
        self.server_url = server_url
        self.server_name = server_name or server_url
        self.cache_ttl_seconds = cache_ttl_seconds
        self._cached_tools: list[BaseTool] = []
        self._cache_timestamp: float = 0.0

    async def discover_tools(self) -> list[BaseTool]:
        """Discover tools from MCP server. Returns cached if fresh."""
        now = time.monotonic()
        if self._cached_tools and (now - self._cache_timestamp) < self.cache_ttl_seconds:
            return self._cached_tools

        try:
            # TODO: Use langchain-mcp-adapters to connect and list tools
            # from langchain_mcp_adapters import MCPClient
            # client = MCPClient(self.server_url)
            # tools = await client.list_tools()
            # self._cached_tools = [
            #     MCPTool(name=t.name, description=t.description, server_url=self.server_url)
            #     for t in tools
            # ]
            logger.info(f"MCP discovery stub for {self.server_name} — no real connection yet")
            self._cached_tools = []
        except Exception as error:
            logger.error(f"MCP discovery failed for {self.server_name}: {error}")
            return self._cached_tools

        self._cache_timestamp = now
        return self._cached_tools

    def invalidate_cache(self) -> None:
        """Force re-discovery on next call."""
        self._cache_timestamp = 0.0

    async def register_tools(self, registry: Any) -> None:
        """Discover tools and register them in a ToolRegistry."""
        tools = await self.discover_tools()
        for discovered_tool in tools:
            registry.register(discovered_tool)
        if tools:
            logger.info(
                f"Registered {len(tools)} MCP tools from {self.server_name}"
            )
