import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Initialize PWA plugin with custom worker for push notifications
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "worker",
  customWorkerDest: "public",
  customWorkerPrefix: "worker",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
