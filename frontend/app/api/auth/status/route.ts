import { NextResponse } from "next/server";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/logto";

export async function GET() {
  try {
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
