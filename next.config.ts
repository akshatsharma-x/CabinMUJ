import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Room for "Restore from backup" uploads (a backup is ~0.6 MB today; Vercel caps requests at 4.5 MB).
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
