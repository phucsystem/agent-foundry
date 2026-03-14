"use client";

import { useRouter } from "next/navigation";
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();

  const handleSubmit = async (agentId: string, goal: string, budgetUsd: number) => {
    await createTask.mutateAsync({ agent_id: agentId, goal, budget_usd: budgetUsd });
    router.push("/tasks");
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Define Your Task</h1>
        <p className="text-base text-text-secondary">
          Tell us what you need and we&apos;ll match you with the right agent.
        </p>
      </div>
      <TaskForm onSubmit={handleSubmit} isSubmitting={createTask.isPending} />
    </>
  );
}
