"use client";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AgentTaskChartProps {
  dailyTasks: number[];
  completed: number;
  failed: number;
  running: number;
  queued: number;
}

export function AgentTaskChart({ dailyTasks, completed, failed, running, queued }: AgentTaskChartProps) {
  const maxTasks = Math.max(...dailyTasks, 1);

  return (
    <div className="bg-white dark:bg-[#020617] border border-border rounded-lg p-6">
      <div className="text-sm font-semibold mb-4">Task Statistics</div>

      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
        Tasks per Day (Last 7 Days)
      </div>
      <div className="flex items-end gap-1 h-12 mt-2">
        {dailyTasks.map((count, index) => (
          <div
            key={index}
            className="flex-1 bg-primary rounded-t min-h-[4px] transition-[height] duration-300 hover:opacity-80"
            style={{ height: `${(count / maxTasks) * 100}%` }}
            title={`${DAY_LABELS[index]}: ${count} task${count !== 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {DAY_LABELS.map((label) => (
          <span key={label} className="flex-1 text-center text-[10px] text-text-muted">
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-6 mt-4 pt-4 border-t border-border">
        <StatusItem color="var(--color-success, #10B981)" label="Completed" count={completed} />
        <StatusItem color="var(--color-error, #EF4444)" label="Failed" count={failed} />
        <StatusItem color="var(--color-primary, #3B82F6)" label="Running" count={running} />
        <StatusItem color="var(--color-neutral, #6B7280)" label="Queued" count={queued} />
      </div>
    </div>
  );
}

function StatusItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span>
        {label}: <strong>{count}</strong>
      </span>
    </div>
  );
}
