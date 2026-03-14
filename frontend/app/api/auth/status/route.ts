import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_AUTH = process.env.MOCK_AUTH === "true";

export async function GET() {
  // Mock auth: return fake session
  if (MOCK_AUTH) {
    const cookieStore = await cookies();
    const mockCookie = cookieStore.get("mock_session");
    if (mockCookie) {
      const session = JSON.parse(mockCookie.value);
      return NextResponse.json({
        isAuthenticated: true,
        email: session.email,
        name: session.name,
      });
    }
    return NextResponse.json({
      isAuthenticated: true,
      email: "dev@agentfoundry.io",
      name: "Dev User",
    });
  }

  // Real auth: check Logto session
  try {
    const { getLogtoContext } = await import("@logto/next/server-actions");
    const { logtoConfig } = await import("@/lib/logto");
    const context = await getLogtoContext(logtoConfig);
    return NextResponse.json({
      isAuthenticated: context.isAuthenticated,
      email: context.claims?.email ?? null,
      name: context.claims?.name ?? null,
    });
  } catch {
    return NextResponse.json({
      isAuthenticated: false,
      email: null,
      name: null,
    });
  }
}
