import type { AgentUsage } from "@/lib/types";

interface UsageChartProps {
  usages: AgentUsage[];
  totalSpent: number;
  weeklyBudget: number;
}

export function UsageChart({ usages, totalSpent, weeklyBudget }: UsageChartProps) {
  const conicSegments = usages.reduce<string[]>((segments, usage, index) => {
    const prevEnd = index === 0 ? 0 : usages.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
    const end = prevEnd + usage.percentage;
    segments.push(`${usage.color} ${prevEnd}% ${end}%`);
    return segments;
  }, []);

  const conicGradient = `conic-gradient(${conicSegments.join(", ")})`;

  return (
    <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
      <div className="text-sm font-semibold mb-4">Usage This Week</div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative w-28 h-28 shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background: conicGradient }}
          />
          <div className="absolute inset-3 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">${totalSpent}</div>
              <div className="text-[10px] text-text-muted">of ${weeklyBudget}</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {usages.map((usage) => (
            <div key={usage.agentId} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: usage.color }} />
              <span className="flex-1 text-text-secondary">{usage.agentName}</span>
              <span className="font-semibold">${usage.amountUsd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
