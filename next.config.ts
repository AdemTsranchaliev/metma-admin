import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/metma-admin").replace(/\/$/, "")
  : "";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        env: {
          NEXT_PUBLIC_BASE_PATH: basePath,
        },
      }
    : {
        experimental: {
          proxyClientMaxBodySize: "200mb",
        },
      }),
};

export default nextConfig;
