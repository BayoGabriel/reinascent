import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // Review form accepts up to 4 photos (2MB each) via Server Action.
    serverActions: { bodySizeLimit: "10mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Admin-managed content supplies image URLs; any https host is allowed so
  // CMS imagery isn't blocked. Tighten to known storage hosts before launch.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
