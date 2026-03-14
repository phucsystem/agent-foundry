import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_AGENTS, MOCK_REVIEWS, MOCK_SAMPLE_OUTPUTS, MOCK_PRICING_TIERS } from "@/lib/mock-data";
import { AgentHero } from "@/components/agents/agent-hero";
import { AgentStatsBar } from "@/components/agents/agent-stats-bar";
import { AgentReviews } from "@/components/agents/agent-reviews";
import { AgentPricing } from "@/components/agents/agent-pricing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const agent = MOCK_AGENTS.find((agentItem) => agentItem.id === id);

  if (!agent) {
    notFound();
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

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">About This Agent</h2>
        <Card hoverable={false}>
          <div className="mb-4">
            <strong className="text-sm">Specialisation</strong>
            <p className="text-sm text-text-secondary">{agent.specialisation}</p>
          </div>
          <div className="mb-4">
            <strong className="text-sm">Tools</strong>
            <div className="flex gap-2 mt-2 flex-wrap">
              {agent.tools.map((tool) => (
                <Badge key={tool} variant="info">{tool}</Badge>
              ))}
            </div>
          </div>
          <div>
            <strong className="text-sm">LLM Backend</strong>
            <p className="text-sm text-text-secondary">{agent.llmBackend}</p>
          </div>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Sample Outputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_SAMPLE_OUTPUTS.map((sample) => (
            <Card key={sample.id}>
              <div className="flex justify-between items-center mb-2">
                <strong className="text-sm">{sample.title}</strong>
                <Badge variant="success">Completed</Badge>
              </div>
              <p className="text-sm text-text-secondary mb-4">{sample.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Cost: ${sample.cost.toFixed(2)}</span>
                <span className="text-text-muted">Runtime: {sample.runtime}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <AgentReviews reviews={MOCK_REVIEWS} />
      <AgentPricing tiers={MOCK_PRICING_TIERS} />
    </>
  );
}
