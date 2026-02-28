/**
 * Feature flags for format conversion
 * Controls which conversion formats are enabled via environment variables
 */

import type { FormatType } from './core/interfaces';

/**
 * Parse boolean from environment variable
 * Returns true if unset (default enabled), false if 'false', true otherwise
 */
function parseBooleanEnv(value: string | undefined): boolean {
  if (value === undefined) return true; // Default: enabled
  return value.toLowerCase() !== 'false';
}

/**
 * Check if a specific format is enabled
 * @param format - The format type to check
 * @returns true if the format is enabled, false otherwise
 */
export function isFormatEnabled(format: FormatType): boolean {
  // txt and subscribe-url are always enabled
  if (format === 'txt' || format === 'subscribe-url') {
    return true;
  }

  // Check environment variables for configurable formats
  switch (format) {
    case 'clash-meta':
      return parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER);
    case 'clash-premium':
      return parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER);
    case 'sing-box':
      return parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER);
    case 'loon':
      return parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER);
    default:
      throw new Error(`Unknown format type: ${format}`);
  }
}

/**
 * Get list of all enabled formats
 * @returns Array of enabled format types
 */
export function getEnabledFormats(): FormatType[] {
  const allFormats: FormatType[] = [
    'txt',
    'clash-meta',
    'clash-premium',
    'sing-box',
    'loon',
    'subscribe-url',
  ];

  return allFormats.filter(isFormatEnabled);
}

/**
 * Constant object with enablement status for all formats
 * This is computed at module load time
 */
export const ENABLED_FORMATS: Record<FormatType, boolean> = (() => {
  const formats: FormatType[] = [
    'txt',
    'clash-meta',
    'clash-premium',
    'sing-box',
    'loon',
    'subscribe-url',
  ];

  return formats.reduce((acc, format) => {
    acc[format] = isFormatEnabled(format);
    return acc;
  }, {} as Record<FormatType, boolean>);
})();
