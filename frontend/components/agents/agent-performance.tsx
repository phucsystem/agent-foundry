import type { PerformanceMetric } from "@/lib/types";

interface AgentPerformanceProps {
  metrics: PerformanceMetric[];
}

export function AgentPerformance({ metrics }: AgentPerformanceProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Performance Breakdown</h2>
      <div className="bg-white dark:bg-slate-800 border border-border rounded-md p-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`flex items-center gap-4 py-2.5 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <span className="w-[140px] text-sm text-text-secondary shrink-0">{metric.label}</span>
            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${metric.color}`}
                style={{ width: `${metric.value}%`, transition: "width 0.6s ease" }}
              />
            </div>
            <span className={`w-[50px] text-right text-sm font-semibold ${metric.value >= 90 ? "text-success" : "text-primary"}`}>
              {metric.value}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
