import { describe, it, expect } from "vitest";
import {
  mapHiredAgent,
  mapHiredAgentDetail,
} from "@/lib/mappers/hired-agent-mappers";

const rawHiredAgent = {
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
  has_custom_instructions: true,
  knowledge_file_count: 3,
};

describe("mapHiredAgent", () => {
  it("maps snake_case backend fields to camelCase", () => {
    const result = mapHiredAgent(rawHiredAgent);
    expect(result.hireId).toBe("hire-1");
    expect(result.agentId).toBe("coder");
    expect(result.agentName).toBe("Coder Agent");
    expect(result.agentRole).toBe("Developer");
    expect(result.status).toBe("active");
    expect(result.weeklyBudgetUsd).toBe(100);
    expect(result.hasCustomInstructions).toBe(true);
    expect(result.knowledgeFileCount).toBe(3);
  });

  it("maps nested stats correctly", () => {
    const result = mapHiredAgent(rawHiredAgent);
    expect(result.stats.totalTasks).toBe(10);
    expect(result.stats.successRate).toBe(95);
    expect(result.stats.avgCostUsd).toBe(2.5);
  });

  it("handles null renews_at", () => {
    const raw = { ...rawHiredAgent, renews_at: null };
    const result = mapHiredAgent(raw);
    expect(result.renewsAt).toBeNull();
  });
});

describe("mapHiredAgentDetail", () => {
  const rawDetail = {
    ...rawHiredAgent,
    agent_tools: ["code_interpreter", "github"],
    agent_llm: "Claude Sonnet",
    settings: {
      custom_instructions: "Be concise",
      knowledge_files: [
        {
          id: "f1",
          name: "guide.pdf",
          size_bytes: 2048,
          uploaded_at: "2026-03-10",
        },
      ],
    },
    stats: {
      total_tasks: 10,
      success_rate: 95,
      avg_cost_usd: 2.5,
      completed: 8,
      failed: 2,
      active: 0,
      avg_runtime_seconds: 45,
      total_spent_usd: 25,
      daily_tasks: [1, 2, 3],
    },
    cost: {
      spent_usd: 25,
      budget_usd: 100,
      last_week_spent_usd: 10,
      this_week_spent_usd: 15,
      breakdown: [
        { label: "LLM", amount: 20, percentage: 80, color: "#3B82F6" },
      ],
    },
  };

  it("includes base hired agent fields", () => {
    const result = mapHiredAgentDetail(rawDetail);
    expect(result.hireId).toBe("hire-1");
    expect(result.agentName).toBe("Coder Agent");
  });

  it("maps agent tools and LLM", () => {
    const result = mapHiredAgentDetail(rawDetail);
    expect(result.agentTools).toEqual(["code_interpreter", "github"]);
    expect(result.agentLlm).toBe("Claude Sonnet");
  });

  it("maps settings with knowledge files", () => {
    const result = mapHiredAgentDetail(rawDetail);
    expect(result.settings.customInstructions).toBe("Be concise");
    expect(result.settings.knowledgeFiles).toHaveLength(1);
    expect(result.settings.knowledgeFiles[0].name).toBe("guide.pdf");
    expect(result.settings.knowledgeFiles[0].sizeBytes).toBe(2048);
  });

  it("maps extended stats", () => {
    const result = mapHiredAgentDetail(rawDetail);
    expect(result.stats.completed).toBe(8);
    expect(result.stats.failed).toBe(2);
    expect(result.stats.avgRuntimeSeconds).toBe(45);
    expect(result.stats.totalSpentUsd).toBe(25);
    expect(result.stats.dailyTasks).toEqual([1, 2, 3]);
  });

  it("maps cost overview with breakdown", () => {
    const result = mapHiredAgentDetail(rawDetail);
    expect(result.cost.spentUsd).toBe(25);
    expect(result.cost.budgetUsd).toBe(100);
    expect(result.cost.breakdown).toHaveLength(1);
    expect(result.cost.breakdown[0].label).toBe("LLM");
    expect(result.cost.breakdown[0].percentage).toBe(80);
  });
});
