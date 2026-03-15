import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAgents, useAgent } from "@/lib/hooks/use-agents";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useAgents", () => {
  it("fetches and maps agents list", async () => {
    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const agents = result.current.data!;
    expect(agents).toHaveLength(2);
    expect(agents[0].id).toBe("coder");
    expect(agents[0].name).toBe("Coder Agent");
    expect(agents[0].initials).toBe("CA");
    expect(agents[0].gradientFrom).toBe("#3B82F6");
    expect(agents[0].available).toBe(true);
    expect(agents[0].tools).toContain("code_interpreter");
  });

  it("maps weekly price from pricing_cents_per_run", async () => {
    const { result } = renderHook(() => useAgents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const agents = result.current.data!;
    expect(agents[0].weeklyPrice).toBe(Math.round((100 * 52) / 100));
  });
});

describe("useAgent", () => {
  it("fetches a single agent by ID", async () => {
    const { result } = renderHook(() => useAgent("coder"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const agent = result.current.data!;
    expect(agent.id).toBe("coder");
    expect(agent.name).toBe("Coder Agent");
  });

  it("is disabled when agentId is empty", () => {
    const { result } = renderHook(() => useAgent(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
