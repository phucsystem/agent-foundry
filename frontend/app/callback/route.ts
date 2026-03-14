import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { logtoConfig } from "@/lib/logto";

const LOGTO_INTERNAL = process.env.LOGTO_ENDPOINT ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    redirect("/agents?error=no_code");
  }

  const cookieStore = await cookies();
  const pkceCookie = cookieStore.get("logto_pkce");

  if (!pkceCookie) {
    redirect("/agents?error=no_pkce");
  }

  const { codeVerifier, state: savedState } = JSON.parse(pkceCookie.value);

  if (state !== savedState) {
    redirect("/agents?error=state_mismatch");
  }

  const tokenResponse = await fetch(`${LOGTO_INTERNAL}/oidc/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: logtoConfig.appId,
      client_secret: logtoConfig.appSecret ?? "",
      code,
      redirect_uri: `${logtoConfig.baseUrl}/callback`,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    console.error("Token exchange failed:", errorBody);
    redirect("/agents?error=token_exchange");
  }

  const tokens = await tokenResponse.json();

  cookieStore.set("logto_session", JSON.stringify({
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  }), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  cookieStore.delete("logto_pkce");

  redirect("/agents");
}
