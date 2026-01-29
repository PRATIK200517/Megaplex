import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // This creates a 'bridge' to your Render backend
        source: '/api/main/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/:path*`, 
      },
    ];
  },
};

export default nextConfig;
