"use client";

import { useState } from "react";
import type { Agent, PricingTier } from "@/lib/types";
import { MOCK_PRICING_TIERS } from "@/lib/mock-data";
import { useHireAgent } from "@/lib/hooks/use-hired-agents";
import { Avatar } from "@/components/ui/avatar";

interface HireConfirmModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hireId: string) => void;
}

const PLAN_MAP: Record<string, { plan: string; budget: number }> = {
  Solo: { plan: "solo", budget: 100 },
  "Small Team": { plan: "team", budget: 350 },
  "Full Squad": { plan: "squad", budget: 1000 },
};

export function HireConfirmModal({ agent, isOpen, onClose, onSuccess }: HireConfirmModalProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier>(MOCK_PRICING_TIERS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hireAgent = useHireAgent();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setErrorMessage(null);
    const config = PLAN_MAP[selectedTier.name] ?? { plan: "solo", budget: 100 };
    hireAgent.mutate(
      { agentId: agent.id, plan: config.plan, weeklyBudgetUsd: config.budget },
      {
        onSuccess: (data) => onSuccess(data.hire_id),
        onError: (err) => setErrorMessage(err instanceof Error ? err.message : "Failed to hire agent"),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#020617] border border-border rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar
              initials={agent.initials}
              gradientFrom={agent.gradientFrom}
              gradientTo={agent.gradientTo}
              size="sm"
            />
            <span className="text-base font-semibold">Hire {agent.name}</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Choose a plan for <strong>{agent.name}</strong>. Cancel anytime — access continues until end of billing cycle.
          </p>

          {/* Plan selection */}
          <div className="flex flex-col gap-2">
            {MOCK_PRICING_TIERS.map((tier) => (
              <button
                key={tier.name}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTier.name === tier.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{tier.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {tier.features.slice(0, 2).join(" · ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">${tier.price}</div>
                  <div className="text-xs text-text-muted">{tier.period}</div>
                </div>
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="text-sm text-error bg-error/10 rounded-lg p-3">{errorMessage}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={hireAgent.isPending}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {hireAgent.isPending ? "Hiring..." : `Confirm — $${selectedTier.price}${selectedTier.period}`}
          </button>
        </div>
      </div>
    </div>
  );
}
