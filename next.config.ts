import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Initialize PWA plugin with custom service worker for push notifications
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "public",
  customWorkerPrefix: "sw-push",
});

const nextConfig: NextConfig = {
  // Allow Turbopack to coexist with webpack-based PWA plugin
  turbopack: {},
};

export default withPWA(nextConfig);
