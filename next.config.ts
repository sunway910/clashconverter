import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Disable image optimization (Cloudflare Workers uses static approach)
  images: {
    unoptimized: true,
  },
  // Explicitly load environment variables from .env files
  env: {
    NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER,
    NEXT_PUBLIC_ENABLE_LOON_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER,
    NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER,
    NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER,
  },
};

export default withNextIntl(nextConfig);
