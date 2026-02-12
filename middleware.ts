import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Chinese-speaking regions
const CHINESE_REGIONS = ['CN', 'HK', 'TW', 'MO', 'SG'];

// Detect user's country from request headers or IP
async function detectCountry(request: NextRequest): Promise<string | null> {
  // Try Cloudflare country header (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry) return cfCountry;

  // Try Vercel country header (if using Vercel)
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry;

  // Fallback: Use default for development
  return null;
}

// Get preferred locale based on country and cookies
async function getPreferredLocale(request: NextRequest): Promise<string> {
  // Check existing locale preference cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie === 'en' || localeCookie === 'zh') {
    return localeCookie;
  }

  // Detect country for new visitors
  const country = await detectCountry(request);

  // Return 'zh' for Chinese regions, 'en' otherwise
  return country && CHINESE_REGIONS.includes(country) ? 'zh' : 'en';
}

// Create next-intl middleware with default locale prefix always shown
const intlMiddleware = createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always' // Always show locale prefix to avoid conflicts
});

// Main middleware function for Edge Runtime
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-page routes
  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/_vercel') ||
      pathname.includes('.')) {
    return intlMiddleware(request);
  }

  // For root path, detect preferred locale and redirect
  if (pathname === '/') {
    const preferredLocale = await getPreferredLocale(request);

    const response = NextResponse.redirect(
      new URL(`/${preferredLocale}/`, request.url),
      { status: 307 }
    );

    // Set locale preference cookie (1 year expiry)
    response.cookies.set('NEXT_LOCALE', preferredLocale, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
      path: '/'
    });

    return response;
  }

  // For all other paths, use intlMiddleware
  return intlMiddleware(request);
}

// Matcher configuration for Edge Middleware
export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
