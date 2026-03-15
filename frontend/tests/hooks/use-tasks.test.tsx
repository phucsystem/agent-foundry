import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasks, useTask } from "@/lib/hooks/use-tasks";

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

describe("useTasks", () => {
  it("fetches and maps tasks list", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const tasks = result.current.data!;
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe("task-1");
    expect(tasks[0].title).toBe("Write unit tests");
    expect(tasks[0].status).toBe("completed");
    expect(tasks[0].agentId).toBe("coder");
    expect(tasks[0].progress).toBe(100);
  });

  it("maps running task status correctly", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const runningTask = result.current.data!.find(
      (task) => task.id === "task-2"
    );
    expect(runningTask?.status).toBe("running");
    expect(runningTask?.liveStatus).toBe("Processing...");
  });
});

describe("useTask", () => {
  it("fetches a single task by ID", async () => {
    const { result } = renderHook(() => useTask("task-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const task = result.current.data!;
    expect(task.id).toBe("task-1");
    expect(task.title).toBe("Write unit tests");
  });

  it("is disabled when taskId is empty", () => {
    const { result } = renderHook(() => useTask(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
