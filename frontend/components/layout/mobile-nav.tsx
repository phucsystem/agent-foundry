"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#020617] border-b border-border">
        <Link href="/agents" className="flex items-center gap-2.5 no-underline">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            agent<span className="text-[#00D4FF]">4</span>startup
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text-secondary cursor-pointer"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav className="bg-white dark:bg-[#020617] border-b border-border px-4 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-2 text-sm font-medium no-underline rounded transition-colors ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-text-secondary hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
