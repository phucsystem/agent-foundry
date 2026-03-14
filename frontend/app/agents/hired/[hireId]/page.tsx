"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useHiredAgentDetail, useHiredAgentTasks } from "@/lib/hooks/use-hired-agents";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { KnowledgeSummary } from "@/components/agents/knowledge-summary";
import { AgentCostOverview } from "@/components/agents/agent-cost-overview";
import { AgentTaskChart } from "@/components/agents/agent-task-chart";
import { AgentRecentTasks } from "@/components/agents/agent-recent-tasks";
import { AgentSettingsModal } from "@/components/agents/agent-settings-modal";

interface HiredAgentDetailPageProps {
  params: Promise<{ hireId: string }>;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "neutral"> = {
  active: "success",
  renewing_soon: "warning",
  cancelled: "error",
  expired: "neutral",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HiredAgentDetailPage({ params }: HiredAgentDetailPageProps) {
  const { hireId } = use(params);
  const { data: detail, isLoading, error } = useHiredAgentDetail(hireId);
  const { data: tasksData } = useHiredAgentTasks(hireId, 5);
  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) {
    return <div className="text-center py-12 text-text-secondary">Loading agent details...</div>;
  }

  if (error || !detail) {
    return (
      <div className="text-center py-12 text-error">
        {error ? "Failed to load agent details." : "Agent not found."}
      </div>
    );
  }

  const initials = detail.agentName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="mb-4">
        <Link href="/agents/hired" className="text-sm text-text-muted no-underline hover:text-primary">
          &larr; Back to My Team
        </Link>
      </div>

      {/* Agent Header */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#020617] border border-border rounded-lg mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ backgroundColor: detail.agentColor }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold mb-0.5">{detail.agentName}</div>
          <div className="text-sm text-text-secondary">{detail.agentRole}</div>
          <div className="text-xs text-text-muted">
            {detail.plan.charAt(0).toUpperCase() + detail.plan.slice(1)} ${detail.weeklyBudgetUsd}/wk
            {" \u00B7 "}Hired {formatDate(detail.hiredAt)}
            {detail.renewsAt && ` \u00B7 Renews ${formatDate(detail.renewsAt)}`}
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[detail.status] ?? "neutral"}>
          {detail.status === "renewing_soon" ? "Renewing" : detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
        </Badge>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/tasks/new?agent=${detail.agentId}`}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium no-underline hover:opacity-90"
          >
            Assign Task
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
          >
            Edit Settings
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Tasks" value={String(detail.stats.totalTasks)} change={`${detail.stats.active} active`} changeType="positive" />
        <KpiCard label="Success Rate" value={`${detail.stats.successRate}%`} change={`${detail.stats.completed} completed`} changeType="positive" />
        <KpiCard label="Avg Runtime" value={`${Math.round(detail.stats.avgRuntimeSeconds)}s`} change="per task" changeType="positive" />
        <KpiCard label="Avg Cost / Task" value={`$${detail.stats.avgCostUsd.toFixed(2)}`} change={`$${detail.stats.totalSpentUsd.toFixed(2)} total`} changeType="positive" />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <KnowledgeSummary
          customInstructions={detail.settings.customInstructions}
          knowledgeFiles={detail.settings.knowledgeFiles}
          tools={detail.agentTools}
          llm={detail.agentLlm}
          onEdit={() => setShowSettings(true)}
        />
        <AgentCostOverview cost={detail.cost} />
      </div>

      {/* Full-width sections */}
      <div className="flex flex-col gap-4">
        <AgentTaskChart
          dailyTasks={detail.stats.dailyTasks}
          completed={detail.stats.completed}
          failed={detail.stats.failed}
          running={detail.stats.active}
          queued={0}
        />
        <AgentRecentTasks
          tasks={tasksData?.tasks ?? []}
          totalCount={tasksData?.total ?? 0}
          agentId={detail.agentId}
        />
      </div>

      {showSettings && (
        <AgentSettingsModal
          hireId={hireId}
          agentName={detail.agentName}
          agentColor={detail.agentColor}
          isOpen={true}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
