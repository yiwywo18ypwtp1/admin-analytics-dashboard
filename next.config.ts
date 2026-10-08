import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/lib/config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // "/" has no content of its own. A config redirect answers before any rendering,
  // so it's cheaper than a page that calls redirect(). Not permanent (307), so
  // browsers don't cache it if a landing page is added later.
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  images: {
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
  turbopack: {
    // There's a stray package-lock.json in the home folder, which makes Next guess
    // the wrong project root. Pointing it at this folder explicitly fixes that.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
