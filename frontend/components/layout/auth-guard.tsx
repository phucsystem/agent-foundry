"use client";

import { useSession, signIn } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    email: session?.user?.email ?? null,
    name: session?.user?.name ?? null,
    accessToken: session?.accessToken ?? null,
  };
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
          <button onClick={() => signIn("logto")} className="text-primary hover:underline">
            Sign In with Logto
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
