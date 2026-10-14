/**
 * Subscription link handler
 * Supports two types of subscription links:
 * 1. Direct YAML download (returns Clash YAML config)
 * 2. Base64 encoded proxy links (needs base64 decoding)
 */

import { parseMultipleProxies } from './parsers';
import { parseYamlToProxies } from './clash/parser/yaml';
import { parseSingBoxToProxies } from './singbox/parser';
import { stringify } from 'yaml';
import { ProxyNode } from './types';
import { ParseError, GenerateError, ErrorCode } from './errors';

export type SubscriptionContentType = 'yaml' | 'base64' | 'singbox' | 'unknown';

export interface SubscriptionResult {
  success: boolean;
  contentType: SubscriptionContentType;
  content?: string;
  proxies?: ProxyNode[];
  error?: string;
  suggestedOutputFormat?: 'clash-meta' | 'clash-premium';
}

// js-hoist-regexp: Hoist RegExp outside function for reuse
const SUBSCRIPTION_LINK_PATTERN = /^https?:\/\/.+/i;

/**
 * Normalize base64 content for decoding: convert URL-safe variants (-, _)
 * back to standard (+, /) and restore stripped padding — both are common in
 * subscription responses. Returns null when the content is not base64-shaped.
 */
function normalizeBase64(content: string): string | null {
  const clean = content.replace(/\s/g, '');
  if (!clean || clean.length < 20 || clean.length % 4 !== 0) return null;

  const standard = clean.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(standard)) return null;

  return standard;
}

/** Decode normalized base64, returning null on failure */
function decodeBase64(normalized: string): string | null {
  try {
    const decoded = atob(normalized);
    return decoded.includes('://') ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL looks like a subscription link
 * Subscription links typically are HTTP/HTTPS URLs
 */
export function isSubscriptionLink(url: string): boolean {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;

  // Check if it's an HTTP/HTTPS URL
  try {
    const urlObj = new URL(trimmedUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetch content from a subscription URL
 * Uses the API route to bypass CORS restrictions
 */
export async function fetchSubscriptionContent(url: string): Promise<string> {
  const trimmedUrl = url.trim();

  try {
    // Use the API route to fetch subscription content server-side
    // This bypasses CORS restrictions
    const apiUrl = `/api/subscription?url=${encodeURIComponent(trimmedUrl)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ParseError(
        ErrorCode.PARSE_FAILED,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.content) {
      throw new ParseError(
        ErrorCode.PARSE_FAILED,
        'No content returned from subscription server'
      );
    }

    return data.content;
  } catch (error) {
    // Don't double-wrap error messages that already start with "Failed to fetch"
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.startsWith('Failed to fetch subscription:') ||
        errorMessage.startsWith('HTTP ') ||
        errorMessage.startsWith('Request timeout') ||
        errorMessage.startsWith('Server error')) {
      throw error;
    }
    throw new ParseError(
      ErrorCode.PARSE_FAILED,
      `Failed to fetch subscription: ${errorMessage}`
    );
  }
}

/**
 * Detect the content type of subscription data
 */
export function detectContentType(content: string): SubscriptionContentType {
  const trimmedContent = content.trim();

  // Check if it's YAML format
  // Look for common Clash YAML patterns including:
  // - Full config patterns (mixed-port, allow-lan, dns, rules, etc.)
  // - Proxy patterns (proxies, proxy-groups, etc.)
  // - Node patterns (name:, type: with known protocols)

  // Full Clash config patterns
  if (
    /^mixed-port:\s*\d+/m.test(trimmedContent) ||
    /^allow-lan:\s*(true|false)/m.test(trimmedContent) ||
    /^mode:\s*(rule|global|direct)/m.test(trimmedContent) ||
    /^dns:\s*$/m.test(trimmedContent) ||
    /^proxies:\s*$/m.test(trimmedContent) ||
    /^proxy-groups:\s*$/m.test(trimmedContent) ||
    /^rules:\s*$/m.test(trimmedContent)
  ) {
    return 'yaml';
  }

  // Proxy node patterns
  if (
    /^[\s-]*name:/.test(trimmedContent) ||
    /^[\s-]*type:\s*(ss|ssr|vmess|trojan|hysteria|hysteria2|vless|http|socks|socks5|wireguard|anytls)/m.test(trimmedContent)
  ) {
    return 'yaml';
  }

  // Inline proxy format (common in subscription responses)
  // Matches: {name: X, type: ss, ...} with or without quotes around keys
  if (/\{\s*name:\s*[^:,}]+,\s*type:\s*(ss|ssr|vmess|trojan|hysteria|hysteria2|vless)/i.test(trimmedContent)) {
    return 'yaml';
  }

  // Sing-Box JSON config: starts with { or [ and parses to an object with outbounds
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedContent);
      if (parsed && Array.isArray(parsed.outbounds)) {
        return 'singbox';
      }
    } catch {
      // Not JSON — fall through
    }
  }

  // Check if it's base64 encoded (URL-safe variants included)
  // Decode and see if the result looks like proxy links
  const normalized = normalizeBase64(trimmedContent);
  const decoded = normalized ? decodeBase64(normalized) : null;
  if (decoded && /(ss|ssr|vmess|vless|trojan|hysteria|http|socks):\/\//i.test(decoded)) {
    return 'base64';
  }

  // Check if it contains multiple proxy links directly
  const linkCount = (trimmedContent.match(/(ss|ssr|vmess|vless|trojan|hysteria|http|socks):\/\//gi) || []).length;
  if (linkCount >= 1) {
    return 'base64'; // Treat as proxy links
  }

  return 'unknown';
}

/**
 * Check if proxies contain VLESS or Hysteria protocols
 * Used to determine suggested output format
 */
function hasAdvancedProtocols(proxies: ProxyNode[]): boolean {
  return proxies.some(proxy =>
    proxy.type === 'vless' ||
    proxy.type === 'hysteria' ||
    proxy.type === 'hysteria2'
  );
}

/**
 * Parse subscription content and extract proxies
 */
export function parseSubscriptionContent(content: string, contentType: SubscriptionContentType): SubscriptionResult {
  try {
    let proxies: ProxyNode[] = [];

    switch (contentType) {
      case 'yaml': {
        // Parse as Clash YAML
        proxies = parseYamlToProxies(content);
        break;
      }

      case 'base64': {
        // Decode base64 (URL-safe variants included); fall back to raw content
        const normalized = normalizeBase64(content);
        const decodedContent = (normalized && decodeBase64(normalized)) || content;

        // Parse as proxy links
        const parseResult = parseMultipleProxies(decodedContent);
        proxies = parseResult.proxies;

        if (proxies.length === 0) {
          throw new ParseError(
            ErrorCode.PARSE_FAILED,
            'No valid proxy links found in content'
          );
        }
        break;
      }

      case 'singbox': {
        // Parse as Sing-Box JSON config
        const result = parseSingBoxToProxies(content);
        proxies = result.proxies;

        if (proxies.length === 0) {
          throw new ParseError(
            ErrorCode.PARSE_FAILED,
            'No valid outbounds found in Sing-Box config'
          );
        }
        break;
      }

      default:
        throw new ParseError(
          ErrorCode.PARSE_INVALID_FORMAT,
          'Unknown content type'
        );
    }

    if (proxies.length === 0) {
      throw new ParseError(
        ErrorCode.PARSE_FAILED,
        'No proxies found in subscription'
      );
    }

    // Determine suggested output format based on protocols
    const suggestedOutputFormat = hasAdvancedProtocols(proxies) ? 'clash-meta' : 'clash-premium';

    return {
      success: true,
      contentType,
      content,
      proxies,
      suggestedOutputFormat,
    };
  } catch (error) {
    return {
      success: false,
      contentType,
      error: error instanceof Error ? error.message : 'Failed to parse subscription',
    };
  }
}

/**
 * Complete subscription link processing
 * Fetches, detects, and parses a subscription URL
 */
export async function processSubscriptionLink(url: string): Promise<SubscriptionResult> {
  try {
    // Fetch content
    const content = await fetchSubscriptionContent(url);

    // Detect content type
    const contentType = detectContentType(content);

    if (contentType === 'unknown') {
      return {
        success: false,
        contentType: 'unknown',
        error: 'Unable to detect subscription content type. The URL may not be a valid subscription link.',
      };
    }

    // Parse content
    return parseSubscriptionContent(content, contentType);
  } catch (error) {
    return {
      success: false,
      contentType: 'unknown',
      error: error instanceof Error ? error.message : 'Failed to process subscription link',
    };
  }
}

/**
 * Convert proxies back to YAML format for display.
 * Uses the yaml library so passwords/names with special characters
 * (colons, quotes, #, CJK) are quoted correctly — the previous
 * hand-built string output could produce invalid YAML.
 */
export function proxiesToYaml(proxies: ProxyNode[]): string {
  return stringify({ proxies });
}
