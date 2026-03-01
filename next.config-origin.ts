import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Disable image optimization (Cloudflare Workers uses static approach)
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);