import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tamagui/core"],
  images: { unoptimized: true },
  turbopack: {
    root: resolve(__dirname, ".."),
  },
};

export default nextConfig;
