"use client";

import { useEffect, useState } from "react";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

export function AuthButton() {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, email: null });

  useEffect(() => {
    fetch("/api/auth/status")
      .then((response) => response.json())
      .then((data) => setAuth(data))
      .catch(() => setAuth({ isAuthenticated: false, email: null }));
  }, []);

  if (auth.isAuthenticated) {
    return (
      <div className="px-6 py-2 mt-auto text-sm">
        <div className="text-text-secondary truncate mb-2">{auth.email ?? "User"}</div>
        <a
          href="/api/auth/sign-out"
          className="text-xs text-text-muted hover:text-error no-underline transition-colors"
        >
          Sign Out
        </a>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/sign-in"
      className="block px-6 py-2 mt-auto text-sm text-primary no-underline hover:underline"
    >
      Sign In
    </a>
  );
}
