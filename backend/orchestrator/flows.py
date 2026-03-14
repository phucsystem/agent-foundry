"""CrewAI-style sequential and parallel execution flows."""

import asyncio
import logging
import time

from orchestrator.state import AgentResult, WorkflowState

logger = logging.getLogger(__name__)


class SequentialFlow:
    """Execute agents in sequence. Output of A feeds context of B."""

    async def execute(self, state: WorkflowState, agent_ids: list[str]) -> WorkflowState:
        """Run agents sequentially, chaining outputs as context."""
        from agents import agent_registry
        from agents.config import TaskInput

        accumulated_context = state.context

        for agent_id in agent_ids:
            logger.info(f"Sequential flow: running {agent_id} for task {state.task_id}")
            start = time.monotonic()

            try:
                agent = agent_registry.get_agent(agent_id)
                task_input = TaskInput(
                    task_id=state.task_id,
                    agent_id=agent_id,
                    goal=state.goal,
                    context=accumulated_context,
                )
                result = await agent.execute(task_input)

                agent_result = AgentResult(
                    agent_id=agent_id,
                    status=result.status,
                    output=result.output,
                    cost_usd=result.cost_usd,
                    duration_seconds=time.monotonic() - start,
                )
                state.agent_results[agent_id] = agent_result

                if result.status == "completed":
                    accumulated_context += f"\n\n--- Output from {agent_id} ---\n{result.output}"
                else:
                    state.error_count += 1
                    if state.error_count >= state.max_errors:
                        logger.error("Max errors reached in sequential flow")
                        break

            except Exception as error:
                logger.error(f"Sequential flow error for {agent_id}: {error}")
                state.agent_results[agent_id] = AgentResult(
                    agent_id=agent_id,
                    status="failed",
                    output="",
                    duration_seconds=time.monotonic() - start,
                )
                state.error_count += 1

        state.current_step = "complete"
        return state


class ParallelFlow:
    """Execute multiple agents concurrently. Results aggregated."""

    async def execute(self, state: WorkflowState, agent_ids: list[str]) -> WorkflowState:
        """Run agents in parallel, collect all results."""
        from agents import agent_registry
        from agents.config import TaskInput

        async def run_agent(agent_id: str) -> AgentResult:
            start = time.monotonic()
            try:
                agent = agent_registry.get_agent(agent_id)
                task_input = TaskInput(
                    task_id=state.task_id,
                    agent_id=agent_id,
                    goal=state.goal,
                    context=state.context,
                )
                result = await agent.execute(task_input)
                return AgentResult(
                    agent_id=agent_id,
                    status=result.status,
                    output=result.output,
                    cost_usd=result.cost_usd,
                    duration_seconds=time.monotonic() - start,
                )
            except Exception as error:
                logger.error(f"Parallel flow error for {agent_id}: {error}")
                return AgentResult(
                    agent_id=agent_id,
                    status="failed",
                    output=str(error),
                    duration_seconds=time.monotonic() - start,
                )

        logger.info(f"Parallel flow: running {agent_ids} for task {state.task_id}")
        results = await asyncio.gather(*[run_agent(aid) for aid in agent_ids])

        for agent_result in results:
            state.agent_results[agent_result.agent_id] = agent_result
            if agent_result.status == "failed":
                state.error_count += 1

        state.current_step = "complete"
        return state
