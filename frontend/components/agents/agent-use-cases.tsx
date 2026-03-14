"use client";

import { Icon } from "@iconify/react";

interface AgentUseCasesProps {
  useCases: string[];
}

export function AgentUseCases({ useCases }: AgentUseCasesProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Common Use Cases</h2>
      <div className="flex flex-wrap gap-2">
        {useCases.map((useCase) => (
          <span
            key={useCase}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border rounded-full text-sm transition-colors hover:border-primary hover:bg-primary/[0.04] cursor-default"
          >
            <Icon icon="lucide:check" width={14} height={14} className="text-primary" />
            {useCase}
          </span>
        ))}
      </div>
    </section>
  );
}
