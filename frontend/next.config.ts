import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",   // enables Docker multi-stage build
};

export default nextConfig;
