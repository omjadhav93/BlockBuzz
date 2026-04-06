import type { NextConfig } from "next";

// ✅ Web / Server config (used for development and Vercel deployment)
// For Capacitor mobile builds, use: npm run cap:build
// which temporarily swaps to next.config.capacitor.ts
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
        ],
    },
};

export default nextConfig;
