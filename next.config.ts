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

  async redirects() {
    return [
      {
        source: "/manager/:path*",
        destination: "/care/manager/:path*",
        permanent: false,
      },
      {
        source: "/support/:path*",
        destination: "/care/support/:path*",
        permanent: false,
      },
      {
        source: "/platform/:path*",
        destination: "/core/:path*",
        permanent: false,
      },
      {
        source: "/api/platform/:path*",
        destination: "/api/core/:path*",
        permanent: false,
      },
      {
        source: "/api/admin/:path*",
        destination: "/api/care/admin/:path*",
        permanent: false,
      },
      {
        source: "/api/service-users/:path*",
        destination: "/api/care/service-users/:path*",
        permanent: false,
      },
      {
        source: "/api/family-users/:path*",
        destination: "/api/care/family-users/:path*",
        permanent: false,
      },
      {
        source: "/admin/reports",
        destination: "/care/manager/reports",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
