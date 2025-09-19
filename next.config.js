/** @type {import('next').NextConfig} */
const path = require('path'); // eslint-disable-line

const nextConfig = {
  // Tell Next.js where the root of the project is
  outputFileTracingRoot: path.join(__dirname), // eslint-disable-line
  
  // Additional configuration
  reactStrictMode: true
};

module.exports = nextConfig;
