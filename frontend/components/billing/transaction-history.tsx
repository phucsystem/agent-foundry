"use client";

import type { BillingTransaction } from "@/lib/types";
import { Icon } from "@iconify/react";

interface TransactionHistoryProps {
  transactions: BillingTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-border rounded-lg">
      <div className="px-6 py-4 border-b border-border">
        <div className="text-sm font-semibold">Transaction History</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wide px-6 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wide px-3 py-3">Description</th>
              <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wide px-3 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wide px-3 py-3">Amount</th>
              <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wide px-6 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-border last:border-b-0">
                <td className="px-6 py-3">
                  <Icon
                    icon={transaction.type === "topup" ? "lucide:arrow-up-circle" : "lucide:arrow-down-circle"}
                    width={16}
                    height={16}
                    className={transaction.type === "topup" ? "text-success" : "text-error"}
                  />
                </td>
                <td className="px-3 py-3">{transaction.description}</td>
                <td className="px-3 py-3 text-text-muted whitespace-nowrap">{transaction.date}</td>
                <td className={`px-3 py-3 text-right font-semibold ${transaction.amountUsd >= 0 ? "text-success" : "text-error"}`}>
                  {transaction.amountUsd >= 0 ? "+" : ""}${Math.abs(transaction.amountUsd).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-right text-text-muted">${transaction.balanceUsd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
