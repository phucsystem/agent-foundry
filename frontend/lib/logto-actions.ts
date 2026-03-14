"use server";

import { logtoConfig } from "@/lib/logto";
import {
  getLogtoContext,
  signIn,
  signOut,
} from "@logto/next/server-actions";

export async function getUser() {
  const context = await getLogtoContext(logtoConfig);

  return {
    isAuthenticated: context.isAuthenticated,
    userId: context.claims?.sub ?? null,
    email: context.claims?.email ?? null,
    name: context.claims?.name ?? null,
  };
}

export async function logtoSignIn() {
  await signIn(logtoConfig, {
    redirectUri: `${logtoConfig.baseUrl}/callback`,
  });
}

export async function logtoSignOut() {
  await signOut(logtoConfig, logtoConfig.baseUrl);
}
