import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8000";

export const handlers = [
  http.get(`${API_BASE}/api/agents/`, () => {
    return HttpResponse.json({
      agents: [
        {
          id: "coder",
          name: "Coder Agent",
          role: "Software Developer",
          pricing_cents_per_run: 100,
          tools: ["code_interpreter", "github"],
          goal: "Write clean code",
        },
        {
          id: "research",
          name: "Research Agent",
          role: "Researcher",
          pricing_cents_per_run: 50,
          tools: ["web_search"],
          goal: "Research topics",
        },
      ],
    });
  }),

  http.get(`${API_BASE}/api/agents/:agentId`, ({ params }) => {
    return HttpResponse.json({
      id: params.agentId,
      name: "Coder Agent",
      role: "Software Developer",
      pricing_cents_per_run: 100,
      tools: ["code_interpreter"],
      goal: "Write clean code",
    });
  }),

  http.get(`${API_BASE}/api/tasks/`, () => {
    return HttpResponse.json({
      tasks: [
        {
          task_id: "task-1",
          status: "completed",
          agent_id: "coder",
          goal: "Write unit tests",
          context: "For the frontend",
          budget_usd: 50,
          created_at: "2026-03-15",
        },
        {
          task_id: "task-2",
          status: "running",
          agent_id: "research",
          goal: "Research AI trends",
          budget_usd: 30,
          created_at: "2026-03-15",
        },
      ],
    });
  }),

  http.get(`${API_BASE}/api/tasks/:taskId`, ({ params }) => {
    return HttpResponse.json({
      task_id: params.taskId,
      status: "completed",
      agent_id: "coder",
      goal: "Write unit tests",
      context: "For the frontend",
      budget_usd: 50,
      created_at: "2026-03-15",
    });
  }),

  http.post(`${API_BASE}/api/tasks/`, () => {
    return HttpResponse.json({ task_id: "task-new", status: "queued" });
  }),

  http.get(`${API_BASE}/api/agents/hired/`, () => {
    return HttpResponse.json({
      hired_agents: [
        {
          hire_id: "hire-1",
          agent_id: "coder",
          agent_name: "Coder Agent",
          agent_role: "Developer",
          agent_color: "#3B82F6",
          status: "active",
          plan: "solo",
          weekly_budget_usd: 100,
          hired_at: "2026-03-01",
          renews_at: "2026-03-22",
          stats: { total_tasks: 10, success_rate: 95, avg_cost_usd: 2.5 },
          has_custom_instructions: false,
          knowledge_file_count: 0,
        },
      ],
    });
  }),
];
