import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tamagui/core"],
  images: { unoptimized: true },
};

export default nextConfig;
