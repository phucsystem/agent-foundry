"use client";

import Link from "next/link";
import { useContentTasks } from "@/lib/hooks/use-content-tasks";

export default function ContentPage() {
  const { data: tasks, isLoading } = useContentTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Editor</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-powered content creation with brand voice consistency
          </p>
        </div>
        <Link
          href="/content/new"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors no-underline"
        >
          + New Content
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-text-secondary animate-pulse">Loading tasks...</div>
      )}

      {!isLoading && tasks && tasks.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-text-secondary mb-4">No content tasks yet</p>
          <Link
            href="/content/new"
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 no-underline"
          >
            Create your first content
          </Link>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Link
              key={task.taskId}
              href={`/tasks/${task.taskId}`}
              className="block p-4 rounded-lg border border-border bg-surface hover:border-primary/30 transition-colors no-underline"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">{task.topic || "Untitled"}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {task.taskType} &middot; {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === "completed"
                      ? "bg-success/10 text-success"
                      : task.status === "failed"
                        ? "bg-error/10 text-error"
                        : task.status === "running"
                          ? "bg-info/10 text-info"
                          : "bg-neutral/10 text-neutral"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
