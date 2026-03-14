import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Providers } from "@/components/layout/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Agent Foundry</title>
        <meta name="description" content="Build and hire specialised AI agents" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
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
