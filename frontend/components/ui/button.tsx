interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "default";
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary:
    "bg-transparent border border-border text-slate-900 dark:text-white hover:bg-surface",
  danger: "bg-error text-white hover:bg-error-dark",
  success: "bg-success text-white hover:bg-success-dark",
};

const SIZE_CLASSES: Record<string, string> = {
  default: "px-4 py-2.5 text-sm min-h-[44px]",
  sm: "px-3 py-1.5 text-xs min-h-[32px]",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-pointer transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
