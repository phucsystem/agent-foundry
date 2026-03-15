"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

export function useAuth() {
  const { data: session, status } = useSession();

  if (MOCK_AUTH) {
    return {
      isAuthenticated: true,
      isLoading: false,
      email: "dev@agent-foundry.local",
      name: "Dev User",
      accessToken: null,
    };
  }

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn("logto");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
