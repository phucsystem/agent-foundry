"use client";

import { useCreateTopup } from "@/lib/hooks/use-credits";
import { TOPUP_PACKAGES } from "@/lib/types/content";

export function TopupPackages() {
  const createTopup = useCreateTopup();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {TOPUP_PACKAGES.map((pkg) => (
        <button
          key={pkg.key}
          onClick={() => createTopup.mutate({ package: pkg.key })}
          disabled={createTopup.isPending}
          className="p-6 rounded-xl border border-border bg-surface hover:border-primary/50 hover:shadow-md transition-all text-left disabled:opacity-50"
        >
          <div className="text-2xl font-bold text-text-primary">{pkg.label}</div>
          <div className="text-sm text-text-secondary mt-1">
            {(pkg.creditsCents / 100).toFixed(0)} credits
          </div>
          {pkg.bonusPercent > 0 && (
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              +{pkg.bonusPercent}% bonus
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
