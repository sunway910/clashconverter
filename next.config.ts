import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually to work around Turbopack environment variable loading issue
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');

    console.log('[loadEnvFile] Loading .env file from:', envPath);

    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        if (key.startsWith('NEXT_PUBLIC_')) {
          process.env[key] = value;
          console.log(`[loadEnvFile] Loaded: ${key}=${value}`);
        }
      }
    });

    console.log('[loadEnvFile] Final env values:', {
      NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER,
      NEXT_PUBLIC_ENABLE_LOON_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER,
    });
  } catch (error) {
    console.log('[loadEnvFile] Error loading .env:', error);
  }
}

// Load .env file at config evaluation time
loadEnvFile();

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Disable image optimization (Cloudflare Workers uses static approach)
  images: {
    unoptimized: true,
  },
  // Explicitly load environment variables
  env: {
    NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER ?? 'true',
    NEXT_PUBLIC_ENABLE_LOON_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER ?? 'true',
    NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER ?? 'true',
    NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER ?? 'true',
  },
};

export default withNextIntl(nextConfig);
