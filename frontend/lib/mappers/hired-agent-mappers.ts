import type { HiredAgent, HiredAgentDetail } from "@/lib/types";

export function mapHiredAgent(raw: Record<string, unknown>): HiredAgent {
  const stats = raw.stats as Record<string, unknown>;
  return {
    hireId: raw.hire_id as string,
    agentId: raw.agent_id as string,
    agentName: raw.agent_name as string,
    agentRole: raw.agent_role as string,
    agentColor: raw.agent_color as string,
    status: raw.status as HiredAgent["status"],
    plan: raw.plan as string,
    weeklyBudgetUsd: raw.weekly_budget_usd as number,
    hiredAt: raw.hired_at as string,
    renewsAt: (raw.renews_at as string) ?? null,
    stats: {
      totalTasks: (stats.total_tasks as number) ?? 0,
      successRate: (stats.success_rate as number) ?? 0,
      avgCostUsd: (stats.avg_cost_usd as number) ?? 0,
    },
    hasCustomInstructions: raw.has_custom_instructions as boolean,
    knowledgeFileCount: raw.knowledge_file_count as number,
  };
}

export function mapHiredAgentDetail(raw: Record<string, unknown>): HiredAgentDetail {
  const base = mapHiredAgent(raw);
  const rawStats = raw.stats as Record<string, unknown>;
  const rawCost = raw.cost as Record<string, unknown>;
  const rawSettings = raw.settings as Record<string, unknown>;
  const rawKnowledge = (rawSettings.knowledge_files as Array<Record<string, unknown>>) ?? [];

  return {
    ...base,
    agentTools: (raw.agent_tools as string[]) ?? [],
    agentLlm: (raw.agent_llm as string) ?? "Unknown",
    settings: {
      customInstructions: (rawSettings.custom_instructions as string) ?? "",
      knowledgeFiles: rawKnowledge.map((kf) => ({
        id: kf.id as string,
        name: kf.name as string,
        sizeBytes: kf.size_bytes as number,
        uploadedAt: kf.uploaded_at as string,
      })),
    },
    stats: {
      totalTasks: (rawStats.total_tasks as number) ?? 0,
      successRate: (rawStats.success_rate as number) ?? 0,
      avgCostUsd: (rawStats.avg_cost_usd as number) ?? 0,
      completed: (rawStats.completed as number) ?? 0,
      failed: (rawStats.failed as number) ?? 0,
      active: (rawStats.active as number) ?? 0,
      avgRuntimeSeconds: (rawStats.avg_runtime_seconds as number) ?? 0,
      totalSpentUsd: (rawStats.total_spent_usd as number) ?? 0,
      dailyTasks: (rawStats.daily_tasks as number[]) ?? [],
    },
    cost: {
      spentUsd: (rawCost.spent_usd as number) ?? 0,
      budgetUsd: (rawCost.budget_usd as number) ?? 0,
      lastWeekSpentUsd: (rawCost.last_week_spent_usd as number) ?? 0,
      thisWeekSpentUsd: (rawCost.this_week_spent_usd as number) ?? 0,
      breakdown: ((rawCost.breakdown as Array<Record<string, unknown>>) ?? []).map((seg) => ({
        label: seg.label as string,
        amount: seg.amount as number,
        percentage: seg.percentage as number,
        color: seg.color as string,
      })),
    },
  };
}
