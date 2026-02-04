import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * API Route to fetch subscription content server-side
 * This bypasses CORS restrictions by fetching from the server
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http/https protocols
    if (validatedUrl.protocol !== 'http:' && validatedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTP/HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Set timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Fetch subscription content from the server (bypasses CORS)
      const response = await fetch(validatedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ClashConverter/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: `HTTP ${response.status}: ${response.statusText}` },
          { status: 502 }
        );
      }

      const content = await response.text();

      // Check if content is empty
      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Empty response from subscription server' },
          { status: 502 }
        );
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

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - subscription server did not respond within 15 seconds' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch subscription: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
