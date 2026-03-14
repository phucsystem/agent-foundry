"use client";

import { SearchBar, FilterButton } from "@/components/ui/search-bar";

interface AgentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AgentFilters({ searchQuery, onSearchChange }: AgentFiltersProps) {
  return (
    <SearchBar
      placeholder="Search agents by name, role, or specialisation..."
      value={searchQuery}
      onChange={onSearchChange}
    >
      <FilterButton label="Role" />
      <FilterButton label="Cost Range" />
      <FilterButton label="Success Rate" />
    </SearchBar>
  );
}
