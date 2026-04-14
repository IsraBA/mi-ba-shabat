import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Initialize PWA plugin
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Allow Turbopack to coexist with webpack-based PWA plugin
  turbopack: {},
};

export default withPWA(nextConfig);
