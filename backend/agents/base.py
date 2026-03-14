"""Base agent class defining the agent contract."""

import logging
import time
from abc import ABC

from agents.config import AgentConfig, TaskInput, TaskResult

logger = logging.getLogger(__name__)

__all__ = ["BaseAgent", "TaskInput", "TaskResult", "AgentConfig"]


class BaseAgent(ABC):
    """Abstract base agent — all agents inherit from this.

    Subclasses can override `expected_output` property to customize
    the CrewAI task expected output string.
    """

    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self.agent_id = config.id
        self.name = config.name
        self.role = config.role
        self.guardrail_pipeline = self._build_guardrail_pipeline()

    @property
    def expected_output(self) -> str:
        """Override in subclass to customize CrewAI task expected output."""
        return "Structured response"

    async def execute(self, task: TaskInput) -> TaskResult:
        """Execute a task through guardrails + CrewAI. Override for custom logic."""
        start_time = time.monotonic()

        await self.guardrail_pipeline.run_input_checks(
            task, self.config.guardrails
        )

        crewai_agent = self._create_crewai_agent(tools=self._resolve_tools())

        try:
            from crewai import Task as CrewAITask, Crew

            crewai_task = CrewAITask(
                description=task.goal,
                expected_output=self.expected_output,
                agent=crewai_agent,
            )
            crew = Crew(agents=[crewai_agent], tasks=[crewai_task], verbose=False)
            crew_result = crew.kickoff()

            result = TaskResult(
                task_id=task.task_id,
                agent_id=self.config.id,
                status="completed",
                output=str(crew_result),
                duration_seconds=time.monotonic() - start_time,
            )
        except Exception as error:
            logger.error(f"{self.agent_id} execution failed: {error}")
            result = TaskResult(
                task_id=task.task_id,
                agent_id=self.config.id,
                status="failed",
                output="",
                error=str(error),
                duration_seconds=time.monotonic() - start_time,
            )

        try:
            await self.guardrail_pipeline.run_output_checks(
                result, self.config.guardrails
            )
        except Exception as guardrail_error:
            logger.warning(f"Output guardrail warning: {guardrail_error}")

        return result

    def _create_crewai_llm(self):
        """Create a CrewAI LLM instance from agent config."""
        from crewai import LLM

        return LLM(
            model=self.config.llm.model,
            base_url=self.config.llm.base_url,
            api_key=self.config.llm.api_key,
            temperature=self.config.llm.temperature,
            max_tokens=self.config.llm.max_tokens,
        )

    def _create_crewai_agent(self, tools: list | None = None):
        """Create a CrewAI Agent instance from config."""
        from crewai import Agent

        return Agent(
            role=self.config.role,
            goal=self.config.goal,
            backstory=self.config.backstory,
            llm=self._create_crewai_llm(),
            tools=tools or [],
            memory=self.config.memory_enabled,
            verbose=False,
        )

    def _resolve_tools(self) -> list:
        """Resolve tool names from config to CrewAI tool objects."""
        from tools import tool_registry

        return tool_registry.get_crewai_tools(self.config.tools)

    def _build_guardrail_pipeline(self):
        """Build the default guardrail pipeline for this agent."""
        from guardrails import GuardrailPipeline, CostGuardrail, OutputGuardrail, InputGuardrail

        pipeline = GuardrailPipeline()
        pipeline.add(InputGuardrail())
        pipeline.add(CostGuardrail())
        pipeline.add(OutputGuardrail())
        return pipeline
