"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const SELECTABLE_AGENTS = MOCK_AGENTS.filter((agent) => agent.available);

interface TaskFormProps {
  onSubmit?: (agentId: string, goal: string, budgetUsd: number) => Promise<void>;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting = false }: TaskFormProps) {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(SELECTABLE_AGENTS[0]?.id ?? "");
  const [budget, setBudget] = useState(50);

  const selectedAgent = SELECTABLE_AGENTS.find((agent) => agent.id === selectedAgentId);

  const [goalError, setGoalError] = useState("");

  const handleSubmit = async () => {
    if (!goal.trim()) {
      setGoalError("Please describe what you need the agent to do.");
      return;
    }
    setGoalError("");
    if (onSubmit) {
      await onSubmit(selectedAgentId, goal, budget);
    } else {
      router.push("/tasks");
    }
  };

  return (
    <>
      {/* Step 1: Goal */}
      <Card className="mb-8" hoverable={false}>
        <h2 className="text-lg font-semibold mb-4">1. What do you need?</h2>
        <Textarea
          id="task-goal"
          label="Task Goal"
          placeholder="e.g., Write unit tests for login flow"
          helper="Describe what you need the agent to do. Be specific about the expected output."
          value={goal}
          onChange={(event) => {
            setGoal(event.target.value);
            if (goalError) setGoalError("");
          }}
        />
        {goalError && <p className="text-sm text-error mt-1">{goalError}</p>}
      </Card>

      {/* Step 2: Context Upload */}
      <Card className="mb-8" hoverable={false}>
        <h2 className="text-lg font-semibold mb-4">2. Upload Context Documents</h2>
        <div className="border-2 border-dashed border-border rounded-md p-12 text-center text-text-secondary cursor-pointer hover:border-primary hover:bg-primary/3 transition-colors">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mx-auto mb-2 text-text-muted">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="font-semibold mb-1">Drag &amp; drop files here</p>
          <p className="text-sm text-text-muted">Supports PDF, Markdown, and text files. Max 10MB per file.</p>
        </div>
      </Card>

      {/* Step 3: Agent Selection */}
      <Card className="mb-8" hoverable={false}>
        <h2 className="text-lg font-semibold mb-4">3. Select Agent</h2>
        <div className="bg-primary/8 border border-primary/20 text-primary rounded-md p-4 text-sm mb-4">
          Based on your goal, we recommend <strong>Coder</strong> for this task.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SELECTABLE_AGENTS.slice(0, 3).map((agent) => (
            <label
              key={agent.id}
              className={`block cursor-pointer border-2 rounded-md p-4 transition-colors ${
                selectedAgentId === agent.id ? "border-primary" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="agent"
                value={agent.id}
                checked={selectedAgentId === agent.id}
                onChange={() => setSelectedAgentId(agent.id)}
                className="hidden"
              />
              <div className="flex items-center gap-2 mb-2">
                <Avatar initials={agent.initials} gradientFrom={agent.gradientFrom} gradientTo={agent.gradientTo} size="sm" />
                <strong className="text-sm">{agent.name}</strong>
              </div>
              <p className="text-xs text-text-muted">{agent.role}</p>
            </label>
          ))}
        </div>
      </Card>

      {/* Step 4: Budget */}
      <Card className="mb-8" hoverable={false}>
        <h2 className="text-lg font-semibold mb-4">4. Set Budget</h2>
        <div className="py-4">
          <input
            type="range"
            min={10}
            max={500}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full h-2 appearance-none bg-surface rounded-full outline-none"
          />
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>$10</span>
            <span>$500</span>
          </div>
          <div className="text-center text-lg font-semibold text-primary mt-4 p-4 bg-primary/5 rounded-md">
            Budget cap: ${budget} — estimated cost ~$3.50 based on similar tasks
          </div>
        </div>
      </Card>

      {/* Step 5: Review */}
      <Card className="mb-8" hoverable={false}>
        <h2 className="text-lg font-semibold mb-4">5. Review &amp; Submit</h2>
        <div className="overflow-x-auto border border-border rounded-md">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-border">
                <td className="font-semibold p-3 w-40">Goal</td>
                <td className="text-text-muted p-3">{goal || "(Not specified)"}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="font-semibold p-3">Context Files</td>
                <td className="text-text-muted p-3">auth-module.md (24KB)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="font-semibold p-3">Agent</td>
                <td className="p-3">
                  {selectedAgent && (
                    <div className="flex items-center gap-2">
                      <Avatar initials={selectedAgent.initials} gradientFrom={selectedAgent.gradientFrom} gradientTo={selectedAgent.gradientTo} size="sm" />
                      {selectedAgent.name}
                    </div>
                  )}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="font-semibold p-3">Estimated Cost</td>
                <td className="text-text-muted p-3">~$3.50</td>
              </tr>
              <tr>
                <td className="font-semibold p-3">Budget Cap</td>
                <td className="text-text-muted p-3">${budget.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <Button variant="secondary">Save Draft</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Task"}
          </Button>
        </div>
      </Card>
    </>
  );
}
