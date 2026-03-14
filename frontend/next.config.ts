import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tamagui/core"],
  images: { unoptimized: true },
  env: {
    AUTH_LOGTO_ID: process.env.LOGTO_APP_ID,
    AUTH_LOGTO_SECRET: process.env.LOGTO_APP_SECRET,
    AUTH_LOGTO_ISSUER: process.env.LOGTO_ENDPOINT
      ? `${process.env.LOGTO_ENDPOINT.replace(/\/$/, "")}/oidc`
      : undefined,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },
};

export default nextConfig;
