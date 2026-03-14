type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success dark:bg-success/15",
  error: "bg-error/10 text-error dark:bg-error/15",
  warning: "bg-warning/10 text-warning dark:bg-warning/15",
  info: "bg-primary/10 text-primary dark:bg-primary/15",
  neutral: "bg-neutral/10 text-neutral dark:bg-neutral/15",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
