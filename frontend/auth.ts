import NextAuth from "next-auth";
import Logto from "next-auth/providers/logto";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ?? "dev-secret-change-in-production"
);

async function mintBackendToken(userId: string, role = "viewer"): Promise<string> {
  return new SignJWT({ sub: userId, role, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    error: "/auth/error",
  },
  providers: [
    Logto({
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.userId = profile?.sub ?? account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token.userId as string;
      session.accessToken = await mintBackendToken(userId);
      session.userId = userId;
      return session;
    },
  },
});
