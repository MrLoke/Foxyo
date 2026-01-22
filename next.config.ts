import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "agdgsknwsczlqdvyomjp.supabase.co",
        port: "",
        // pathname: "/**",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      { protocol: "https", hostname: "i.ytimg.com", port: "", pathname: "/**" },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "opengraph.link-preview.js.domains",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "**", port: "", pathname: "/**" },
      { protocol: "http", hostname: "**", port: "", pathname: "/**" },
    ],
    unoptimized: false, // The source image will be optimized
    qualities: [75, 100],
  },
  compiler: {
    removeConsole: false,
  },
  turbopack: {
    rules: {
      "**/*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
} as NextConfig;

export default nextConfig;
