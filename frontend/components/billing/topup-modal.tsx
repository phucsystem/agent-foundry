"use client";

import { useState } from "react";
import type { CreditPackage } from "@/lib/types";
import { MOCK_CREDIT_PACKAGES } from "@/lib/mock-data";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credits: number) => void;
}

export function TopupModal({ isOpen, onClose, onSuccess }: TopupModalProps) {
  const [selected, setSelected] = useState<CreditPackage>(MOCK_CREDIT_PACKAGES[2]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(selected.credits + selected.bonus);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#020617] border border-border rounded-xl w-full max-w-[440px] shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="text-base font-semibold">Top Up Credits</span>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {MOCK_CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.amount}
                type="button"
                onClick={() => setSelected(pkg)}
                className={`p-4 rounded-lg border-2 text-center transition-colors ${
                  selected.amount === pkg.amount
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="text-lg font-bold">${pkg.amount}</div>
                <div className="text-sm text-text-secondary">{pkg.credits} credits</div>
                {pkg.bonus > 0 && (
                  <div className="text-xs text-success font-semibold mt-1">+{pkg.bonus} bonus</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay $${selected.amount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
