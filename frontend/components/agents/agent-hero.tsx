import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AgentHeroProps {
  agent: Agent;
}

export function AgentHero({ agent }: AgentHeroProps) {
  return (
    <div className="flex gap-8 items-start p-8 bg-white dark:bg-slate-800 border border-border rounded-md mb-8">
      <Avatar
        initials={agent.initials}
        gradientFrom={agent.gradientFrom}
        gradientTo={agent.gradientTo}
        size="xl"
      />
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-1">{agent.name}</h1>
        <div className="text-lg text-text-secondary mb-4">{agent.role}</div>
        <p className="text-text-secondary leading-relaxed mb-6">{agent.description}</p>
        <div className="flex gap-2">
          <Button variant="primary">Hire This Agent</Button>
          <Button variant="secondary">View Sample Outputs</Button>
        </div>
      </div>
    </div>
  );
}
