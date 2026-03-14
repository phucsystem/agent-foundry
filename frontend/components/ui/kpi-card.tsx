import type { KpiData } from "@/lib/types";

interface KpiCardProps extends KpiData {
  className?: string;
}

export function KpiCard({ label, value, change, changeType, className = "" }: KpiCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-border rounded-md p-6 ${className}`}
    >
      <div className="text-sm text-text-secondary mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      <div
        className={`text-xs mt-1 ${
          changeType === "positive" ? "text-success" : "text-error"
        }`}
      >
        {change}
      </div>
    </div>
  );
}
