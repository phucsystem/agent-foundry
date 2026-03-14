"""Tool registry — discover and resolve tools for agents."""

import logging
from typing import Any

from agents.exceptions import ToolNotFoundError
from tools.base import BaseTool

logger = logging.getLogger(__name__)


class ToolRegistry:
    """Central registry for agent tools."""

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool_instance: BaseTool) -> None:
        """Register a tool by name. Warns on duplicate."""
        if tool_instance.name in self._tools:
            logger.warning(f"Overwriting existing tool: {tool_instance.name}")
        self._tools[tool_instance.name] = tool_instance

    def get_tool(self, name: str) -> BaseTool:
        """Get tool by name. Raises ToolNotFoundError if missing."""
        if name not in self._tools:
            raise ToolNotFoundError(f"Tool '{name}' not found in registry")
        return self._tools[name]

    def list_tools(self) -> list[BaseTool]:
        """Return all registered tools."""
        return list(self._tools.values())

    def has_tool(self, name: str) -> bool:
        """Check if tool is registered."""
        return name in self._tools

    def get_crewai_tools(self, names: list[str]) -> list[Any]:
        """Resolve tool names to CrewAI-compatible tool objects.

        Skips missing tools with a warning log.
        """
        crewai_tools = []
        for name in names:
            if not self.has_tool(name):
                logger.warning(f"Tool '{name}' not found, skipping")
                continue
            try:
                crewai_tool = self._tools[name].to_crewai_tool()
                crewai_tools.append(crewai_tool)
            except Exception as error:
                logger.warning(f"Failed to convert tool '{name}' to CrewAI: {error}")
        return crewai_tools


tool_registry = ToolRegistry()
