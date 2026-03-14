import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "Agent Foundry",
  description: "Build and hire specialised AI agents",
};

const THEME_SCRIPT = `
(function() {
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-surface text-slate-900 dark:bg-[#0F172A] dark:text-slate-100">
        <Providers>
          <MobileNav />
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-[var(--width-sidebar)] p-4 md:p-8 min-h-screen">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
