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

// Safe JSON parse
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}
