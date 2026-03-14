"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-6 py-2 mt-auto text-sm text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors w-full cursor-pointer"
      aria-label="Toggle theme"
      type="button"
    >
      <span className="w-5 h-5 flex items-center justify-center text-base">
        {isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
      </span>
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
