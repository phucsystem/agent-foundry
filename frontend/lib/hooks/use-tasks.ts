import { useQuery } from "@tanstack/react-query";
import type { Task } from "@/lib/types";
import { MOCK_TASKS } from "@/lib/mock-data";

async function fetchTasks(): Promise<Task[]> {
  // TODO: Replace with real API call when backend Phase 10 is ready
  // return apiClient<Task[]>("/api/tasks");
  return Promise.resolve(MOCK_TASKS);
}

async function fetchTaskById(taskId: string): Promise<Task | undefined> {
  // TODO: Replace with real API call
  // return apiClient<Task>(`/api/tasks/${taskId}`);
  return Promise.resolve(MOCK_TASKS.find((task) => task.id === taskId));
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
