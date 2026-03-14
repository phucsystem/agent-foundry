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
  created_at?: string;
  result?: string;
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
    running: "running",
    completed: "completed",
    failed: "failed",
  };

  return {
    id: raw.task_id,
    title: raw.goal,
    description: raw.context ?? raw.goal,
    status: statusMap[raw.status] ?? "queued",
    priority: "medium" as TaskPriority,
    agentId: raw.agent_id,
    agentName,
    agentInitials: initials,
    agentGradientFrom: colors.from,
    agentGradientTo: colors.to,
    createdAt: raw.created_at ?? "just now",
    duration: null,
    cost: null,
    budgetCap: raw.budget_usd ?? 50,
    tokens: null,
    progress: raw.status === "completed" ? 100 : null,
    liveStatus: raw.status === "running" ? "Processing..." : null,
    errorMessage: raw.error ?? null,
    retries: 0,
    maxRetries: 3,
    rating: null,
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
