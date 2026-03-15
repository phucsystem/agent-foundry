"use client";

import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils/format-date";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StarRating } from "@/components/ui/star-rating";

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const router = useRouter();
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const borderColor: Record<string, string> = {
    running: "border-l-primary",
    failed: "border-l-error",
    on_hold: "border-l-warning",
    completed: "border-l-success",
  };
  const borderClass = borderColor[task.status] ? `border-l-3 ${borderColor[task.status]}` : "";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/tasks/${task.id}`)}
      onKeyDown={(event) => { if (event.key === "Enter") router.push(`/tasks/${task.id}`); }}
      className={`bg-white dark:bg-slate-800 border border-border rounded-lg p-3 text-inherit transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 cursor-pointer ${borderClass}`}
    >
      {/* Row 1: Priority + Date */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
          {priorityConfig.label}
        </span>
        <span className="text-[11px] text-text-muted">{formatRelativeTime(task.createdAt)}</span>
      </div>

      {/* Row 2: Title */}
      <div className="text-sm font-semibold leading-snug mb-2 line-clamp-2">{task.title}</div>

      {/* Running: progress */}
      {task.status === "running" && task.progress != null && (
        <div className="flex items-center gap-2 mb-2">
          <ProgressBar percentage={task.progress} animated />
          <span className="text-[11px] text-text-muted tabular-nums">{task.progress}%</span>
        </div>
      )}

      {/* Error */}
      {task.errorMessage && (
        <div className="text-[11px] text-error bg-error/5 dark:bg-error/10 p-1.5 rounded mb-2 font-mono leading-snug line-clamp-2">
          {task.errorMessage}
        </div>
      )}

      {/* Completed: compact metrics */}
      {task.status === "completed" && (
        <div className="flex gap-3 mb-2 text-[11px]">
          <span className="text-text-muted">{task.duration ?? "--"}</span>
          <span className="text-text-muted">{task.cost != null ? `$${task.cost.toFixed(2)}` : "--"}</span>
          <span className="text-text-muted">{task.tokens != null ? `${(task.tokens / 1000).toFixed(1)}K tok` : ""}</span>
        </div>
      )}

      {/* Failed: compact metrics */}
      {task.status === "failed" && (
        <div className="flex gap-3 mb-2 text-[11px]">
          <span className="text-text-muted">{task.duration ?? "--"}</span>
          <span className={task.cost != null && task.cost > task.budgetCap ? "text-error font-semibold" : "text-text-muted"}>
            {task.cost != null ? `$${task.cost.toFixed(2)}` : "--"}
          </span>
          <span className="text-text-muted">{task.retries}/{task.maxRetries} retries</span>
        </div>
      )}

      {/* Footer: agent + meta */}
      <div className="flex justify-between items-center text-[11px] text-text-secondary pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <Avatar initials={task.agentInitials} gradientFrom={task.agentGradientFrom} gradientTo={task.agentGradientTo} size="sm" className="!w-5 !h-5 !text-[9px]" />
          <span>{task.agentName}</span>
        </div>
        {(task.status === "queued" || task.status === "on_hold") && (
          <span className="text-text-muted tabular-nums">~${task.budgetCap}</span>
        )}
        {task.status === "running" && task.cost != null && (
          <span className="tabular-nums">${task.cost.toFixed(2)}/${task.budgetCap}</span>
        )}
        {task.status === "completed" && task.rating != null && (
          <StarRating rating={task.rating} size="sm" />
        )}
        {task.status === "failed" && (
          <button
            type="button"
            className="px-1.5 py-0.5 text-[10px] font-medium bg-error/10 text-error border border-error/20 rounded cursor-pointer hover:bg-error/20 transition-colors"
            onClick={(event) => event.stopPropagation()}
          >
            Retry
          </button>
        )}
      </div>

      {/* Live status */}
      {task.liveStatus && (
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-2 pt-1.5 border-t border-border/40 italic">
          <svg className="w-3 h-3 shrink-0 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {task.liveStatus}
        </div>
      )}
    </div>
  );
}
