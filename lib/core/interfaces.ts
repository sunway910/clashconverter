/**
 * Core interfaces for the converter system
 * These interfaces define the contracts for parsers and generators
 */

import type { ProxyNode } from '../types';

/**
 * Supported format types for input and output
 */
export type FormatType = 'txt' | 'clash-meta' | 'clash-premium' | 'sing-box' | 'loon' | 'subscribe-url';

/**
 * Result of parsing input
 */
export interface ParseResult {
  /** Successfully parsed proxy nodes */
  proxies: ProxyNode[];
  /** List of unsupported protocols found during parsing */
  unsupported: string[];
  /** Counts of filtered proxies by protocol type */
  filteredCounts: Record<string, number>;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  /** The converted output string */
  output: string;
  /** Counts of filtered proxies by protocol type */
  filteredCounts: Record<string, number>;
  /** List of unsupported protocols found during parsing */
  unsupported: string[];
  /** Whether the output is JSON format (for syntax highlighting) */
  isJson: boolean;
}

/**
 * Interface for format parsers
 * Implementations should parse a specific input format into ProxyNode array
 */
export interface IFormatParser {
  /** The format type this parser handles */
  readonly format: FormatType;
  /**
   * Parse input string into proxy nodes
   * @param input - The input string to parse
   * @returns ParseResult containing proxies, unsupported protocols, and filtered counts
   */
  parse(input: string): ParseResult;
}

/**
 * Interface for format generators
 * Implementations should generate a specific output format from ProxyNode array
 */
export interface IFormatGenerator {
  /** The format type this generator produces */
  readonly format: FormatType;
  /**
   * Generate output string from proxy nodes
   * @param proxies - Array of proxy nodes to convert
   * @returns The generated output string
   */
  generate(proxies: ProxyNode[]): string;
  /**
   * Get the set of protocols supported by this generator
   * @returns Set of supported protocol types (e.g., 'ss', 'vmess', etc.)
   */
  getSupportedProtocols(): Set<string>;
}
