import type { CostSegment } from "@/lib/types";

interface CostBreakdownProps {
  segments: CostSegment[];
}

export function CostBreakdown({ segments }: CostBreakdownProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-border rounded-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`h-full rounded-full ${segment.color}`}
            style={{ width: `${segment.percentage}%` }}
          />
        ))}
      </div>

      <div className="flex gap-6 text-sm flex-wrap">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${segment.color}`} />
            {segment.label} <strong>${segment.amount.toFixed(2)}</strong> ({segment.percentage}%)
          </div>
        ))}
      </div>
    </div>
  );
}
