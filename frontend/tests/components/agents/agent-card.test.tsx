import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/agents/agent-card";
import type { Agent } from "@/lib/types";

const mockAgent: Agent = {
  id: "coder",
  name: "Coder Agent",
  role: "Software Developer",
  initials: "CA",
  gradientFrom: "#3B82F6",
  gradientTo: "#2563EB",
  successRate: 95,
  avgCost: 2.5,
  avgRuntime: "45s",
  totalTasks: 100,
  weeklyPrice: 52,
  description: "Write clean code",
  specialisation: "Software Development",
  tools: ["code_interpreter"],
  llmBackend: "Claude Sonnet",
  available: true,
};

describe("AgentCard", () => {
  it("renders agent name and role", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("Coder Agent")).toBeInTheDocument();
    expect(screen.getByText("Software Developer")).toBeInTheDocument();
  });

  it("renders initials in avatar", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("CA")).toBeInTheDocument();
  });

  it("displays success rate", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("displays avg cost", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("~$2.50")).toBeInTheDocument();
  });

  it("displays weekly price", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText(/\$52/)).toBeInTheDocument();
  });

  it("renders Hire button", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("Hire")).toBeInTheDocument();
  });

  it("links to agent detail page", () => {
    render(<AgentCard agent={mockAgent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agents/coder");
  });

  it("shows Coming Soon badge when unavailable", () => {
    const unavailableAgent = { ...mockAgent, available: false };
    render(<AgentCard agent={unavailableAgent} />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("disables link when unavailable", () => {
    const unavailableAgent = { ...mockAgent, available: false };
    render(<AgentCard agent={unavailableAgent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");
  });

  it("shows dashes when success rate is null", () => {
    const noStatsAgent = { ...mockAgent, successRate: null, avgCost: null };
    render(<AgentCard agent={noStatsAgent} />);
    const dashes = screen.getAllByText("--");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
