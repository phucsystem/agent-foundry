import type { TimelineEntry } from "@/lib/types";

interface TaskTimelineProps {
  entries: TimelineEntry[];
}

export function TaskTimeline({ entries }: TaskTimelineProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Execution Timeline</h2>
      <div className="timeline-line">
        {entries.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="relative pb-6 last:pb-0">
            <div
              className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full z-10 ${entry.dotColor}`}
            />
            <div className="bg-white dark:bg-slate-800 border border-border rounded-md py-2 px-4">
              <div className="flex justify-between items-center">
                <strong className="text-sm">{entry.label}</strong>
                <span className="text-xs text-text-muted">{entry.timestamp}</span>
              </div>
              <p className="text-xs text-text-muted">{entry.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
