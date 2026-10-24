import type { NextConfig } from "next";

// The browser only ever talks to this Next.js app. Requests to /api/* are proxied to the
// Express server, so the auth cookie is first-party (no cross-site cookie / CORS problems).
const API_URL = (process.env.API_URL ?? "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // hides the floating Next.js dev badge (development only, never shown in production)
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
