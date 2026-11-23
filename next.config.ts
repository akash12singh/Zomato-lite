import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // There is a stray package-lock.json higher up in C:\Users\Asus, which makes
  // Next guess the wrong project root. Point it at this folder explicitly.
  outputFileTracingRoot: here,
};

export default nextConfig;
