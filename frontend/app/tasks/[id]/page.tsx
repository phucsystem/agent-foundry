"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTask } from "@/lib/hooks/use-tasks";
import { MOCK_TASK_DETAIL_METRICS, MOCK_TIMELINE, MOCK_COST_SEGMENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TaskMetrics } from "@/components/tasks/task-metrics";
import { TaskOutput } from "@/components/tasks/task-output";
import { TaskRating } from "@/components/tasks/task-rating";
import { PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format-date";
import { useTaskStore } from "@/lib/stores/task-store";
import { Icon } from "@iconify/react";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = use(params);
  const { data: task, isLoading, error } = useTask(id);
  const router = useRouter();
  const overrides = useTaskStore((state) => state.overrides);
  const holdTask = useTaskStore((state) => state.holdTask);
  const activateTask = useTaskStore((state) => state.activateTask);
  const archiveTask = useTaskStore((state) => state.archiveTask);
  const archivedIds = useTaskStore((state) => state.archivedIds);
  const unarchiveTask = useTaskStore((state) => state.unarchiveTask);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-text-secondary">Loading task...</div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12 text-error">
        {error ? "Failed to load task. Is the backend running?" : "Task not found."}
      </div>
    );
  }

  const effectiveStatus = overrides[task.id]?.currentStatus ?? task.status;
  const statusConfig = TASK_STATUS_CONFIG[effectiveStatus];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOnHold = effectiveStatus === "on_hold";
  const isQueued = effectiveStatus === "queued";
  const isTaskArchived = archivedIds.has(task.id);

  const handleArchive = () => {
    archiveTask(task.id);
    router.push("/tasks");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/tasks" className="text-primary no-underline">Task Board</Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-muted">{task.id}</span>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-opacity no-underline">
            <Icon icon="lucide:plus-circle" width={14} height={14} />
            Assign Another Task
          </Link>
          <Link href="/tasks" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border text-text-secondary hover:bg-surface transition-colors no-underline">
            <Icon icon="lucide:arrow-left" width={14} height={14} />
            Back to Board
          </Link>
        </div>
      </div>

      {/* Task Header */}
      <div className="bg-white dark:bg-slate-800 border border-border rounded-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant as "success" | "error" | "warning" | "info" | "neutral"}>
              {statusConfig.label}
            </Badge>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
              {priorityConfig.label}
            </span>
          </div>
          <div className="flex gap-2">
            {isQueued && (
              <button
                onClick={() => holdTask(task.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors"
              >
                <Icon icon="lucide:pause-circle" width={14} height={14} />
                Hold Task
              </button>
            )}
            {isOnHold && (
              <button
                onClick={() => activateTask(task.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
              >
                <Icon icon="lucide:play-circle" width={14} height={14} />
                Activate Task
              </button>
            )}
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
              <Icon icon="lucide:refresh-cw" width={14} height={14} />
              Re-run
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border text-text-secondary hover:bg-surface transition-colors">
              <Icon icon="lucide:share-2" width={14} height={14} />
              Share
            </button>
            {isTaskArchived ? (
              <button
                onClick={() => unarchiveTask(task.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
              >
                <Icon icon="lucide:archive-restore" width={14} height={14} />
                Unarchive
              </button>
            ) : (
              <button
                onClick={handleArchive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-neutral/10 text-neutral border border-neutral/20 hover:bg-neutral/20 transition-colors"
              >
                <Icon icon="lucide:archive" width={14} height={14} />
                Archive
              </button>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
        <p className="text-sm text-text-secondary mb-4">{task.description}</p>
        <div className="flex gap-6 text-sm text-text-muted flex-wrap">
          <div className="flex items-center gap-2">
            <Avatar initials={task.agentInitials} gradientFrom={task.agentGradientFrom} gradientTo={task.agentGradientTo} size="sm" />
            <strong className="text-slate-900 dark:text-white">{task.agentName} v1.2</strong>
          </div>
          <span>Created {formatDateTime(task.createdAt)}</span>
          <span>By: Current User</span>
          <span>ID: {task.id}</span>
        </div>
      </div>

      <TaskMetrics metrics={MOCK_TASK_DETAIL_METRICS} />
      <TaskOutput
        segments={MOCK_COST_SEGMENTS}
        timeline={MOCK_TIMELINE}
        agentName={task.agentName}
        agentInitials={task.agentInitials}
        agentColor={task.agentGradientFrom}
      />
      <TaskRating />

    </>
  );
}
