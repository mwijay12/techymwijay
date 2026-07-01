/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Static export for Electron builds, server mode for API routes
  // Set BUILD_FOR_ELECTRON=true to enable static export
  output: process.env.BUILD_FOR_ELECTRON === 'true' ? 'export' : undefined,
  trailingSlash: true,
  // Skip TypeScript errors during build for Electron export
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for Electron export
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
