import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
    user: DefaultSession["user"];
  }
}
