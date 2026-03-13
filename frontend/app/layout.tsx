import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Foundry",
  description: "Build and hire specialised AI agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h1 className="text-xl font-bold">Agent Foundry</h1>
        </header>
        <main className="px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
