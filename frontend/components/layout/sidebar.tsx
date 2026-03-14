"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-[var(--width-sidebar)] bg-white dark:bg-[#020617] border-r border-border fixed top-0 left-0 bottom-0 overflow-y-auto z-10 flex-col hidden md:flex">
      <Link
        href="/agents"
        className="block px-6 mb-8 mt-6 text-lg font-bold text-primary no-underline"
      >
        Agent Foundry
      </Link>

      <ul className="list-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "bg-primary/8 text-primary border-r-3 border-primary"
                    : "text-text-secondary hover:bg-surface hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5 shrink-0"
                >
                  <path d={item.iconPath} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <ThemeToggle />
    </nav>
  );
}
