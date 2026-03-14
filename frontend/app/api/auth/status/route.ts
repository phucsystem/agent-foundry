import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("logto_session");

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false, email: null });
    }

    const session = JSON.parse(sessionCookie.value);

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return NextResponse.json({ isAuthenticated: false, email: null });
    }

    // Decode ID token claims (JWT payload is base64url-encoded, no verification needed here)
    let email: string | null = null;
    if (session.idToken) {
      const payload = session.idToken.split(".")[1];
      const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
      email = claims.email ?? claims.sub ?? null;
    }

    return NextResponse.json({
      isAuthenticated: true,
      email,
      accessToken: session.accessToken,
    });
  } catch {
    return NextResponse.json({ isAuthenticated: false, email: null });
  }
}
