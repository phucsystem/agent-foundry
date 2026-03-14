"use client";

import { use } from "react";
import Link from "next/link";
import { useAgent } from "@/lib/hooks/use-agents";
import {
  MOCK_REVIEWS,
  MOCK_CAPABILITIES,
  MOCK_USE_CASES,
  MOCK_PERFORMANCE,
  MOCK_REVIEW_SUMMARY,
} from "@/lib/mock-data";
import { AgentHero } from "@/components/agents/agent-hero";
import { AgentStatsBar } from "@/components/agents/agent-stats-bar";
import { AgentCapabilities } from "@/components/agents/agent-capabilities";
import { AgentUseCases } from "@/components/agents/agent-use-cases";
import { AgentPerformance } from "@/components/agents/agent-performance";
import { AgentReviews } from "@/components/agents/agent-reviews";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = use(params);
  const { data: agent, isLoading, error } = useAgent(id);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-text-secondary">Loading agent...</div>
    );
  }

  if (error || !agent) {
    return (
      <div className="text-center py-12 text-error">
        {error ? "Failed to load agent. Is the backend running?" : "Agent not found."}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/agents" className="text-sm text-text-muted no-underline hover:text-primary">
          &larr; Back to Marketplace
        </Link>
      </div>

      <AgentHero agent={agent} />
      <AgentStatsBar agent={agent} />

      {/* Hire CTA */}
      <div className="flex items-center justify-between gap-6 p-6 bg-white dark:bg-slate-800 border-2 border-primary rounded-lg mb-8">
        <div>
          <div className="text-2xl font-bold text-primary">
            ${agent.weeklyPrice} <span className="text-sm font-normal text-text-secondary">/week</span>
          </div>
          <div className="text-sm text-text-secondary mt-1">
            Unlimited tasks, standard priority, email support. Cancel anytime.
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="primary" className="px-8 py-3">Hire This Agent</Button>
          <Button variant="secondary">Compare Plans</Button>
        </div>
      </div>

      <AgentCapabilities capabilities={MOCK_CAPABILITIES} />
      <AgentUseCases useCases={MOCK_USE_CASES} />
      <AgentPerformance metrics={MOCK_PERFORMANCE} />

      {/* About Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">About This Agent</h2>
        <Card hoverable={false}>
          <div className="mb-4">
            <strong className="text-sm">Specialisation</strong>
            <p className="text-sm text-text-secondary mt-1">{agent.specialisation}</p>
          </div>
          <div className="mb-4">
            <strong className="text-sm">LLM Backend</strong>
            <p className="text-sm text-text-secondary mt-1">{agent.llmBackend}</p>
          </div>
          <div>
            <strong className="text-sm">Guardrails</strong>
            <p className="text-sm text-text-secondary mt-1">
              Prompt injection detection, $10 per-task budget cap, output schema validation, 5-minute hard timeout. All executions logged to Langfuse.
            </p>
          </div>
        </Card>
      </section>

      <AgentReviews reviews={MOCK_REVIEWS} summary={MOCK_REVIEW_SUMMARY} />
    </>
  );
}
