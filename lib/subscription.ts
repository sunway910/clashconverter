/**
 * Subscription link handler
 * Supports two types of subscription links:
 * 1. Direct YAML download (returns Clash YAML config)
 * 2. Base64 encoded proxy links (needs base64 decoding)
 */

import { parseMultipleProxies } from './parsers';
import { parseYamlToProxies } from './clash/parser/yaml';
import { ProxyNode } from './types';

export type SubscriptionContentType = 'yaml' | 'base64' | 'unknown';

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

// js-hoist-regexp: Pattern to detect base64 content (most proxy links use base64)
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

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
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.content) {
      throw new Error('No content returned from subscription server');
    }

    return data.content;
  } catch (error) {
    throw new Error(`Failed to fetch subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Detect the content type of subscription data
 */
export function detectContentType(content: string): SubscriptionContentType {
  const trimmedContent = content.trim();

  // Check if it's YAML format (starts with proxy, proxies, or has YAML structure)
  if (
    trimmedContent.startsWith('proxies:') ||
    trimmedContent.startsWith('proxy-groups:') ||
    trimmedContent.startsWith('proxy-providers:') ||
    /^[\s-]*name:/.test(trimmedContent) ||
    /^[\s-]*type:\s*(ss|ssr|vmess|trojan|hysteria|vless|http|socks)/.test(trimmedContent)
  ) {
    return 'yaml';
  }

  // Check if it's base64 encoded
  // Try to decode and see if it looks like proxy links
  try {
    // Remove whitespace for base64 check
    const cleanContent = trimmedContent.replace(/\s/g, '');

    if (BASE64_PATTERN.test(cleanContent) && cleanContent.length > 20) {
      // Try to decode and check if result contains proxy links
      const decoded = atob(cleanContent);
      if (decoded.includes('://') && /(ss|ssr|vmess|vless|trojan|hysteria|http|socks):\/\//i.test(decoded)) {
        return 'base64';
      }
    }
  } catch {
    // Not valid base64
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
        // Try to decode base64 first
        let decodedContent = content;

        // Check if it's base64 encoded
        const cleanContent = content.trim().replace(/\s/g, '');
        if (BASE64_PATTERN.test(cleanContent)) {
          try {
            decodedContent = atob(cleanContent);
          } catch {
            // If base64 decode fails, use original content
            decodedContent = content;
          }
        }

        // Parse as proxy links
        const parseResult = parseMultipleProxies(decodedContent);
        proxies = parseResult.proxies;

        if (proxies.length === 0) {
          throw new Error('No valid proxy links found in content');
        }
        break;
      }

      default:
        throw new Error('Unknown content type');
    }

    if (proxies.length === 0) {
      throw new Error('No proxies found in subscription');
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
 * Convert proxies back to YAML format for display
 */
export function proxiesToYaml(proxies: ProxyNode[], outputFormat: 'clash-meta' | 'clash-premium' = 'clash-meta'): string {
  let yaml = 'proxies:\n';

  for (const proxy of proxies) {
    yaml += `  - name: ${proxy.name}\n`;
    yaml += `    type: ${proxy.type}\n`;
    yaml += `    server: ${proxy.server}\n`;
    yaml += `    port: ${proxy.port}\n`;

    // Add protocol-specific fields
    for (const [key, value] of Object.entries(proxy)) {
      if (key !== 'name' && key !== 'type' && key !== 'server' && key !== 'port') {
        yaml += `    ${key}: ${value}\n`;
      }
    }
  }

  return yaml;
}
