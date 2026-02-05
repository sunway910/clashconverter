/**
 * Subscribe URL parser
 * Handles two types of subscription links:
 * 1. Direct YAML download (returns Clash YAML config)
 * 2. Base64 encoded proxy links (needs base64 decoding)
 */

import type { ProxyNode } from '../types';
import type { IFormatParser, FormatType } from '../core/interfaces';
import { fetchSubscriptionContent, detectContentType, parseSubscriptionContent } from '../subscription';

/**
 * Result of parsing subscription URL
 * Extends ParseResult with metadata about the subscription
 */
export interface SubscribeUrlParseResult {
  /** Successfully parsed proxy nodes */
  proxies: ProxyNode[];
  /** List of unsupported protocols found during parsing */
  unsupported: string[];
  /** Counts of filtered proxies by protocol type */
  filteredCounts: Record<string, number>;
  /** The detected content type (yaml or base64) */
  contentType: 'yaml' | 'base64' | 'unknown';
  /** The original subscription content */
  content: string;
  /** Suggested input format for the detected content */
  detectedInputFormat: 'txt' | 'clash-meta';
}

/**
 * Parser for subscription URLs
 */
export class SubscribeUrlParser implements IFormatParser {
  readonly format: FormatType = 'subscribe-url';

  /**
   * Parse subscription URL and fetch/parse the content
   * @param input - The subscription URL to parse
   * @returns ParseResult containing proxies and metadata
   */
  parse(input: string): import('../core/interfaces').ParseResult {
    // For subscribe-url, we need to handle this asynchronously
    // But the interface is synchronous, so we return empty result
    // The actual parsing happens in the converter component via the dialog
    return {
      proxies: [],
      unsupported: [],
      filteredCounts: {},
    };
  }

  /**
   * Asynchronously parse subscription URL
   * This is the main method that should be used for subscription URLs
   * @param url - The subscription URL to fetch and parse
   * @returns SubscribeUrlParseResult with proxies and metadata
   */
  async parseAsync(url: string): Promise<SubscribeUrlParseResult> {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return {
        proxies: [],
        unsupported: [],
        filteredCounts: {},
        contentType: 'unknown',
        content: '',
        detectedInputFormat: 'txt',
      };
    }

    try {
      // Fetch content from subscription URL
      const content = await fetchSubscriptionContent(trimmedUrl);

      // Detect content type
      const contentType = detectContentType(content);

      if (contentType === 'unknown') {
        return {
          proxies: [],
          unsupported: [],
          filteredCounts: {},
          contentType: 'unknown',
          content,
          detectedInputFormat: 'txt',
        };
      }

      // Parse content
      const result = parseSubscriptionContent(content, contentType);

      if (!result.success || !result.proxies) {
        return {
          proxies: [],
          unsupported: [],
          filteredCounts: {},
          contentType,
          content,
          detectedInputFormat: contentType === 'yaml' ? 'clash-meta' : 'txt',
        };
      }

      // Determine the detected input format
      const detectedInputFormat: 'txt' | 'clash-meta' = contentType === 'yaml' ? 'clash-meta' : 'txt';

      return {
        proxies: result.proxies,
        unsupported: [],
        filteredCounts: {},
        contentType,
        content,
        detectedInputFormat,
      };
    } catch (error) {
      return {
        proxies: [],
        unsupported: [],
        filteredCounts: {},
        contentType: 'unknown',
        content: '',
        detectedInputFormat: 'txt',
      };
    }
  }

  /**
   * Check if a string is a valid subscription URL
   * @param input - The input string to check
   * @returns true if the input is a valid HTTP/HTTPS URL
   */
  static isValidSubscriptionUrl(input: string): boolean {
    const trimmedInput = input.trim();
    if (!trimmedInput) return false;

    try {
      const urlObj = new URL(trimmedInput);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
