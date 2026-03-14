"use client";

import { useEffect, useState } from "react";

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  name: string | null;
}

const MOCK_USER: AuthState = {
  isAuthenticated: true,
  email: "dev@agentfoundry.io",
  name: "Dev User",
};

export function useAuth(): AuthState & { isLoading: boolean } {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, email: null, name: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH) {
      setAuth(MOCK_USER);
      setIsLoading(false);
      return;
    }

    // TODO: Check real auth session via backend or Logto
    // For now, treat as authenticated if mock is off (bypass for SPA dev)
    setAuth(MOCK_USER);
    setIsLoading(false);
  }, []);

  return { ...auth, isLoading };
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-text-secondary mb-4">Please sign in to access Agent Foundry.</p>
          <a href={process.env.NEXT_PUBLIC_LOGTO_SIGN_IN_URL ?? "#"} className="text-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
