"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import type { AgentCostOverview as CostData } from "@/lib/types";

interface AgentCostOverviewProps {
  cost: CostData;
}

export function AgentCostOverview({ cost }: AgentCostOverviewProps) {
  const usedPct = cost.budgetUsd > 0 ? Math.min((cost.spentUsd / cost.budgetUsd) * 100, 100) : 0;
  const change = cost.thisWeekSpentUsd - cost.lastWeekSpentUsd;
  const changePct = cost.lastWeekSpentUsd > 0
    ? ((change / cost.lastWeekSpentUsd) * 100).toFixed(1)
    : "0";

  return (
    <div className="bg-white dark:bg-[#020617] border border-border rounded-lg p-6">
      <div className="flex items-center justify-between text-sm font-semibold mb-4">
        Cost Overview
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">${cost.spentUsd.toFixed(2)} used</span>
          <span className="text-text-muted">of ${cost.budgetUsd}/wk budget</span>
        </div>
        <ProgressBar percentage={usedPct} />
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Spend Breakdown
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden my-2">
          {cost.breakdown.map((segment) => (
            <div
              key={segment.label}
              className="h-full transition-[width] duration-300"
              style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {cost.breakdown.map((segment) => (
            <div key={segment.label} className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
              {segment.label} ${segment.amount.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
          Week Comparison
        </div>
        <div className="flex justify-between items-center py-1 text-sm">
          <span className="text-text-secondary">This week</span>
          <span className="font-semibold">${cost.thisWeekSpentUsd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1 text-sm">
          <span className="text-text-secondary">Last week</span>
          <span className="font-semibold">${cost.lastWeekSpentUsd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1 text-sm">
          <span className="text-text-secondary">Change</span>
          <span className={`font-semibold ${change > 0 ? "text-error" : change < 0 ? "text-success" : ""}`}>
            {change >= 0 ? "+" : ""}${change.toFixed(2)} ({change >= 0 ? "+" : ""}{changePct}%)
          </span>
        </div>
      </div>
    </div>
  );
}
