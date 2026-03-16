"use client";

import { useCreditBalance } from "@/lib/hooks/use-credits";

export function CreditBalance() {
  const { data: balance, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <span className="text-xs text-text-secondary animate-pulse">...</span>
    );
  }

  const cents = balance?.creditBalanceCents ?? 0;
  const dollars = (cents / 100).toFixed(2);
  const colorClass =
    cents > 300
      ? "text-success"
      : cents > 100
        ? "text-warning"
        : "text-error";

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      ${dollars}
    </span>
  );
}
