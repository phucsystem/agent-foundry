import Link from "next/link";
import type { Task } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StarRating } from "@/components/ui/star-rating";

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const borderClass =
    task.status === "running"
      ? "border-l-3 border-l-primary"
      : task.status === "failed"
      ? "border-l-3 border-l-error"
      : "";

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`block bg-white dark:bg-slate-800 border border-border rounded-md p-4 no-underline text-inherit transition-all hover:shadow-card hover:-translate-y-px cursor-pointer ${borderClass}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
          {priorityConfig.label}
        </span>
        <span className="text-xs text-text-muted">{task.createdAt}</span>
      </div>

      <div className="text-sm font-semibold leading-snug mb-2">{task.title}</div>

      {task.status === "running" && task.progress != null && (
        <div className="flex items-center gap-2 mb-2">
          <ProgressBar percentage={task.progress} animated />
          <span className="text-xs text-text-muted">{task.progress}%</span>
        </div>
      )}

      {task.errorMessage && (
        <div className="text-[11px] text-error bg-error/5 dark:bg-error/10 p-2 rounded mb-2 font-mono leading-snug">
          {task.errorMessage}
        </div>
      )}

      {task.status === "completed" && (
        <div className="flex gap-4 mb-2 py-2">
          <MetricItem label="Duration" value={task.duration ?? "--"} />
          <MetricItem label="Cost" value={task.cost != null ? `$${task.cost.toFixed(2)}` : "--"} />
          <MetricItem label="Tokens" value={task.tokens != null ? `${(task.tokens / 1000).toFixed(1)}K` : "--"} />
        </div>
      )}

      {task.status === "failed" && (
        <div className="flex gap-4 mb-2 py-2">
          <MetricItem label="Duration" value={task.duration ?? "--"} />
          <MetricItem label="Cost" value={task.cost != null ? `$${task.cost.toFixed(2)}` : "--"} isError={task.cost != null && task.cost > task.budgetCap} />
          <MetricItem label="Retries" value={`${task.retries}/${task.maxRetries}`} />
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Avatar initials={task.agentInitials} gradientFrom={task.agentGradientFrom} gradientTo={task.agentGradientTo} size="sm" className="!w-[22px] !h-[22px] !text-[10px]" />
          <span>{task.agentName}</span>
        </div>
        {task.status === "running" && task.cost != null && (
          <span>${task.cost.toFixed(2)} / ${task.budgetCap}</span>
        )}
        {task.status === "queued" && (
          <span>~${task.budgetCap}</span>
        )}
        {task.status === "completed" && task.rating != null && (
          <StarRating rating={task.rating} size="sm" />
        )}
        {task.status === "failed" && (
          <button
            type="button"
            className="px-2 py-0.5 text-[11px] bg-error/10 text-error border border-error/20 rounded cursor-pointer"
            onClick={(event) => event.preventDefault()}
          >
            Retry
          </button>
        )}
      </div>

      {task.liveStatus && (
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-2 pt-2 border-t border-border italic">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-kanban-blink shrink-0" />
          {task.liveStatus}
        </div>
      )}
    </Link>
  );
}

function MetricItem({ label, value, isError = false }: { label: string; value: string; isError?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-text-muted uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${isError ? "text-error" : ""}`}>{value}</span>
    </div>
  );
}

