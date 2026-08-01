import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.75"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ijlvsfypeesmlognujbs.supabase.co",
        pathname: "/storage/v1/object/public/staff-photos/**",
      },
    ],
  },
};

export default nextConfig;