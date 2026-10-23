import type { NextConfig } from "next";
import { MAX_UPLOAD_MB } from "./src/lib/config";

const nextConfig: NextConfig = {
  experimental: {
    // Default is 1MB. Uploads are capped at MAX_UPLOAD_MB per request (Vercel
    // rejects anything over 4.5MB anyway), plus 1MB headroom for the other
    // form fields and multipart overhead.
    serverActions: {
      bodySizeLimit: `${Math.ceil(MAX_UPLOAD_MB) + 1}mb`,
    },
  },
};

export default nextConfig;
