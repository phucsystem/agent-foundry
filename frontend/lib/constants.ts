import type { NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Marketplace",
    href: "/agents",
    iconPath: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  },
  {
    label: "Tasks",
    href: "/tasks",
    iconPath: "M22 12h-4l-3 9-6-18-3 9H2",
  },
];

export const AGENT_COLORS: Record<string, { from: string; to: string }> = {
  coder: { from: "#3B82F6", to: "#2563EB" },
  research: { from: "#10B981", to: "#059669" },
  pm: { from: "#F59E0B", to: "#D97706" },
  qa: { from: "#EF4444", to: "#DC2626" },
  copywriter: { from: "#8B5CF6", to: "#7C3AED" },
  "image-design": { from: "#EC4899", to: "#DB2777" },
  "video-design": { from: "#06B6D4", to: "#0891B2" },
};

export const TASK_STATUS_CONFIG: Record<
  string,
  { label: string; variant: string }
> = {
  queued: { label: "Queued", variant: "neutral" },
  running: { label: "Running", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "error" },
};

export const PRIORITY_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string }
> = {
  high: {
    label: "High",
    bgClass: "bg-error/10 dark:bg-error/15",
    textClass: "text-error",
  },
  medium: {
    label: "Medium",
    bgClass: "bg-warning/10 dark:bg-warning/15",
    textClass: "text-warning",
  },
  low: {
    label: "Low",
    bgClass: "bg-neutral/10 dark:bg-neutral/15",
    textClass: "text-neutral",
  },
};
