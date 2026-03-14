"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";
import { KanbanCard } from "./kanban-card";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "queued", label: "Queued", dotColor: "bg-neutral" },
  { status: "running", label: "Running", dotColor: "bg-primary" },
  { status: "completed", label: "Completed", dotColor: "bg-success" },
  { status: "failed", label: "Failed", dotColor: "bg-error" },
];

const INITIAL_VISIBLE = 3;

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

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
  const [expanded, setExpanded] = useState(false);
  const visibleTasks = expanded ? tasks : tasks.slice(0, INITIAL_VISIBLE);
  const remainingCount = tasks.length - INITIAL_VISIBLE;

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
        {visibleTasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 mt-2 bg-transparent border border-dashed border-border rounded-md text-xs text-text-secondary cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:text-primary transition-colors"
        >
          {expanded ? "Show less" : `Show ${remainingCount} more`}
        </button>
      )}
    </div>
  );
}
