import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rupeefjvlzpcniupqkcx.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
