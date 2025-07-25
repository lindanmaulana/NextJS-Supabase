import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.promediateknologi.id',
        port: '',
        pathname: "/**"
      },
      {
        protocol: 'https',
        hostname: 'jogjavoice.com',
        port: '',
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
