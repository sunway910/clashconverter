import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Base64 decode with proper UTF-8 handling
export function base64Decode(str: string): string {
  try {
    // Add padding if needed
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    const decoded = atob(padded);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

// Parse URL query parameters
// Handles both formats: "key=value&key2=value2" and "url?key=value&key2=value2"
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  // If the string contains ?, split it and take the part after ?
  // Otherwise, use the string as-is
  const queryString = url.includes('?') ? url.split('?')[1] : url;
  if (!queryString) return params;

  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  });
  return params;
}

// Base64 encode with proper UTF-8 handling
export function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

// Safe JSON parse
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

// js-hoist-regexp: Hoist RegExp outside function for reuse
const NON_ASCII_REGEX = /[^\u0000-\u007F]/;

/**
 * Convert non-ASCII characters in a hostname to Punycode (IDNA ASCII)
 * e.g. "中文.com" -> "xn--fiq228c.com"
 * ASCII values (IPs, IPv6, already-encoded domains) pass through unchanged.
 * Also recovers percent-encoded hosts: WHATWG URL percent-encodes non-ASCII
 * hostnames of non-special schemes (trojan://, vless://...), e.g.
 * "%E4%B8%AD%E6%96%87.com" -> "xn--fiq228c.com".
 * Returns the original string when conversion fails.
 */
export function toPunycode(host: string): string {
  if (!host) return host;

  // Real hostnames never contain '%', so any '%' comes from percent-encoding
  let candidate = host;
  if (!NON_ASCII_REGEX.test(candidate) && candidate.includes('%')) {
    try {
      candidate = decodeURIComponent(candidate);
    } catch {
      return host;
    }
  }

  if (!NON_ASCII_REGEX.test(candidate)) return host;
  try {
    // WHATWG URL only applies IDNA (UTS-46) for special schemes, so force http://.
    return new URL(`http://${candidate}`).hostname;
  } catch {
    return host;
  }
}

// Hostname-bearing fields shared across proxy node types (partial view)
type HostnameFields = {
  server?: unknown;
  sni?: unknown;
  servername?: unknown;
  'ws-opts'?: { headers?: Record<string, unknown> };
};

/**
 * Convert non-ASCII hostnames in a proxy node to Punycode (in place).
 * Covers the connection host (server) and TLS hostname fields
 * (sni, servername, ws-opts.headers.Host).
 */
export function normalizeProxyNodeHostnames<T>(node: T): T {
  if (!node || typeof node !== 'object') return node;
  const fields = node as HostnameFields;
  if (typeof fields.server === 'string') fields.server = toPunycode(fields.server);
  if (typeof fields.sni === 'string') fields.sni = toPunycode(fields.sni);
  if (typeof fields.servername === 'string') fields.servername = toPunycode(fields.servername);
  const wsHost = fields['ws-opts']?.headers?.Host;
  if (typeof wsHost === 'string') fields['ws-opts']!.headers!.Host = toPunycode(wsHost);
  return node;
}
