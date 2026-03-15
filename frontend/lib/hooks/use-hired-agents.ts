import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiPost, apiUpload } from "@/lib/api-client";
import { mapHiredAgent, mapHiredAgentDetail } from "@/lib/mappers/hired-agent-mappers";

interface TaskRow {
  task_id: string;
  agent_id: string;
  goal: string;
  status: string;
  cost_usd: number | null;
  runtime_seconds: number | null;
  created_at: string | null;
  completed_at: string | null;
}

export function useHiredAgents() {
  return useQuery({
    queryKey: ["hired-agents"],
    queryFn: async () => {
      const data = await apiClient<{ hired_agents: Record<string, unknown>[] }>("/api/agents/hired/");
      return data.hired_agents.map(mapHiredAgent);
    },
  });
}

export function useHiredAgentDetail(hireId: string) {
  return useQuery({
    queryKey: ["hired-agents", hireId],
    queryFn: async () => {
      const raw = await apiClient<Record<string, unknown>>(`/api/agents/hired/${hireId}`);
      return mapHiredAgentDetail(raw);
    },
    enabled: !!hireId,
  });
}

export function useHiredAgentTasks(hireId: string, limit = 5) {
  return useQuery({
    queryKey: ["hired-agents", hireId, "tasks", limit],
    queryFn: async () => {
      return apiClient<{ tasks: TaskRow[]; total: number }>(
        `/api/agents/hired/${hireId}/tasks`,
        { params: { limit: String(limit), offset: "0" } },
      );
    },
    enabled: !!hireId,
  });
}

export function useHireAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, plan, weeklyBudgetUsd }: { agentId: string; plan?: string; weeklyBudgetUsd?: number }) => {
      return apiPost<{ hire_id: string }>(`/api/agents/hired/${agentId}/hire`, {
        plan: plan ?? "solo",
        weekly_budget_usd: weeklyBudgetUsd ?? 100,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hired-agents"] }),
  });
}

export function useCancelHire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hireId: string) => {
      return apiClient<unknown>(`/api/agents/hired/${hireId}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hired-agents"] }),
  });
}

export function useRehireAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hireId: string) => {
      return apiPost<unknown>(`/api/agents/hired/${hireId}/rehire`, {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hired-agents"] }),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hireId, customInstructions }: { hireId: string; customInstructions: string }) => {
      return apiClient<unknown>(`/api/agents/hired/${hireId}/settings`, {
        method: "PUT",
        body: JSON.stringify({ custom_instructions: customInstructions }),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hired-agents", variables.hireId] });
      queryClient.invalidateQueries({ queryKey: ["hired-agents"] });
    },
  });
}

export function useUploadKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hireId, file }: { hireId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<unknown>(`/api/agents/hired/${hireId}/knowledge`, formData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hired-agents", variables.hireId] });
    },
  });
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hireId, fileId }: { hireId: string; fileId: string }) => {
      return apiClient<void>(`/api/agents/hired/${hireId}/knowledge/${fileId}`, { method: "DELETE" });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hired-agents", variables.hireId] });
    },
  });
}
