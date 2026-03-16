export interface ContentTaskInput {
  topic: string;
  contentType: "blog" | "email" | "social";
  brandConfigId: string;
  targetWordCount: number;
  keywords: string[];
  competitorUrls: string[];
  additionalContext?: string;
}

export interface SocialVariant {
  platform: "linkedin" | "twitter" | "instagram" | "facebook" | "email";
  content: string;
  hashtags: string[];
  characterCount: number;
}

export interface QualityDetails {
  clarity: number;
  dataAccuracy: number;
  brandVoice: number;
  seoOptimization: number;
  engagement: number;
  weightedTotal: number;
}

export interface ContentOutput {
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  publishReady: boolean;
  qualityScore: number;
  socialVariants: SocialVariant[];
  costUsd: number;
  qualityDetails?: QualityDetails;
}

export interface ContentTask {
  taskId: string;
  status: "pending" | "running" | "completed" | "failed";
  taskType: string;
  topic: string;
  createdAt: string;
  completedAt?: string;
  output?: ContentOutput;
  tokensUsed: number;
  costCents: number;
}

export interface CreateTaskResponse {
  taskId: string;
  status: string;
  estimatedCostCents: number;
}

export interface CreditBalance {
  userId: string;
  email: string;
  creditBalanceCents: number;
}

export interface TopupPackage {
  key: "small" | "medium" | "large";
  label: string;
  priceCents: number;
  creditsCents: number;
  bonusPercent: number;
}

export const TOPUP_PACKAGES: TopupPackage[] = [
  { key: "small", label: "$10", priceCents: 1000, creditsCents: 1000, bonusPercent: 0 },
  { key: "medium", label: "$25", priceCents: 2500, creditsCents: 2750, bonusPercent: 10 },
  { key: "large", label: "$50", priceCents: 5000, creditsCents: 6000, bonusPercent: 20 },
];
