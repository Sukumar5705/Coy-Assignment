/** @type {import('next').NextConfig} */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true, outputFileTracingRoot: projectRoot,
  // Profile photos come from a placeholder service; allow it for next/image in the frontend.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};


export default nextConfig;
