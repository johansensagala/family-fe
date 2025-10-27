import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Matikan StrictMode

  typescript: {
    ignoreBuildErrors: true, // ⬅️ Abaikan error TypeScript saat build
  },

  eslint: {
    ignoreDuringBuilds: true, // ⬅️ Abaikan error ESLint juga
  },

};

export default nextConfig;
