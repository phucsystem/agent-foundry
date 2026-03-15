"use client";

import { useState } from "react";
import {
  MOCK_BILLING_BALANCE,
  MOCK_BILLING_AVG_COST,
  MOCK_AGENT_USAGE,
  MOCK_TRANSACTIONS,
} from "@/lib/mock-data";
import { KpiCard } from "@/components/ui/kpi-card";
import { CreditBalanceCard } from "@/components/billing/credit-balance-card";
import { UsageChart } from "@/components/billing/usage-chart";
import { TransactionHistory } from "@/components/billing/transaction-history";
import { TopupModal } from "@/components/billing/topup-modal";

export default function BillingPage() {
  const [balance, setBalance] = useState(MOCK_BILLING_BALANCE);
  const [showTopup, setShowTopup] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalSpent = MOCK_AGENT_USAGE.reduce((sum, usage) => sum + usage.amountUsd, 0);

  const handleTopupSuccess = (credits: number) => {
    setBalance((prev) => prev + credits);
    setToastMessage(`Added ${credits} credits to your balance`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Billing</h1>
        <p className="text-base text-text-secondary">Manage credits and track spending.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Tasks Completed" value="23" change="+8 this week" changeType="positive" />
        <KpiCard label="Credits Used" value={`$${totalSpent.toFixed(2)}`} change="this week" changeType="positive" />
        <KpiCard label="Avg Cost/Task" value={`$${MOCK_BILLING_AVG_COST.toFixed(2)}`} change="-$0.30" changeType="positive" />
        <KpiCard label="Last Top-Up" value="$100" change="Mar 10, 2026" changeType="positive" />
      </div>

      {/* Two-column: Balance + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <CreditBalanceCard
          balanceUsd={balance}
          avgCostPerTask={MOCK_BILLING_AVG_COST}
          onTopUp={() => setShowTopup(true)}
        />
        <UsageChart
          usages={MOCK_AGENT_USAGE}
          totalSpent={totalSpent}
          weeklyBudget={100}
        />
      </div>

      {/* Transaction History */}
      <TransactionHistory transactions={MOCK_TRANSACTIONS} />

      {/* Top-Up Modal */}
      <TopupModal
        isOpen={showTopup}
        onClose={() => setShowTopup(false)}
        onSuccess={handleTopupSuccess}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-5 py-3 rounded-lg text-sm font-medium z-[60] shadow-lg animate-[fadeIn_0.2s_ease]">
          {toastMessage}
        </div>
      )}
    </>
  );
}
