/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Improve development performance
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3002'],
    },
  },
};

export default nextConfig;
