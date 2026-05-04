import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /** Runs at the routing layer; belt-and-braces naast `middleware.ts` (301 daar, hier Next-default permanent = 308). */
  async redirects() {
    return [
      {
        source: "/nl/sectoren/voeding",
        destination: "/nl/sectoren/voedingsindustrie",
        permanent: true,
      },
      {
        source: "/nl/sectoren/voeding/",
        destination: "/nl/sectoren/voedingsindustrie",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/fr/a-propos", destination: "/fr/over" },
        { source: "/en/about", destination: "/en/over" },
        { source: "/fr/durabilite", destination: "/fr/duurzaamheid" },
        { source: "/en/sustainability", destination: "/en/duurzaamheid" },
        { source: "/fr/secteurs/:path*", destination: "/fr/sectoren/:path*" },
        { source: "/en/sectors/:path*", destination: "/en/sectoren/:path*" },
        { source: "/fr/produits/:path*", destination: "/fr/producten/:path*" },
        { source: "/en/products/:path*", destination: "/en/producten/:path*" },
      ],
    };
  },
};

export default nextConfig;
