/**
 * Feature Flags Module
 *
 * Provides environment variable-based control over which conversion formats
 * are displayed in the UI. Set NEXT_PUBLIC_ENABLE_*_TRANSFER=false to hide.
 *
 * @example
 * // Hide Sing-Box format from UI
 * process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER = 'false'
 *
 * @module lib/features
 */

import type { FormatType } from './core/interfaces';

/**
 * All supported format types in the application
 * @internal
 */
const ALL_FORMAT_TYPES: readonly FormatType[] = [
  'txt',
  'clash-meta',
  'clash-premium',
  'sing-box',
  'loon',
  'subscribe-url',
] as const;

/**
 * Formats that can be configured via environment variables
 * @internal
 */
const CONFIGURABLE_FORMATS: readonly FormatType[] = [
  'clash-meta',
  'clash-premium',
  'sing-box',
  'loon',
] as const;

/**
 * Environment variable names for configurable formats
 * @internal
 */
const FORMAT_ENV_VARS: Readonly<Partial<Record<FormatType, string>>> = {
  'clash-meta': 'NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER',
  'clash-premium': 'NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER',
  'sing-box': 'NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER',
  'loon': 'NEXT_PUBLIC_ENABLE_LOON_TRANSFER',
} as const;

/**
 * Formats that are always enabled (cannot be disabled via env vars)
 * @internal
 */
const ALWAYS_ENABLED_FORMATS: ReadonlySet<FormatType> = new Set(['txt', 'subscribe-url']);

/**
 * Parse boolean from environment variable
 * Returns true if unset (default enabled), false if 'false', true otherwise
 *
 * @param value - The environment variable value
 * @returns true if enabled, false if explicitly set to 'false'
 *
 * @internal
 */
function parseBooleanEnv(value: string | undefined): boolean {
  if (value === undefined) return true;
  return value.toLowerCase() !== 'false';
}

/**
 * Check if a specific format is enabled
 *
 * @param format - The format type to check
 * @returns true if the format is enabled, false otherwise
 * @throws {Error} If format type is unknown
 *
 * @example
 * isFormatEnabled('sing-box') // true (default)
 * isFormatEnabled('txt') // true (always enabled)
 */
export function isFormatEnabled(format: FormatType): boolean {
  // Always-enabled formats
  if (ALWAYS_ENABLED_FORMATS.has(format)) {
    return true;
  }

  // Check environment variable for configurable formats
  const envVar = FORMAT_ENV_VARS[format];
  if (!envVar) {
    throw new Error(`Unknown format type: ${format}`);
  }

  return parseBooleanEnv(process.env[envVar]);
}

/**
 * Get list of all enabled formats
 *
 * Returns all format types that are currently enabled based on
 * environment variables. Always includes 'txt' and 'subscribe-url'.
 *
 * @returns Array of enabled format types
 *
 * @example
 * getEnabledFormats()
 * // ['txt', 'clash-meta', 'clash-premium', 'sing-box', 'loon', 'subscribe-url']
 */
export function getEnabledFormats(): FormatType[] {
  return ALL_FORMAT_TYPES.filter(isFormatEnabled);
}

/**
 * Constant object with enablement status for all formats
 *
 * This is computed at module load time and reflects the environment
 * variable state at application startup.
 *
 * @example
 * ENABLED_FORMATS['sing-box'] // true or false based on env var
 */
export const ENABLED_FORMATS: Record<FormatType, boolean> = (() => {
  return ALL_FORMAT_TYPES.reduce(
    (acc, format) => {
      acc[format] = isFormatEnabled(format);
      return acc;
    },
    {} as Record<FormatType, boolean>
  );
})();

/**
 * Export constants for use in other modules
 */
export { ALL_FORMAT_TYPES, CONFIGURABLE_FORMATS, FORMAT_ENV_VARS };
