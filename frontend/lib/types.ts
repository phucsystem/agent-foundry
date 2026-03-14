export interface Agent {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  successRate: number | null;
  avgCost: number | null;
  avgRuntime: string | null;
  totalTasks: number;
  weeklyPrice: number;
  description: string;
  specialisation: string;
  tools: string[];
  llmBackend: string;
  available: boolean;
}

export type TaskStatus = "queued" | "running" | "completed" | "failed";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  agentId: string;
  agentName: string;
  agentInitials: string;
  agentGradientFrom: string;
  agentGradientTo: string;
  createdAt: string;
  duration: string | null;
  cost: number | null;
  budgetCap: number;
  tokens: number | null;
  progress: number | null;
  liveStatus: string | null;
  errorMessage: string | null;
  retries: number;
  maxRetries: number;
  rating: number | null;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface SampleOutput {
  id: string;
  title: string;
  description: string;
  status: "completed" | "failed";
  cost: number;
  runtime: string;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
}

export interface TaskMetric {
  label: string;
  value: string;
  detail: string;
  iconBg: string;
  iconColor: string;
}

export interface TimelineEntry {
  label: string;
  timestamp: string;
  detail: string;
  dotColor: string;
}

export interface CostSegment {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface KpiData {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

export interface NavItem {
  label: string;
  href: string;
  iconPath: string;
}
