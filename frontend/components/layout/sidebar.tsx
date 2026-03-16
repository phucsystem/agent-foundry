"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { NAV_ITEMS } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import { AuthButton } from "./auth-button";
import { CreditBalance } from "@/components/credits/credit-balance";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-[var(--width-sidebar)] bg-white dark:bg-[#020617] border-r border-border fixed top-0 left-0 bottom-0 overflow-y-auto z-10 flex-col hidden md:flex">
      <Link
        href="/agents"
        className="flex items-center gap-2.5 px-6 mb-8 mt-6 no-underline"
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          agent<span className="text-[#00D4FF]">4</span>startup
        </span>
      </Link>

      <ul className="list-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") &&
              !NAV_ITEMS.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href) &&
                  (pathname === other.href || pathname.startsWith(other.href + "/"))
              ));

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
                <Icon icon={item.icon} width={20} height={20} className="shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <div className="px-6 py-2 flex items-center justify-between border-t border-border">
          <span className="text-xs text-text-secondary">Credits</span>
          <CreditBalance />
        </div>
        <AuthButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
