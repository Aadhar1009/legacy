/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@dukaanos/shared'],
};

module.exports = nextConfig;
