/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3002'],
    },
  },
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
}

module.exports = nextConfig 