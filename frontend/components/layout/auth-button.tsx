"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-6 py-2 text-sm text-text-secondary">Loading...</div>
    );
  }

  if (session?.user) {
    return (
      <div className="px-6 py-2">
        <div className="text-sm text-text-secondary truncate mb-1">
          {session.user.email ?? session.user.name ?? "User"}
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs text-text-muted hover:text-primary transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-2">
      <button
        onClick={() => signIn("logto")}
        className="text-sm text-primary hover:underline"
      >
        Sign in
      </button>
    </div>
  );
}
