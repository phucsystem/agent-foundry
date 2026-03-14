"""GitHub MCP tool — stub wrapper for GitHub operations via MCP protocol."""

import logging
import os
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")


class GitHubMCPTool(BaseTool):
    """Wraps GitHub operations (search, read, issues, PRs) via MCP protocol.

    Currently a stub — real integration requires npx MCP server runtime.
    TODO: Wire to MCPServerAdapter when npx runtime is available.
    """

    name = "github_mcp"
    description = "Search code, read files, create issues/PRs on GitHub"

    async def execute(self, **kwargs: Any) -> str:
        """Dispatch to the appropriate GitHub action.

        Args:
            action: One of search_code | read_file | create_issue | create_pr
            **kwargs: Action-specific parameters
        """
        action = kwargs.get("action", "search_code")
        dispatch = {
            "search_code": self._search_code,
            "read_file": self._read_file,
            "create_issue": self._create_issue,
            "create_pr": self._create_pr,
        }
        handler = dispatch.get(action)
        if handler is None:
            return f"Unknown action '{action}'. Available: {list(dispatch.keys())}"
        return await handler(**kwargs)

    async def _search_code(self, **kwargs: Any) -> str:
        """Search code across GitHub repositories.

        TODO: Use MCPServerAdapter with github MCP server (npx @modelcontextprotocol/server-github)
        """
        query = kwargs.get("query", "")
        repo = kwargs.get("repo", "")
        logger.info(f"github_mcp.search_code query={query!r} repo={repo!r}")
        return f"[stub] search_code: query={query!r}, repo={repo!r}. No real MCP connection yet."

    async def _read_file(self, **kwargs: Any) -> str:
        """Read a file from a GitHub repository.

        TODO: Wire to MCP tool call 'read_file' on github MCP server.
        """
        path = kwargs.get("path", "")
        repo = kwargs.get("repo", "")
        ref = kwargs.get("ref", "main")
        logger.info(f"github_mcp.read_file repo={repo!r} path={path!r} ref={ref!r}")
        return f"[stub] read_file: repo={repo!r}, path={path!r}, ref={ref!r}. No real MCP connection yet."

    async def _create_issue(self, **kwargs: Any) -> str:
        """Create a GitHub issue.

        TODO: Wire to MCP tool call 'create_issue' on github MCP server.
        """
        repo = kwargs.get("repo", "")
        title = kwargs.get("title", "")
        body = kwargs.get("body", "")
        logger.info(f"github_mcp.create_issue repo={repo!r} title={title!r}")
        return f"[stub] create_issue: repo={repo!r}, title={title!r}. No real MCP connection yet."

    async def _create_pr(self, **kwargs: Any) -> str:
        """Create a GitHub pull request.

        TODO: Wire to MCP tool call 'create_pull_request' on github MCP server.
        """
        repo = kwargs.get("repo", "")
        title = kwargs.get("title", "")
        head = kwargs.get("head", "")
        base = kwargs.get("base", "main")
        body = kwargs.get("body", "")
        logger.info(f"github_mcp.create_pr repo={repo!r} title={title!r} head={head!r} -> {base!r}")
        return f"[stub] create_pr: repo={repo!r}, head={head!r}->{base!r}, title={title!r}. No real MCP connection yet."


tool_registry.register(GitHubMCPTool())
