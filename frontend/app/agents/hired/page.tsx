"use client";

import { useState } from "react";
import Link from "next/link";
import { useHiredAgents, useCancelHire, useRehireAgent } from "@/lib/hooks/use-hired-agents";
import { KpiCard } from "@/components/ui/kpi-card";
import { HiredAgentRow } from "@/components/agents/hired-agent-row";
import { AgentSettingsModal } from "@/components/agents/agent-settings-modal";
import type { HiredAgent } from "@/lib/types";

export default function MyTeamPage() {
  const { data: agents = [], isLoading, error } = useHiredAgents();
  const cancelHire = useCancelHire();
  const rehireAgent = useRehireAgent();

  const [settingsTarget, setSettingsTarget] = useState<HiredAgent | null>(null);

  const activeAgents = agents.filter((agent) => agent.status === "active" || agent.status === "renewing_soon");
  const totalTasks = agents.reduce((sum, agent) => sum + agent.stats.totalTasks, 0);
  const avgSuccessRate = activeAgents.length > 0
    ? Math.round(activeAgents.reduce((sum, agent) => sum + agent.stats.successRate, 0) / activeAgents.length)
    : 0;
  const weeklySpend = agents.reduce((sum, agent) => sum + agent.stats.avgCostUsd * agent.stats.totalTasks, 0);

  const handleCancel = (hireId: string) => {
    const agent = agents.find((agent) => agent.hireId === hireId);
    if (agent && confirm(`Cancel ${agent.agentName} hire? Agent released at end of billing cycle.`)) {
      cancelHire.mutate(hireId);
    }
  };

  const handleRehire = (hireId: string) => {
    rehireAgent.mutate(hireId);
  };

  const handleSettings = (hireId: string) => {
    const agent = agents.find((agent) => agent.hireId === hireId);
    if (agent) setSettingsTarget(agent);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Team</h1>
          <p className="text-base text-text-secondary">
            Manage your hired agents and track performance.
          </p>
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium no-underline hover:opacity-90 transition-opacity"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Hire More
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Active Agents" value={String(activeAgents.length)} change={`${agents.length} total`} changeType="positive" />
        <KpiCard label="Total Tasks" value={String(totalTasks)} change="all time" changeType="positive" />
        <KpiCard label="Success Rate" value={`${avgSuccessRate}%`} change="avg across team" changeType="positive" />
        <KpiCard label="Total Spend" value={`$${weeklySpend.toFixed(0)}`} change="estimated" changeType="positive" />
      </div>

      {isLoading && (
        <div className="text-center py-12 text-text-secondary">Loading your team...</div>
      )}

      {error && (
        <div className="text-center py-12 text-error">
          Failed to load hired agents. Is the backend running?
        </div>
      )}

      {!isLoading && !error && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Hired Agents</h2>
          {agents.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-lg">
              <p className="text-text-secondary mb-4">No agents hired yet.</p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium no-underline"
              >
                Hire an Agent
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {agents.map((agent) => (
                <HiredAgentRow
                  key={agent.hireId}
                  agent={agent}
                  onSettings={handleSettings}
                  onCancel={handleCancel}
                  onRehire={handleRehire}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {settingsTarget && (
        <AgentSettingsModal
          hireId={settingsTarget.hireId}
          agentName={settingsTarget.agentName}
          agentColor={settingsTarget.agentColor}
          isOpen={true}
          onClose={() => setSettingsTarget(null)}
        />
      )}
    </>
  );
}
