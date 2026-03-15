import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiPost } from "@/lib/api-client";
import { AGENT_COLORS } from "@/lib/constants";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";

interface BackendTask {
  task_id: string;
  status: string;
  agent_id: string;
  goal: string;
  context?: string;
  budget_usd?: number;
  cost_usd?: number | null;
  tokens_used?: number | null;
  runtime_seconds?: number | null;
  created_at?: string;
  completed_at?: string | null;
  output_data?: Record<string, unknown>;
  input_data?: Record<string, unknown>;
  error?: string;
}

interface CreateTaskPayload {
  agent_id: string;
  goal: string;
  context?: string;
  budget_usd?: number;
}

interface CreateTaskResponse {
  task_id: string;
  status: string;
}

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function mapBackendTask(raw: BackendTask): Task {
  const colors = AGENT_COLORS[raw.agent_id] ?? { from: "#64748B", to: "#475569" };
  const agentName = raw.agent_id.charAt(0).toUpperCase() + raw.agent_id.slice(1);
  const initials = agentName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusMap: Record<string, TaskStatus> = {
    pending: "queued",
    queued: "queued",
    on_hold: "on_hold",
    running: "running",
    completed: "completed",
    failed: "failed",
  };

  const output = raw.output_data ?? {};
  const input = raw.input_data ?? {};

  const priorityMap: Record<string, TaskPriority> = { high: "high", medium: "medium", low: "low" };
  const priority = priorityMap[String(input.priority ?? "")] ?? "medium";

  return {
    id: raw.task_id,
    title: raw.goal,
    description: raw.context ?? raw.goal,
    status: statusMap[raw.status] ?? "queued",
    priority,
    agentId: raw.agent_id,
    agentName,
    agentInitials: initials,
    agentGradientFrom: colors.from,
    agentGradientTo: colors.to,
    createdAt: raw.created_at ?? "just now",
    duration: (output.duration as string) ?? formatDuration(raw.runtime_seconds) ?? null,
    cost: raw.cost_usd ?? null,
    budgetCap: raw.budget_usd ?? (input.budget_usd as number) ?? 50,
    tokens: raw.tokens_used ?? null,
    progress: (output.progress as number) ?? (raw.status === "completed" ? 100 : null),
    liveStatus: (output.live_status as string) ?? (raw.status === "running" ? "Processing..." : null),
    errorMessage: (output.error as string) ?? raw.error ?? null,
    retries: (output.retries as number) ?? 0,
    maxRetries: (output.max_retries as number) ?? 3,
    rating: (output.rating as number) ?? null,
  };
}

async function fetchTasks(): Promise<Task[]> {
  const data = await apiClient<{ tasks: BackendTask[] }>("/api/tasks/");
  return data.tasks.map(mapBackendTask);
}

async function fetchTaskById(taskId: string): Promise<Task | undefined> {
  try {
    const data = await apiClient<BackendTask>(`/api/tasks/${taskId}`);
    return mapBackendTask(data);
  } catch {
    return undefined;
  }
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) =>
      apiPost<CreateTaskResponse>("/api/tasks/", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
