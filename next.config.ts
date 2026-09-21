import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages supplies its sub-path at build time; Vercel uses the root.
  basePath: process.env.PAGES_BASE_PATH || '',
};
export default nextConfig;
