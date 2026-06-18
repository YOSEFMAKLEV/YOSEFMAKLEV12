import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // output: "standalone",
  turbopack: {
    resolveAlias: {
      "node:path": "path",
      "node:process": "process",
      "node:url": "url",
      "node:fs": "fs",
      "node:os": "os",
      "node:crypto": "crypto",
    },
  },
};

export default withNextIntl(nextConfig);
