import { LogtoNextConfig } from "@logto/next";

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT ?? "https://pk5k15.logto.app/",
  appId: process.env.LOGTO_APP_ID ?? "wfys39gnwrpez0g29f1v0",
  appSecret: process.env.LOGTO_APP_SECRET ?? "wOrPwIrodl8rAPt8xEiEUIbDzYGju15M",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  cookieSecret: process.env.LOGTO_COOKIE_SECRET ?? "8GG2WSxFO1MncSiP1X8k8HO4x9leJfOp",
  cookieSecure: process.env.NODE_ENV === "production",
  scopes: ["openid", "profile", "email"],
  resources: [process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"],
};
