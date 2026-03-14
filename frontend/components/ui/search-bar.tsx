"use client";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  children,
}: SearchBarProps) {
  return (
    <div className="flex gap-2 mb-6">
      <input
        type="text"
        className="flex-1 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 dark:bg-slate-800 dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {children}
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  onClick?: () => void;
}

export function FilterButton({ label, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-md bg-white dark:bg-slate-800 text-sm cursor-pointer hover:bg-surface transition-colors"
    >
      {label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
