import { NextRequest, NextResponse } from 'next/server';
import { isBlockedSubscriptionUrl } from '@/lib/url-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Follow at most this many redirects (each hop re-enters the SSRF guard) */
const MAX_REDIRECTS = 5;
/** Hard cap on subscription body size */
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10MB
/** Total time budget for the fetch including body read */
const TIMEOUT_MS = 15000;

class BodyTooLargeError extends Error {
  constructor() {
    super('Response body exceeds the 10MB limit');
    this.name = 'BodyTooLargeError';
  }
}

class GuardBlockedError extends Error {
  constructor() {
    super('Private, loopback and link-local addresses are not allowed');
    this.name = 'GuardBlockedError';
  }
}

class FetchUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchUpstreamError';
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Fetch with redirects followed manually so every hop re-enters the SSRF guard */
async function fetchWithGuardedRedirects(initialUrl: URL, signal: AbortSignal): Promise<Response> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    // SSRF guard applies to every hop, not just the initial URL
    if (isBlockedSubscriptionUrl(currentUrl)) {
      throw new GuardBlockedError();
    }

    const response = await fetch(currentUrl.toString(), {
      redirect: 'manual',
      signal,
      headers: {
        'User-Agent': 'ClashConverter/1.0',
      },
    });

    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    // 3xx: resolve the next hop
    const location = response.headers.get('location');
    if (!location) {
      // Redirect without a Location header - nothing to follow
      return response;
    }

    let nextUrl: URL;
    try {
      nextUrl = new URL(location, currentUrl);
    } catch {
      throw new FetchUpstreamError('Subscription server returned an invalid redirect location');
    }

    if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') {
      throw new FetchUpstreamError('Subscription redirect target must be HTTP/HTTPS');
    }

    currentUrl = nextUrl;
  }

  throw new FetchUpstreamError(`Too many redirects (more than ${MAX_REDIRECTS})`);
}

/** Read the response body with a hard size cap (streaming, UTF-8 safe) */
async function readBodyWithCap(response: Response): Promise<string> {
  // Reject early when the server declares an oversized body
  const declaredLength = Number(response.headers.get('content-length') || '');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    throw new BodyTooLargeError();
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return '';
  }

  const decoder = new TextDecoder();
  let received = 0;
  let content = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    received += value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    // stream: true handles multi-byte UTF-8 chars split across chunks
    content += decoder.decode(value, { stream: true });
  }

  return content + decoder.decode();
}

/**
 * API Route to fetch subscription content server-side
 * This bypasses CORS restrictions by fetching from the server
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return errorResponse('Missing URL parameter', 400);
  }

  // Validate URL format
  let validatedUrl: URL;
  try {
    validatedUrl = new URL(url);
  } catch {
    return errorResponse('Invalid URL format', 400);
  }

  // Only allow http/https protocols
  if (validatedUrl.protocol !== 'http:' && validatedUrl.protocol !== 'https:') {
    return errorResponse('Only HTTP/HTTPS URLs are allowed', 400);
  }

  // Timeout covers the whole operation including the body read
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetchWithGuardedRedirects(validatedUrl, controller.signal);

    if (!response.ok) {
      return errorResponse(`HTTP ${response.status}: ${response.statusText}`, 502);
    }

    // Body read stays inside the same timeout budget
    const content = await readBodyWithCap(response);
    clearTimeout(timeoutId);

    // Check if content is empty
    if (!content || content.trim().length === 0) {
      return errorResponse('Empty response from subscription server', 502);
    }

    // Return the content
    return NextResponse.json(
      { content },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (fetchError) {
    clearTimeout(timeoutId);

    if (fetchError instanceof GuardBlockedError) {
      return errorResponse(fetchError.message, 403);
    }
    if (fetchError instanceof BodyTooLargeError) {
      return errorResponse(fetchError.message, 413);
    }
    if (fetchError instanceof FetchUpstreamError) {
      return errorResponse(fetchError.message, 502);
    }
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      return errorResponse(
        'Request timeout - subscription server did not respond within 15 seconds',
        504
      );
    }

    return errorResponse(
      `Failed to fetch subscription: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      502
    );
  }
}
