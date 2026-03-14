"""Base tool classes and decorator for the agent tool system."""

import functools
import logging
from abc import ABC, abstractmethod
from typing import Any, Callable

logger = logging.getLogger(__name__)


class BaseTool(ABC):
    """Abstract base class for all agent tools."""

    name: str
    description: str

    @abstractmethod
    async def execute(self, **kwargs: Any) -> str:
        """Execute the tool with keyword arguments. Return result as string."""
        ...

    def to_crewai_tool(self):
        """Convert to a CrewAI-compatible tool."""
        from crewai.tools import tool as crewai_tool_decorator

        tool_name = self.name
        tool_desc = self.description
        tool_execute = self.execute

        @crewai_tool_decorator(tool_name)
        def wrapper(**kwargs: Any) -> str:
            import asyncio

            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                future = asyncio.run_coroutine_threadsafe(tool_execute(**kwargs), loop)
                return future.result(timeout=30)
            return asyncio.run(tool_execute(**kwargs))

        wrapper.__doc__ = tool_desc
        return wrapper


class SimpleTool(BaseTool):
    """Wraps a plain function as a BaseTool. Created by @tool decorator."""

    def __init__(self, name: str, description: str, func: Callable) -> None:
        self.name = name
        self.description = description
        self._func = func

    async def execute(self, **kwargs: Any) -> str:
        """Execute the wrapped function."""
        import asyncio

        if asyncio.iscoroutinefunction(self._func):
            return await self._func(**kwargs)
        return self._func(**kwargs)


def tool(name: str, description: str) -> Callable:
    """Decorator to register a function as a tool.

    Usage:
        @tool(name="web_search", description="Search the web for information")
        async def web_search(query: str) -> str:
            return "search results..."
    """

    def decorator(func: Callable) -> Callable:
        from tools.registry import tool_registry

        tool_instance = SimpleTool(name=name, description=description, func=func)
        tool_registry.register(tool_instance)
        logger.debug(f"Registered tool via decorator: {name}")

        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return func(*args, **kwargs)

        wrapper._tool_instance = tool_instance  # type: ignore[attr-defined]
        return wrapper

    return decorator
