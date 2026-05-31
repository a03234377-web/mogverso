import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/rankvote",
        destination: "/votar-rank",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
