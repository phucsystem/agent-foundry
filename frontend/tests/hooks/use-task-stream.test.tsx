import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTaskStream } from "@/lib/hooks/use-task-stream";

describe("useTaskStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts disconnected with no events", () => {
    const { result } = renderHook(() => useTaskStream("task-1"));
    expect(result.current.isConnected).toBe(false);
    expect(result.current.events).toEqual([]);
  });

  it("connects and starts emitting events", () => {
    const { result } = renderHook(() => useTaskStream("task-1"));

    act(() => {
      result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.events).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe("log");
    expect(result.current.events[0].content).toBe("Agent initialising...");
  });

  it("emits multiple events over time", () => {
    const { result } = renderHook(() => useTaskStream("task-1"));

    act(() => {
      result.current.connect();
    });

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(result.current.events).toHaveLength(3);
  });

  it("disconnects and stops emitting", () => {
    const { result } = renderHook(() => useTaskStream("task-1"));

    act(() => {
      result.current.connect();
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    const eventCount = result.current.events.length;

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.events).toHaveLength(eventCount);
  });

  it("auto-disconnects after all messages sent", () => {
    const { result } = renderHook(() => useTaskStream("task-1"));

    act(() => {
      result.current.connect();
    });

    act(() => {
      vi.advanceTimersByTime(7 * 1500 + 1500);
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.events).toHaveLength(7);
  });

  it("cleans up on unmount", () => {
    const { result, unmount } = renderHook(() => useTaskStream("task-1"));

    act(() => {
      result.current.connect();
    });

    unmount();
  });
});
