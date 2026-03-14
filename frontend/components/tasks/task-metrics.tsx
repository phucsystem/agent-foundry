import type { TaskMetric } from "@/lib/types";

interface TaskMetricsProps {
  metrics: TaskMetric[];
}

export function TaskMetrics({ metrics }: TaskMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-start gap-4 p-6 bg-white dark:bg-slate-800 border border-border rounded-md"
        >
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${metric.iconBg}`}
          >
            <MetricIcon label={metric.label} className={metric.iconColor} />
          </div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wide mb-0.5">
              {metric.label}
            </div>
            <div className={`text-lg font-bold leading-tight ${metric.label === "LLM Model" ? "!text-sm" : ""}`}>
              {metric.value}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">{metric.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricIcon({ label, className }: { label: string; className: string }) {
  const iconMap: Record<string, string> = {
    Duration: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v6l4 2",
    "Total Cost": "M1 4h22v16H1V4Zm0 6h22",
    Tokens: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    "Tool Calls": "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77",
    "LLM Model": "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    Retries: "M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10",
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-5 h-5 ${className}`}>
      <path d={iconMap[label] ?? "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"} />
    </svg>
  );
}
