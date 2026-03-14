import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const LOGTO_INTERNAL = process.env.LOGTO_ENDPOINT ?? "http://localhost:3001";
const LOGTO_PUBLIC = process.env.LOGTO_PUBLIC_ENDPOINT ?? "http://localhost:3001";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("logto_session");

  // Clear session cookie
  cookieStore.delete("logto_session");
  cookieStore.delete("logto_pkce");

  // Redirect to Logto end session endpoint (public URL for browser)
  if (sessionCookie) {
    const session = JSON.parse(sessionCookie.value);
    const params = new URLSearchParams({
      post_logout_redirect_uri: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    });
    if (session.idToken) {
      params.set("id_token_hint", session.idToken);
    }
    redirect(`${LOGTO_PUBLIC}/oidc/session/end?${params.toString()}`);
  }

  redirect("/agents");
}
