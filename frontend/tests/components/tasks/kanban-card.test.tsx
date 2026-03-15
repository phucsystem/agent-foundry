import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanCard } from "@/components/tasks/kanban-card";
import type { Task } from "@/lib/types";

const baseTask: Task = {
  id: "task-1",
  title: "Write unit tests",
  description: "Frontend unit tests",
  status: "queued",
  priority: "medium",
  agentId: "coder",
  agentName: "Coder",
  agentInitials: "CO",
  agentGradientFrom: "#3B82F6",
  agentGradientTo: "#2563EB",
  createdAt: "2 hours ago",
  duration: null,
  cost: null,
  budgetCap: 50,
  tokens: null,
  progress: null,
  liveStatus: null,
  errorMessage: null,
  retries: 0,
  maxRetries: 3,
  rating: null,
};

describe("KanbanCard", () => {
  it("renders task title", () => {
    render(<KanbanCard task={baseTask} />);
    expect(screen.getByText("Write unit tests")).toBeInTheDocument();
  });

  it("renders priority label", () => {
    render(<KanbanCard task={baseTask} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders agent name", () => {
    render(<KanbanCard task={baseTask} />);
    expect(screen.getByText("Coder")).toBeInTheDocument();
  });

  it("renders created at timestamp", () => {
    render(<KanbanCard task={baseTask} />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("links to task detail page", () => {
    render(<KanbanCard task={baseTask} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tasks/task-1");
  });

  it("shows progress bar for running tasks", () => {
    const runningTask: Task = {
      ...baseTask,
      status: "running",
      progress: 60,
    };
    render(<KanbanCard task={runningTask} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("shows metrics for completed tasks", () => {
    const completedTask: Task = {
      ...baseTask,
      status: "completed",
      duration: "2m 30s",
      cost: 1.5,
      tokens: 5000,
    };
    render(<KanbanCard task={completedTask} />);
    expect(screen.getByText("2m 30s")).toBeInTheDocument();
    expect(screen.getByText("$1.50")).toBeInTheDocument();
    expect(screen.getByText("5.0K")).toBeInTheDocument();
  });

  it("shows error message for failed tasks", () => {
    const failedTask: Task = {
      ...baseTask,
      status: "failed",
      errorMessage: "Agent crashed",
    };
    render(<KanbanCard task={failedTask} />);
    expect(screen.getByText("Agent crashed")).toBeInTheDocument();
  });

  it("shows retry button for failed tasks", () => {
    const failedTask: Task = {
      ...baseTask,
      status: "failed",
      duration: "1m",
      cost: 0.5,
    };
    render(<KanbanCard task={failedTask} />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows live status indicator", () => {
    const liveTask: Task = {
      ...baseTask,
      status: "running",
      liveStatus: "Analyzing code...",
    };
    render(<KanbanCard task={liveTask} />);
    expect(screen.getByText("Analyzing code...")).toBeInTheDocument();
  });

  it("shows budget estimate for queued tasks", () => {
    render(<KanbanCard task={baseTask} />);
    expect(screen.getByText("~$50")).toBeInTheDocument();
  });
});
