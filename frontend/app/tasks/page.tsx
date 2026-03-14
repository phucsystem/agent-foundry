"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_TASKS, MOCK_KPIS } from "@/lib/mock-data";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { KpiCard } from "@/components/ui/kpi-card";
import { SearchBar, FilterButton } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";

export default function TaskBoardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = MOCK_TASKS.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Task Board</h1>
          <p className="text-text-secondary">This week &middot; March 10 &ndash; 16, 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">List</Button>
          <Button variant="primary" size="sm">Board</Button>
          <Link href="/tasks/new">
            <Button variant="primary" size="sm">+ New Task</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {MOCK_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <SearchBar
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={setSearchQuery}
      >
        <FilterButton label="Agent" />
        <FilterButton label="Priority" />
        <FilterButton label="Date Range" />
      </SearchBar>

      <KanbanBoard tasks={filteredTasks} />
    </>
  );
}
