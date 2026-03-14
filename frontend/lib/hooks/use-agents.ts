import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AGENT_COLORS } from "@/lib/constants";
import type { Agent } from "@/lib/types";

interface BackendAgent {
  id: string;
  name: string;
  role: string;
  version?: string;
  pricing_cents_per_run: number;
  tools?: string[];
  goal?: string;
  backstory?: string;
}

function mapBackendAgent(raw: BackendAgent): Agent {
  const colors = AGENT_COLORS[raw.id] ?? { from: "#64748B", to: "#475569" };
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role,
    initials: raw.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    gradientFrom: colors.from,
    gradientTo: colors.to,
    successRate: null,
    avgCost: null,
    avgRuntime: null,
    totalTasks: 0,
    weeklyPrice: Math.round((raw.pricing_cents_per_run * 52) / 100),
    description: raw.goal ?? raw.backstory ?? "",
    specialisation: raw.role,
    tools: raw.tools ?? [],
    llmBackend: "Claude Sonnet via LiteLLM",
    available: true,
  };
}

async function fetchAgents(): Promise<Agent[]> {
  const data = await apiClient<{ agents: BackendAgent[] }>("/api/agents/");
  return data.agents.map(mapBackendAgent);
}

async function fetchAgentById(agentId: string): Promise<Agent | undefined> {
  try {
    const raw = await apiClient<BackendAgent>(`/api/agents/${agentId}`);
    return mapBackendAgent(raw);
  } catch {
    return undefined;
  }
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
