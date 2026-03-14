import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mock-data";

async function fetchAgents(): Promise<Agent[]> {
  // TODO: Replace with real API call when backend Phase 10 is ready
  // return apiClient<Agent[]>("/api/agents");
  return Promise.resolve(MOCK_AGENTS);
}

async function fetchAgentById(agentId: string): Promise<Agent | undefined> {
  // TODO: Replace with real API call
  // return apiClient<Agent>(`/api/agents/${agentId}`);
  return Promise.resolve(MOCK_AGENTS.find((agent) => agent.id === agentId));
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ["agents", agentId],
    queryFn: () => fetchAgentById(agentId),
    enabled: !!agentId,
  });
}
