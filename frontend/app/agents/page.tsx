"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentFilters } from "@/components/agents/agent-filters";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 8;

export default function AgentMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: agents = [], isLoading, error } = useAgents();

  const filteredAgents = agents.filter((agent) => {
    const query = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.role.toLowerCase().includes(query) ||
      agent.specialisation.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedAgents = filteredAgents.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Hire Expert AI Agents</h1>
        <p className="text-base text-text-secondary">
          Browse specialised agents and hire them for your projects on a weekly basis.
        </p>
      </div>

      <AgentFilters searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {isLoading && (
        <div className="text-center py-12 text-text-secondary">Loading agents...</div>
      )}

      {error && (
        <div className="text-center py-12 text-error">
          Failed to load agents. Is the backend running?
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pagedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No agents found matching your search.
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </>
  );
}
