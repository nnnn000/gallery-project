import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-storage.com", // อนุญาตให้ดึงรูปจาก Vercel Blob
      },
    ],
  },
};

export default nextConfig;
