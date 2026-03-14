import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: Remove mock auth when Logto integration is verified
const MOCK_AUTH = process.env.MOCK_AUTH === "true";

const PUBLIC_PATHS = [
  "/callback",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Mock auth: skip authentication check, set fake session cookie
  if (MOCK_AUTH) {
    const response = NextResponse.next();
    if (!request.cookies.has("mock_session")) {
      response.cookies.set("mock_session", JSON.stringify({
        userId: "mock-user-001",
        email: "dev@agentfoundry.io",
        name: "Dev User",
        role: "admin",
      }), { path: "/", maxAge: 86400 });
    }
    return response;
  }

  const hasSession = request.cookies.has("logto:client");

  if (!hasSession) {
    return NextResponse.redirect(new URL("/api/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
