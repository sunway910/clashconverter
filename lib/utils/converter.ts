import { FormatType } from '@/lib/parser';
import type { LanguageType } from '@/components/preview/preview-editor';
import { getEnabledFormats } from '@/lib/features';
import { ALL_FORMAT_TYPES } from '@/lib/features';

/**
 * Generate timestamp for download filename
 * @returns Formatted timestamp string (YYYY_MM_DD_HH_MM_SS)
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

/**
 * Get CodeMirror language for a given format
 */
export function getLanguageForFormat(format: FormatType): LanguageType {
  switch (format) {
    case 'sing-box':
      return 'json';
    case 'txt':
    case 'subscribe-url':
      return 'plaintext';
    default:
      return 'yaml';
  }
}

/**
 * Get input placeholder text for a given format
 */
export function getInputPlaceholder(format: FormatType, t: (key: string) => string): string {
  switch (format) {
    case 'subscribe-url':
      return t('inputPlaceholder.subscribe-url');
    case 'txt':
      return t('inputPlaceholder.txt');
    case 'sing-box':
      return t('inputPlaceholder.sing-box');
    default:
      return t('inputPlaceholder.clash');
  }
}

/**
 * Get output placeholder text for a given format
 */
export function getOutputPlaceholder(format: FormatType, t: (key: string) => string): string {
  switch (format) {
    case 'txt':
      return t('outputPlaceholder.txt');
    case 'sing-box':
      return t('outputPlaceholder.sing-box');
    case 'loon':
      return '# Your Loon configuration will appear here';
    default:
      return t('outputPlaceholder.clash');
  }
}

/**
 * Get download filename and MIME type for a given format
 */
export function getDownloadInfo(format: FormatType): { filename: string; mimeType: string } {
  const timestamp = generateTimestamp();

  switch (format) {
    case 'sing-box':
      return {
        filename: `sing-box-${timestamp}.json`,
        mimeType: 'application/json',
      };
    case 'txt':
      return {
        filename: `proxies-${timestamp}.txt`,
        mimeType: 'text/plain',
      };
    case 'loon':
      return {
        filename: `loon-${timestamp}.conf`,
        mimeType: 'text/plain',
      };
    case 'clash-meta':
    case 'clash-premium':
    default:
      return {
        filename: `clashconvert-${timestamp}.yaml`,
        mimeType: 'text/yaml',
      };
  }
}

/**
 * Get format options array for selectors
 * @param t - Translation function
 * @returns Array of format options filtered by enabled status
 */
export function getInputFormatOptions(t: (key: string) => string): Array<{ value: FormatType; label: string }> {
  const enabledFormats = getEnabledFormats();

  return ALL_FORMAT_TYPES
    .filter(format => enabledFormats.includes(format))
    .map(format => ({
      value: format,
      label: t(`formatTypes.${format}`),
    }));
}

/**
 * Get format options array for output selectors (excludes subscribe-url)
 * @param t - Translation function
 * @returns Array of format options filtered by enabled status, excluding subscribe-url
 */
export function getOutputFormatOptions(t: (key: string) => string): Array<{ value: FormatType; label: string }> {
  const enabledFormats = getEnabledFormats();

  return ALL_FORMAT_TYPES
    .filter(format => format !== 'subscribe-url' && enabledFormats.includes(format))
    .map(format => ({
      value: format,
      label: t(`formatTypes.${format}`),
    }));
}
