import { create } from "zustand";
import type { TaskStatus } from "@/lib/types";

interface TaskStatusOverride {
  previousStatus: TaskStatus;
  currentStatus: TaskStatus;
}

interface TaskStore {
  overrides: Record<string, TaskStatusOverride>;
  archivedIds: Set<string>;
  holdTask: (taskId: string) => void;
  activateTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
  isArchived: (taskId: string) => boolean;
  getEffectiveStatus: (taskId: string, originalStatus: TaskStatus) => TaskStatus;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  overrides: {},
  archivedIds: new Set<string>(),

  holdTask: (taskId) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [taskId]: {
          previousStatus: state.overrides[taskId]?.previousStatus ?? "queued",
          currentStatus: "on_hold",
        },
      },
    })),

  activateTask: (taskId) =>
    set((state) => {
      const existing = state.overrides[taskId];
      if (!existing) return state;
      return {
        overrides: {
          ...state.overrides,
          [taskId]: {
            ...existing,
            currentStatus: existing.previousStatus,
          },
        },
      };
    }),

  archiveTask: (taskId) =>
    set((state) => {
      const next = new Set(state.archivedIds);
      next.add(taskId);
      return { archivedIds: next };
    }),

  unarchiveTask: (taskId) =>
    set((state) => {
      const next = new Set(state.archivedIds);
      next.delete(taskId);
      return { archivedIds: next };
    }),

  isArchived: (taskId) => get().archivedIds.has(taskId),

  getEffectiveStatus: (taskId, originalStatus) => {
    const override = get().overrides[taskId];
    return override ? override.currentStatus : originalStatus;
  },
}));
