"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgent } from "@/lib/hooks/use-agents";
import { useHiredAgents } from "@/lib/hooks/use-hired-agents";
import { useToastStore } from "@/lib/stores/toast-store";
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
import { HireConfirmModal } from "@/components/agents/hire-confirm-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: agent, isLoading, error } = useAgent(id);
  const { data: hiredAgents = [] } = useHiredAgents();

  const addToast = useToastStore((state) => state.addToast);
  const [showHireModal, setShowHireModal] = useState(false);

  const isAlreadyHired = hiredAgents.some(
    (hired) => hired.agentId === id && (hired.status === "active" || hired.status === "renewing_soon"),
  );

  const handleHireSuccess = useCallback(() => {
    setShowHireModal(false);
    addToast(`Successfully hired ${agent?.name}!`, "success");
    setTimeout(() => router.push("/agents/hired"), 1500);
  }, [agent?.name, router, addToast]);

  if (isLoading) {
    return <div className="text-center py-12 text-text-secondary">Loading agent...</div>;
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
          {isAlreadyHired ? (
            <Button variant="secondary" disabled className="px-8 py-3 opacity-60">
              Already Hired
            </Button>
          ) : (
            <Button variant="primary" className="px-8 py-3" onClick={() => setShowHireModal(true)}>
              Hire This Agent
            </Button>
          )}
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

      <HireConfirmModal
        agent={agent}
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        onSuccess={handleHireSuccess}
      />
    </>
  );
}
