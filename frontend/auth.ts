import NextAuth from "next-auth";
import Logto from "next-auth/providers/logto";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
