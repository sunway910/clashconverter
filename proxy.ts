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

  // Fallback: IP geolocation API (only for first-time visitors)
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '8.8.8.8';

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return data.countryCode;
      }
    }
  } catch {
    // Silently fail on error, fall back to default
  }

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

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

// Main proxy function for Next.js 16
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for non-page routes
  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/_vercel') ||
      pathname.includes('.')) {
    return intlMiddleware(request);
  }

  // Skip if already on a locale-specific path
  if (pathname.startsWith('/en') || pathname.startsWith('/zh')) {
    return intlMiddleware(request);
  }

  // Determine preferred locale for root path
  const preferredLocale = await getPreferredLocale(request);

  // Create response with locale cookie
  const response = NextResponse.redirect(
    new URL(`/${preferredLocale}${pathname}`, request.url),
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

// Matcher configuration for Next.js 16 proxy
export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
