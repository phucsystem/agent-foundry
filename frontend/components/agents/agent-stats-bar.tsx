import type { Agent } from "@/lib/types";

interface AgentStatsBarProps {
  agent: Agent;
}

export function AgentStatsBar({ agent }: AgentStatsBarProps) {
  const stats = [
    { label: "Success Rate", value: agent.successRate != null ? `${agent.successRate}%` : "--", valueClass: "text-success" },
    { label: "Avg Cost Per Task", value: agent.avgCost != null ? `~$${agent.avgCost.toFixed(2)}` : "--", valueClass: "" },
    { label: "Avg Runtime", value: agent.avgRuntime ?? "--", valueClass: "" },
    { label: "Total Tasks", value: agent.totalTasks.toLocaleString(), valueClass: "" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center p-4 bg-white dark:bg-slate-800 border border-border rounded-md"
        >
          <div className={`text-xl font-bold ${stat.valueClass}`}>{stat.value}</div>
          <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
