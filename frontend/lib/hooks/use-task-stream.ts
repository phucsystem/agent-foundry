"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface StreamEvent {
  type: "log" | "tool_call" | "reasoning" | "complete" | "error";
  content: string;
  timestamp: string;
}

interface UseTaskStreamReturn {
  events: StreamEvent[];
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useTaskStream(taskId: string): UseTaskStreamReturn {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    // TODO: Replace mock simulation with real SSE when backend is ready
    // import { fetchEventSource } from "@microsoft/fetch-event-source";
    // fetchEventSource(`/api/tasks/${taskId}/stream`, {
    //   method: "POST",
    //   onmessage(event) { setEvents(prev => [...prev, JSON.parse(event.data)]); },
    //   onclose() { setIsConnected(false); },
    // });

    setIsConnected(true);
    setEvents([]);

    const mockMessages = [
      { type: "log" as const, content: "Agent initialising..." },
      { type: "log" as const, content: "Analysing codebase structure..." },
      { type: "tool_call" as const, content: "code_interpreter: python analyze_code.py" },
      { type: "reasoning" as const, content: "Found 3 modules requiring tests" },
      { type: "tool_call" as const, content: "code_interpreter: python generate_tests.py" },
      { type: "log" as const, content: "Writing test cases..." },
      { type: "complete" as const, content: "Task completed successfully" },
    ];

    let messageIndex = 0;
    intervalRef.current = setInterval(() => {
      if (messageIndex >= mockMessages.length) {
        disconnect();
        return;
      }
      const message = mockMessages[messageIndex];
      setEvents((prev) => [
        ...prev,
        {
          ...message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      messageIndex++;
    }, 1500);
  }, [taskId, disconnect]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { events, isConnected, connect, disconnect };
}
