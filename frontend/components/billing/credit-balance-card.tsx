import { Button } from "@/components/ui/button";

interface CreditBalanceCardProps {
  balanceUsd: number;
  avgCostPerTask: number;
  onTopUp: () => void;
}

export function CreditBalanceCard({ balanceUsd, avgCostPerTask, onTopUp }: CreditBalanceCardProps) {
  const estimatedTasks = avgCostPerTask > 0 ? Math.floor(balanceUsd / avgCostPerTask) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
      <div className="text-sm text-text-secondary mb-2">Credit Balance</div>
      <div className="text-3xl font-bold mb-1">${balanceUsd.toFixed(2)}</div>
      <div className="text-sm text-text-muted mb-4">
        ~{estimatedTasks} tasks remaining at avg ${avgCostPerTask.toFixed(2)}/task
      </div>
      <Button variant="primary" onClick={onTopUp}>Top Up Credits</Button>
    </div>
  );
}
