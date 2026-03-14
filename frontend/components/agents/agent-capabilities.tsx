"use client";

import type { AgentCapability } from "@/lib/types";
import { Icon } from "@iconify/react";

interface AgentCapabilitiesProps {
  capabilities: AgentCapability[];
}

export function AgentCapabilities({ capabilities }: AgentCapabilitiesProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((cap) => (
          <div
            key={cap.name}
            className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border border-border rounded-md transition-colors hover:border-primary"
          >
            <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${cap.bgClass}`}>
              <Icon icon={cap.icon} width={18} height={18} className={cap.colorClass} />
            </div>
            <div>
              <div className="text-sm font-semibold mb-0.5">{cap.name}</div>
              <div className="text-xs text-text-secondary leading-relaxed">{cap.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
