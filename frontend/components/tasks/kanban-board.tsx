"use client";

import type { Task, TaskStatus } from "@/lib/types";
import { useTaskStore } from "@/lib/stores/task-store";
import { KanbanCard } from "./kanban-card";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "on_hold", label: "On Hold", dotColor: "bg-warning" },
  { status: "queued", label: "Queued", dotColor: "bg-neutral" },
  { status: "running", label: "Running", dotColor: "bg-primary" },
  { status: "completed", label: "Completed", dotColor: "bg-success" },
  { status: "failed", label: "Failed", dotColor: "bg-error" },
];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const overrides = useTaskStore((state) => state.overrides);
  const archivedIds = useTaskStore((state) => state.archivedIds);

  const tasksWithEffectiveStatus = tasks
    .filter((task) => !archivedIds.has(task.id))
    .map((task) => ({
      ...task,
      status: overrides[task.id]?.currentStatus ?? task.status,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasksWithEffectiveStatus.filter(
          (task) => task.status === column.status,
        );

        return (
          <KanbanColumn
            key={column.status}
            label={column.label}
            dotColor={column.dotColor}
            tasks={columnTasks}
          />
        );
      })}
    </div>
  );
}

function KanbanColumn({
  label,
  dotColor,
  tasks,
}: {
  label: string;
  dotColor: string;
  tasks: Task[];
}) {
  return (
    <div className="bg-surface dark:bg-slate-800/30 rounded-md p-4 min-h-[200px]">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
        </div>
        <span className="text-xs font-semibold bg-border text-text-secondary px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
