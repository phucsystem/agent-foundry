"""LangGraph-style workflow graph with conditional routing."""

import logging
import time
from typing import Callable

from orchestrator.state import AgentResult, WorkflowState
from orchestrator.router import task_router

logger = logging.getLogger(__name__)


class WorkflowGraph:
    """Simple workflow graph with conditional routing.

    Nodes are async functions that take WorkflowState and return WorkflowState.
    Edges define transitions. Conditional edges use a router function.
    """

    def __init__(self) -> None:
        self._nodes: dict[str, Callable] = {}
        self._edges: dict[str, str] = {}
        self._conditional_edges: dict[str, Callable] = {}
        self._start_node: str = ""

    def add_node(self, name: str, func: Callable) -> None:
        self._nodes[name] = func

    def add_edge(self, from_node: str, to_node: str) -> None:
        self._edges[from_node] = to_node

    def add_conditional_edge(self, from_node: str, router_func: Callable) -> None:
        self._conditional_edges[from_node] = router_func

    def set_start(self, node_name: str) -> None:
        self._start_node = node_name

    async def execute(self, state: WorkflowState) -> WorkflowState:
        """Execute the graph from start node to completion."""
        current = self._start_node
        visited: set[str] = set()
        max_steps = 10  # prevent infinite loops

        for step_index in range(max_steps):
            if current == "end" or current not in self._nodes:
                break

            if current in visited:
                logger.warning(f"Graph cycle detected at {current}, stopping")
                break
            visited.add(current)

            logger.info(f"Graph step {step_index}: executing node '{current}'")
            state.current_step = current

            node_func = self._nodes[current]
            state = await node_func(state)

            if current in self._conditional_edges:
                next_node = self._conditional_edges[current](state)
            elif current in self._edges:
                next_node = self._edges[current]
            else:
                next_node = "end"

            current = next_node

        state.current_step = "complete"
        return state


def build_default_graph() -> WorkflowGraph:
    """Build the default agent routing graph."""
    graph = WorkflowGraph()

    async def classify_node(state: WorkflowState) -> WorkflowState:
        """Classify the task and store routing decision."""
        agent_id = task_router.classify(state.goal)
        state.current_step = f"routed_to_{agent_id}"
        return state

    async def execute_agent_node(state: WorkflowState) -> WorkflowState:
        """Execute the routed agent."""
        from agents import agent_registry
        from agents.config import TaskInput

        agent_id = state.current_step.replace("routed_to_", "")
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
            state.agent_results[agent_id] = AgentResult(
                agent_id=agent_id,
                status=result.status,
                output=result.output,
                cost_usd=result.cost_usd,
                duration_seconds=time.monotonic() - start,
            )
        except Exception as error:
            logger.error(f"Agent execution failed: {error}")
            state.agent_results[agent_id] = AgentResult(
                agent_id=agent_id,
                status="failed",
                output=str(error),
                duration_seconds=time.monotonic() - start,
            )
            state.error_count += 1

        return state

    def route_decision(state: WorkflowState) -> str:
        return "execute"

    graph.add_node("classify", classify_node)
    graph.add_node("execute", execute_agent_node)
    graph.set_start("classify")
    graph.add_conditional_edge("classify", route_decision)
    graph.add_edge("execute", "end")

    return graph


default_graph = build_default_graph()
