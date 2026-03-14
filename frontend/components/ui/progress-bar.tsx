interface ProgressBarProps {
  percentage: number;
  color?: string;
  animated?: boolean;
  height?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  color = "bg-primary",
  animated = false,
  height = "h-2",
  className = "",
}: ProgressBarProps) {
  return (
    <div className={`${height} bg-surface rounded-full overflow-hidden flex-1 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${color} ${
          animated ? "animate-kanban-pulse" : ""
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}
