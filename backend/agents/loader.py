"""YAML config loader with single-level inheritance support."""

import logging
from pathlib import Path
from typing import Any

import yaml

from agents.config import AgentConfig
from agents.exceptions import AgentConfigError

logger = logging.getLogger(__name__)


def load_yaml_file(path: Path) -> dict[str, Any]:
    """Read a YAML file and return its contents as a dict."""
    try:
        with open(path) as file_handle:
            data = yaml.safe_load(file_handle)
            if not isinstance(data, dict):
                raise AgentConfigError(f"YAML file must contain a mapping: {path}")
            return data
    except FileNotFoundError:
        raise AgentConfigError(f"Config file not found: {path}")
    except yaml.YAMLError as error:
        raise AgentConfigError(f"Invalid YAML in {path}: {error}")


def merge_configs(parent: dict[str, Any], child: dict[str, Any]) -> dict[str, Any]:
    """Merge parent and child configs. Child values override parent.

    Nested dicts (llm, guardrails) merge one level deep.
    Lists replace entirely (no append).
    """
    merged = {**parent}
    for key, value in child.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = {**merged[key], **value}
        else:
            merged[key] = value
    return merged


def load_agent_config(path: Path, configs_dir: Path | None = None) -> AgentConfig:
    """Load an agent config from YAML with optional inheritance."""
    raw = load_yaml_file(path)
    extends = raw.pop("extends", None)

    if extends and configs_dir:
        parent_path = configs_dir / extends
        parent_raw = load_yaml_file(parent_path)
        parent_raw.pop("extends", None)
        raw = merge_configs(parent_raw, raw)

    return AgentConfig(**raw)


def load_all_configs(configs_dir: Path) -> list[AgentConfig]:
    """Load all agent configs from a directory. Skip base templates."""
    configs: list[AgentConfig] = []

    for yaml_path in sorted(configs_dir.glob("*.yaml")):
        if yaml_path.stem.startswith("base"):
            continue
        try:
            config = load_agent_config(yaml_path, configs_dir=configs_dir)
            configs.append(config)
            logger.info(f"Loaded agent config: {config.id} (v{config.version})")
        except (AgentConfigError, ValueError) as error:
            logger.warning(f"Skipping invalid config {yaml_path.name}: {error}")

    return sorted(configs, key=lambda cfg: cfg.id)
