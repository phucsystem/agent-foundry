"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { HiredAgent } from "@/lib/types";

interface HiredAgentRowProps {
  agent: HiredAgent;
  onSettings: (hireId: string) => void;
  onCancel: (hireId: string) => void;
  onRehire: (hireId: string) => void;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "neutral"> = {
  active: "success",
  renewing_soon: "warning",
  cancelled: "error",
  expired: "neutral",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function HiredAgentRow({ agent, onSettings, onCancel, onRehire }: HiredAgentRowProps) {
  const isCancelled = agent.status === "cancelled" || agent.status === "expired";
  const initials = agent.agentName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/agents/hired/${agent.hireId}`}
      className={`flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#020617] border border-border rounded-lg transition-shadow hover:shadow-md no-underline text-inherit cursor-pointer ${isCancelled ? "opacity-60" : ""}`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ backgroundColor: agent.agentColor }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{agent.agentName}</div>
        <div className="text-xs text-text-muted truncate">
          {agent.plan.charAt(0).toUpperCase() + agent.plan.slice(1)} ${agent.weeklyBudgetUsd}/wk
          {agent.renewsAt && ` \u00B7 Renews ${formatDate(agent.renewsAt)}`}
        </div>
      </div>

      <Badge variant={STATUS_VARIANT[agent.status] ?? "neutral"}>
        {agent.status === "renewing_soon" ? "Renewing" : agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
      </Badge>

      <div className="flex gap-6 shrink-0">
        <div className="text-center min-w-[56px]">
          <div className="text-sm font-bold">{agent.stats.totalTasks}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Tasks</div>
        </div>
        <div className="text-center min-w-[56px]">
          <div className="text-sm font-bold">
            {agent.stats.totalTasks > 0 ? `${agent.stats.successRate}%` : "--"}
          </div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Success</div>
        </div>
        <div className="text-center min-w-[56px]">
          <div className="text-sm font-bold">
            {agent.stats.totalTasks > 0 ? `$${agent.stats.avgCostUsd.toFixed(2)}` : "--"}
          </div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Avg Cost</div>
        </div>
      </div>

      <div
        className="flex gap-1 shrink-0"
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
      >
        {isCancelled && (
          <button
            onClick={() => onRehire(agent.hireId)}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-white dark:bg-[#020617] text-text-secondary hover:bg-surface hover:text-success transition-colors"
            title="Re-hire"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onSettings(agent.hireId)}
          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-white dark:bg-[#020617] text-text-secondary hover:bg-surface hover:text-primary transition-colors"
          title="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        {!isCancelled && (
          <button
            onClick={() => onCancel(agent.hireId)}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-lg bg-white dark:bg-[#020617] text-text-secondary hover:bg-surface hover:text-error transition-colors"
            title="Cancel hire"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </Link>
  );
}
