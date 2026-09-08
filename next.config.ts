import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'http://127.0.0.1:8000/:path*', // Proxy to Python FastAPI
      },
      {
        source: '/faiss-api/:path*',
        destination: 'http://127.0.0.1:5055/:path*', // Proxy to FAISS daemon
      },
    ];
  },
};

export default nextConfig;
