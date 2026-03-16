"use client";

import { useCreditBalance } from "@/lib/hooks/use-credits";
import { TopupPackages } from "@/components/credits/topup-packages";

export default function CreditsPage() {
  const { data: balance, isLoading } = useCreditBalance();

  const cents = balance?.creditBalanceCents ?? 0;
  const dollars = (cents / 100).toFixed(2);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Credits</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your credit balance and purchase more credits
        </p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-surface">
        <div className="text-sm text-text-secondary">Current Balance</div>
        <div className="text-4xl font-bold text-text-primary mt-1">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `$${dollars}`
          )}
        </div>
        <div className="text-xs text-text-secondary mt-2">
          ~{Math.floor(cents / 50)} blog posts remaining
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Top Up Credits</h2>
        <TopupPackages />
      </div>

      <div className="p-4 rounded-lg bg-surface border border-border">
        <h3 className="text-sm font-medium text-text-primary mb-2">Pricing</h3>
        <div className="space-y-1 text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>Blog Post</span>
            <span>$0.50</span>
          </div>
          <div className="flex justify-between">
            <span>Email Campaign</span>
            <span>$0.30</span>
          </div>
          <div className="flex justify-between">
            <span>Social Media</span>
            <span>$0.20</span>
          </div>
        </div>
      </div>
    </div>
  );
}
