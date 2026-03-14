"use client";

import { useState } from "react";
import Link from "next/link";
import { useTasks } from "@/lib/hooks/use-tasks";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { SearchBar, FilterButton } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/lib/constants";

type ViewMode = "board" | "list";

export default function TaskBoardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  const { data: tasks = [], isLoading, error } = useTasks();

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Task Board</h1>
          <p className="text-text-secondary">
            {tasks.length} tasks total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button
            variant={viewMode === "board" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("board")}
          >
            Board
          </Button>
          <Link href="/tasks/new">
            <Button variant="primary" size="sm">+ New Task</Button>
          </Link>
        </div>
      </div>

      <SearchBar
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={setSearchQuery}
      >
        <FilterButton label="Agent" />
        <FilterButton label="Priority" />
      </SearchBar>

      {isLoading && (
        <div className="text-center py-12 text-text-secondary">Loading tasks...</div>
      )}

      {error && (
        <div className="text-center py-12 text-error">
          Failed to load tasks. Is the backend running?
        </div>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No tasks yet.{" "}
          <Link href="/tasks/new" className="text-primary no-underline hover:underline">
            Create your first task
          </Link>
          .
        </div>
      )}

      {!isLoading && !error && filteredTasks.length > 0 && viewMode === "board" && (
        <KanbanBoard tasks={filteredTasks} />
      )}

      {!isLoading && !error && filteredTasks.length > 0 && viewMode === "list" && (
        <TaskListView tasks={filteredTasks} />
      )}
    </>
  );
}

function TaskListView({ tasks }: { tasks: ReturnType<typeof useTasks>["data"] & object[] }) {
  return (
    <div className="overflow-x-auto border border-border rounded-md">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-surface dark:bg-slate-800 border-b border-border">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Task</th>
            <th className="text-left py-3 px-4 font-semibold">Agent</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Priority</th>
            <th className="text-right py-3 px-4 font-semibold">Cost</th>
            <th className="text-right py-3 px-4 font-semibold">Created</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusConfig = TASK_STATUS_CONFIG[task.status];
            const priorityConfig = PRIORITY_CONFIG[task.priority];
            return (
              <tr key={task.id} className="border-b border-border hover:bg-surface dark:hover:bg-slate-800">
                <td className="py-3 px-4">
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium no-underline hover:text-primary">
                    {task.title}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar
                      initials={task.agentInitials}
                      gradientFrom={task.agentGradientFrom}
                      gradientTo={task.agentGradientTo}
                      size="sm"
                      className="!w-6 !h-6 !text-[10px]"
                    />
                    <span>{task.agentName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {statusConfig && (
                    <Badge variant={statusConfig.variant as "success" | "error" | "warning" | "info" | "neutral"}>
                      {statusConfig.label}
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  {priorityConfig && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
                      {priorityConfig.label}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {task.cost != null ? `$${task.cost.toFixed(2)}` : "—"}
                </td>
                <td className="py-3 px-4 text-right text-text-muted">
                  {task.createdAt}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
