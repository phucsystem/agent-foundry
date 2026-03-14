import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Define Your Task</h1>
        <p className="text-base text-text-secondary">
          Tell us what you need and we&apos;ll match you with the right agent.
        </p>
      </div>
      <TaskForm />
    </>
  );
}
