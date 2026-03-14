"use client";

interface TabsProps {
  items: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
}

export function Tabs({ items, activeIndex, onTabChange, className = "" }: TabsProps) {
  return (
    <div className={`flex border-b-2 border-border mb-6 ${className}`}>
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => onTabChange(index)}
          className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors -mb-[2px] border-b-2 ${
            index === activeIndex
              ? "text-primary border-primary"
              : "text-text-secondary border-transparent hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
