"use client";

import type { Agent } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";

interface AgentHeroProps {
  agent: Agent;
}

export function AgentHero({ agent }: AgentHeroProps) {
  const metaItems = [
    { icon: "lucide:clock", text: `Avg ${agent.avgRuntime ?? "--"} per task` },
    { icon: "lucide:dollar-sign", text: `~$${agent.avgCost?.toFixed(2) ?? "--"} avg cost` },
    { icon: "lucide:check-circle", text: `${agent.totalTasks.toLocaleString()} tasks completed` },
    { icon: "lucide:star", text: "4.7 rating" },
  ];

  return (
    <div className="grid grid-cols-[auto_1fr] gap-8 items-start p-8 bg-white dark:bg-slate-800 border border-border rounded-md mb-8">
      <Avatar
        initials={agent.initials}
        gradientFrom={agent.gradientFrom}
        gradientTo={agent.gradientTo}
        size="xl"
      />
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          {agent.available && <Badge variant="success">Active</Badge>}
        </div>
        <div className="text-lg text-text-secondary mb-3">{agent.role}</div>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          {metaItems.map((item, index) => (
            <span key={item.text} className="flex items-center gap-1.5">
              {index > 0 && <span className="w-1 h-1 rounded-full bg-border" />}
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Icon icon={item.icon} width={14} height={14} className="shrink-0" />
                {item.text}
              </span>
            </span>
          ))}
        </div>

        <p className="text-text-secondary leading-relaxed">{agent.description}</p>
      </div>
    </div>
  );
}
