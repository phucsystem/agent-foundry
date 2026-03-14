"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TaskRow {
  task_id: string;
  goal: string;
  status: string;
  cost_usd: number | null;
  runtime_seconds: number | null;
  created_at: string | null;
}

interface AgentRecentTasksProps {
  tasks: TaskRow[];
  totalCount: number;
  agentId: string;
}

const STATUS_VARIANT: Record<string, "success" | "info" | "error" | "neutral"> = {
  completed: "success",
  running: "info",
  failed: "error",
  queued: "neutral",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "--";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatRuntime(seconds: number | null): string {
  if (seconds == null) return "--";
  return `${Math.round(seconds)}s`;
}

export function AgentRecentTasks({ tasks, totalCount, agentId }: AgentRecentTasksProps) {
  return (
    <div className="bg-white dark:bg-[#020617] border border-border rounded-lg p-6">
      <div className="flex items-center justify-between text-sm font-semibold mb-4">
        Recent Tasks
        <Link href={`/tasks?agent=${agentId}`} className="text-xs text-primary font-medium hover:underline no-underline">
          View All Tasks ({totalCount})
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-sm text-text-muted text-center py-6">No tasks yet</div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-text-secondary text-xs uppercase tracking-wider px-2 py-2 border-b border-border">Task</th>
              <th className="text-left font-semibold text-text-secondary text-xs uppercase tracking-wider px-2 py-2 border-b border-border">Status</th>
              <th className="text-left font-semibold text-text-secondary text-xs uppercase tracking-wider px-2 py-2 border-b border-border">Cost</th>
              <th className="text-left font-semibold text-text-secondary text-xs uppercase tracking-wider px-2 py-2 border-b border-border">Runtime</th>
              <th className="text-right font-semibold text-text-secondary text-xs uppercase tracking-wider px-2 py-2 border-b border-border">When</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id}>
                <td className="px-2 py-2 border-b border-border max-w-[260px] truncate">{task.goal}</td>
                <td className="px-2 py-2 border-b border-border">
                  <Badge variant={STATUS_VARIANT[task.status] ?? "neutral"}>
                    {task.status === "completed" ? "Done" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-2 py-2 border-b border-border">
                  {task.cost_usd != null ? `$${task.cost_usd.toFixed(2)}` : "--"}
                </td>
                <td className="px-2 py-2 border-b border-border">{formatRuntime(task.runtime_seconds)}</td>
                <td className="px-2 py-2 border-b border-border text-right text-text-muted">{timeAgo(task.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
