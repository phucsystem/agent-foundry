"use client";

import { useToastStore, type ToastVariant } from "@/lib/stores/toast-store";
import { Icon } from "@iconify/react";

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: string }> = {
  success: { bg: "bg-success", icon: "lucide:check-circle" },
  error: { bg: "bg-error", icon: "lucide:x-circle" },
  warning: { bg: "bg-warning", icon: "lucide:alert-triangle" },
  info: { bg: "bg-primary", icon: "lucide:info" },
};

export function Snackbar() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            className={`${style.bg} text-white px-4 py-3 rounded-lg text-sm font-medium shadow-elevated flex items-center gap-2 animate-[slideUp_0.2s_ease]`}
          >
            <Icon icon={style.icon} width={16} height={16} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Icon icon="lucide:x" width={14} height={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
