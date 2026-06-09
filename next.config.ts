import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Tambahkan bagian ini untuk mempercepat deteksi di Docker
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,         // Cek perubahan file setiap 1 detik
        aggregateTimeout: 300, // Jeda sedikit sebelum rebuild (agar CPU tidak kaget)
      };
    }
    return config;
  },
};

export default nextConfig;