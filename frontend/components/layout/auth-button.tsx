"use client";

import { useAuth } from "./auth-guard";

export function AuthButton() {
  const { isAuthenticated, email } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="px-6 py-2 text-sm">
        <div className="text-text-secondary truncate">{email ?? "User"}</div>
      </div>
    );
  }

  return null;
}
