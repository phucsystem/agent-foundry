"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiPost } from "@/lib/api-client";
import type { ContentTask, ContentTaskInput, CreateTaskResponse } from "@/lib/types/content";

export function useContentTasks() {
  return useQuery<ContentTask[]>({
    queryKey: ["content-tasks"],
    queryFn: () => apiClient<ContentTask[]>("/api/tasks"),
    refetchInterval: 10000,
  });
}

export function useContentTask(taskId: string) {
  return useQuery<ContentTask>({
    queryKey: ["content-task", taskId],
    queryFn: () => apiClient<ContentTask>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending" || status === "running") return 3000;
      return false;
    },
  });
}

export function useCreateContentTask() {
  const queryClient = useQueryClient();

  return useMutation<CreateTaskResponse, Error, ContentTaskInput>({
    mutationFn: (input) => apiPost<CreateTaskResponse>("/api/tasks/content", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
    },
  });
}
