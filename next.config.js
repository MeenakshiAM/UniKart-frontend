/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CART_SERVICE_URL: process.env.NEXT_PUBLIC_CART_SERVICE_URL || "http://localhost:3002",
  },
};

module.exports = nextConfig;
