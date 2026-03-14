"""Agent definitions package."""

import logging
from pathlib import Path

from agents.config import AgentConfig, TaskInput, TaskResult
from agents.registry import agent_registry, AgentRegistry
from agents.coder import CoderAgent
from agents.researcher import ResearcherAgent
from agents.pm import PMAgent
from agents.qa import QAAgent
from agents.copywriter import CopywriterAgent

logger = logging.getLogger(__name__)

CONFIGS_DIR = Path(__file__).parent / "configs"

__all__ = [
    "AgentConfig",
    "TaskInput",
    "TaskResult",
    "agent_registry",
    "AgentRegistry",
    "CoderAgent",
    "ResearcherAgent",
    "PMAgent",
    "QAAgent",
    "CopywriterAgent",
    "initialize_agents",
]


def initialize_agents() -> None:
    """Load YAML configs and register agent classes. Called at app startup."""
    agent_registry.register_class("coder", CoderAgent)
    agent_registry.register_class("researcher", ResearcherAgent)
    agent_registry.register_class("pm", PMAgent)
    agent_registry.register_class("qa", QAAgent)
    agent_registry.register_class("copywriter", CopywriterAgent)

    if CONFIGS_DIR.is_dir():
        agent_registry.load_from_directory(CONFIGS_DIR)
        logger.info(f"Loaded {len(agent_registry.list_agents())} agent configs")
    else:
        logger.warning(f"Agent configs directory not found: {CONFIGS_DIR}")
