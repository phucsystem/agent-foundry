"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, apiPost } from "@/lib/api-client";
import type { CreditBalance } from "@/lib/types/content";

export function useCreditBalance() {
  return useQuery<CreditBalance>({
    queryKey: ["credit-balance"],
    queryFn: () => apiClient<CreditBalance>("/api/users/me"),
    staleTime: 30000,
  });
}

interface TopupResponse {
  checkoutUrl: string;
  sessionId: string;
}

export function useCreateTopup() {
  return useMutation<TopupResponse, Error, { package: "small" | "medium" | "large" }>({
    mutationFn: (input) => apiPost<TopupResponse>("/api/credits/topup", input),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });
}
