/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_TIMESTAMP: Date.now().toString(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://128.199.19.68:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
