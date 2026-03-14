"""Agent registry — discover, register, and instantiate agents."""

import logging
from pathlib import Path

from agents.config import AgentConfig, TaskInput, TaskResult
from agents.exceptions import AgentNotFoundError

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Central registry for agent configs and implementation classes."""

    def __init__(self) -> None:
        self._configs: dict[str, AgentConfig] = {}
        self._agent_classes: dict[str, type] = {}

    def register_config(self, config: AgentConfig) -> None:
        """Register an agent config by id."""
        if config.id in self._configs:
            logger.warning(f"Overwriting existing config for agent '{config.id}'")
        self._configs[config.id] = config

    def register_class(self, agent_id: str, agent_class: type) -> None:
        """Map agent id to its implementation class."""
        self._agent_classes[agent_id] = agent_class

    def get_config(self, agent_id: str) -> AgentConfig:
        """Get config or raise AgentNotFoundError."""
        if agent_id not in self._configs:
            raise AgentNotFoundError(f"Agent '{agent_id}' not found in registry")
        return self._configs[agent_id]

    def get_agent(self, agent_id: str):
        """Instantiate agent from config + registered class."""
        config = self.get_config(agent_id)
        agent_class = self._agent_classes.get(agent_id, GenericAgent)
        return agent_class(config=config)

    def list_agents(self) -> list[AgentConfig]:
        """Return all registered agent configs."""
        return list(self._configs.values())

    def load_from_directory(self, configs_dir: Path) -> None:
        """Auto-discover and register all YAML configs from dir."""
        from agents.loader import load_all_configs

        for config in load_all_configs(configs_dir):
            self.register_config(config)


class GenericAgent:
    """Fallback for configs without a custom class. Delegates to BaseAgent."""

    def __init__(self, config: AgentConfig) -> None:
        from agents.base import BaseAgent

        class _Fallback(BaseAgent):
            pass

        self._delegate = _Fallback(config=config)
        self.config = config
        self.agent_id = config.id
        self.name = config.name
        self.role = config.role

    async def execute(self, task: TaskInput) -> TaskResult:
        return await self._delegate.execute(task)


agent_registry = AgentRegistry()
