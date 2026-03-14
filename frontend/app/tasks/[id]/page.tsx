import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_TASKS, MOCK_TASK_DETAIL_METRICS, MOCK_TIMELINE, MOCK_COST_SEGMENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TaskMetrics } from "@/components/tasks/task-metrics";
import { CostBreakdown } from "@/components/tasks/cost-breakdown";
import { TaskOutput } from "@/components/tasks/task-output";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { TaskRating } from "@/components/tasks/task-rating";
import { PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/lib/constants";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = MOCK_TASKS.find((taskItem) => taskItem.id === id);

  if (!task) {
    notFound();
  }

  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/tasks" className="text-primary no-underline">Task Board</Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-muted">{task.id}</span>
      </div>

      {/* Task Header */}
      <div className="bg-white dark:bg-slate-800 border border-border rounded-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant as "success" | "error" | "warning" | "info" | "neutral"}>
              {statusConfig.label}
            </Badge>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
              {priorityConfig.label}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Re-run Task</Button>
            <Button variant="secondary" size="sm">Share</Button>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
        <p className="text-sm text-text-secondary mb-4">{task.description}</p>
        <div className="flex gap-6 text-sm text-text-muted flex-wrap">
          <div className="flex items-center gap-2">
            <Avatar initials={task.agentInitials} gradientFrom={task.agentGradientFrom} gradientTo={task.agentGradientTo} size="sm" />
            <strong className="text-slate-900 dark:text-white">{task.agentName} v1.2</strong>
          </div>
          <span>Created {task.createdAt}</span>
          <span>By: Current User</span>
          <span>ID: {task.id}</span>
        </div>
      </div>

      <TaskMetrics metrics={MOCK_TASK_DETAIL_METRICS} />
      <CostBreakdown segments={MOCK_COST_SEGMENTS} />
      <TaskOutput />
      <TaskTimeline entries={MOCK_TIMELINE} />
      <TaskRating />

      <div className="flex gap-2 mb-8">
        <Link href="/tasks/new"><Button variant="primary">Hire This Agent Again</Button></Link>
        <Link href="/tasks"><Button variant="secondary">Back to Board</Button></Link>
        <Link href="/agents"><Button variant="secondary">Browse Agents</Button></Link>
      </div>
    </>
  );
}
