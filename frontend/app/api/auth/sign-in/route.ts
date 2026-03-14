import { redirect } from "next/navigation";
import { logtoConfig } from "@/lib/logto";

const LOGTO_INTERNAL = process.env.LOGTO_ENDPOINT ?? "http://localhost:3001";
const LOGTO_PUBLIC = process.env.LOGTO_PUBLIC_ENDPOINT ?? "http://localhost:3001";

export async function GET() {
  // Fetch OIDC discovery from internal Docker URL
  const discoveryUrl = `${LOGTO_INTERNAL}/oidc/.well-known/openid-configuration`;
  const discovery = await fetch(discoveryUrl).then((response) => response.json());

  // Get the authorization endpoint (uses Logto's own ENDPOINT config = localhost:3001)
  let authorizationEndpoint: string = discovery.authorization_endpoint;

  // Safety: if Logto returns internal hostname, rewrite to public
  if (authorizationEndpoint.includes("logto:")) {
    authorizationEndpoint = authorizationEndpoint.replace(LOGTO_INTERNAL, LOGTO_PUBLIC);
  }

  // Build auth URL with PKCE
  const { randomBytes, createHash } = await import("crypto");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const state = randomBytes(32).toString("base64url");

  const params = new URLSearchParams({
    client_id: logtoConfig.appId,
    redirect_uri: `${logtoConfig.baseUrl}/callback`,
    response_type: "code",
    scope: (logtoConfig.scopes ?? ["openid", "profile", "email"]).join(" "),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    prompt: "consent",
  });

  if (logtoConfig.resources?.[0]) {
    params.set("resource", logtoConfig.resources[0]);
  }

  // Store PKCE verifier + state in cookie for callback
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("logto_pkce", JSON.stringify({ codeVerifier, state }), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  redirect(`${authorizationEndpoint}?${params.toString()}`);
}
