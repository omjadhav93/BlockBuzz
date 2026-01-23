import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // You can leave port and pathname empty to allow all Unsplash images
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // Added this for the avatars in the code I gave you!
      },
    ],
  },
};

export default nextConfig;
