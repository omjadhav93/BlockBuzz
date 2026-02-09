import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export", // Required for Capacitor
    trailingSlash: true, // Better for Capacitor routing
    images: {
        unoptimized: true, // Required for static export
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
    // Disable API routes for static export
    // Your API should run on a separate server
};

export default nextConfig;
