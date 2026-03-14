import Link from "next/link";
import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isDisabled = !agent.available;

  return (
    <Link
      href={isDisabled ? "#" : `/agents/${agent.id}`}
      className={`block bg-white dark:bg-slate-800 border border-border rounded-md p-6 no-underline text-inherit transition-all hover:shadow-card hover:-translate-y-0.5 ${
        isDisabled ? "opacity-60 pointer-events-none" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          initials={agent.initials}
          gradientFrom={agent.gradientFrom}
          gradientTo={agent.gradientTo}
        />
        <div>
          <div className="text-base font-semibold">{agent.name}</div>
          <div className="text-sm text-text-secondary">{agent.role}</div>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-text-secondary mb-4">
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {agent.successRate != null ? `${agent.successRate}%` : "--"}
          </div>
          <div>Success Rate</div>
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {agent.avgCost != null ? `~$${agent.avgCost.toFixed(2)}` : "--"}
          </div>
          <div>Avg Cost</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        {agent.available ? (
          <div className="text-lg font-bold">
            ${agent.weeklyPrice}{" "}
            <span className="text-sm font-normal text-text-secondary">/week</span>
          </div>
        ) : (
          <Badge variant="neutral">Coming Soon</Badge>
        )}
        <Button
          variant={agent.available ? "primary" : "secondary"}
          size="sm"
          disabled={isDisabled}
        >
          Hire
        </Button>
      </div>
    </Link>
  );
}
