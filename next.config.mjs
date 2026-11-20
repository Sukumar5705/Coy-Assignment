/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Profile photos come from a placeholder service; allow it for next/image in the frontend.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};

export default nextConfig;
