import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['@sparticuz/chromium'],
  transpilePackages: ['@proposal/shared'],
};

export default nextConfig;
