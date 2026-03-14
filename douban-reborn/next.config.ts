import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img1.doubanio.com" },
      { protocol: "https", hostname: "img2.doubanio.com" },
      { protocol: "https", hostname: "img3.doubanio.com" },
      { protocol: "https", hostname: "img9.doubanio.com" },
    ],
  },
};

export default nextConfig;
