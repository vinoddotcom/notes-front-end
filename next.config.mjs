// @ts-check
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js where the root of the project is
  outputFileTracingRoot: __dirname,
  
  // Configure webpack to handle Tailwind CSS properly
  webpack: (config) => {
    return config;
  },
  
  // Disable Turbopack since it might have compatibility issues with Tailwind
  experimental: {}
};

export default nextConfig;
