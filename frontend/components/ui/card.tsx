interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  hoverable = true,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-border rounded-md p-6 shadow-subtle transition-shadow ${
        hoverable ? "hover:shadow-card" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
