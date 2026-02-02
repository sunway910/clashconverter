/**
 * Unified format converter
 * Main entry point for converting between different proxy formats
 */

import type { ProxyNode } from '../types';
import type { FormatType, ConversionResult, ParseResult } from './interfaces';
import { FormatFactory } from './factory';

/**
 * Unified format converter
 * Handles conversion between different proxy configuration formats
 */
export class FormatConverter {
  /**
   * Convert input from one format to another
   * @param input - The input string to convert
   * @param inputFormat - The format of the input
   * @param outputFormat - The desired output format
   * @returns ConversionResult containing output and metadata
   */
  convert(
    input: string,
    inputFormat: FormatType,
    outputFormat: FormatType
  ): ConversionResult {
    // Handle empty input
    if (!input.trim()) {
      return {
        output: '',
        filteredCounts: {},
        unsupported: [],
        isJson: outputFormat === 'sing-box' || outputFormat === 'loon',
      };
    }

    // Step 1: Parse input
    const parser = FormatFactory.createParser(inputFormat);
    const parseResult = parser.parse(input);

    // Step 2: Filter proxies based on output format's supported protocols
    const generator = FormatFactory.createGenerator(outputFormat);
    const supportedProtocols = generator.getSupportedProtocols();
    const { proxies: filteredProxies, filteredCounts } = this.filterByProtocolSupport(
      parseResult.proxies,
      supportedProtocols
    );

    // Step 3: Generate output
    const output = generator.generate(filteredProxies);

    return {
      output,
      filteredCounts,
      unsupported: parseResult.unsupported,
      isJson: outputFormat === 'sing-box' || outputFormat === 'loon',
    };
  }

  /**
   * Filter proxies by protocol support and count filtered items
   * @param proxies - All proxy nodes
   * @param supported - Set of supported protocol types
   * @returns Object containing filtered proxies and filter counts
   */
  private filterByProtocolSupport(
    proxies: ProxyNode[],
    supported: Set<string>
  ): { proxies: ProxyNode[]; filteredCounts: Record<string, number> } {
    const filteredProxies: ProxyNode[] = [];
    const filteredCounts: Record<string, number> = {};

    for (const proxy of proxies) {
      if (supported.has(proxy.type)) {
        filteredProxies.push(proxy);
      } else {
        filteredCounts[proxy.type] = (filteredCounts[proxy.type] || 0) + 1;
      }
    }

    return { proxies: filteredProxies, filteredCounts };
  }

  /**
   * Parse input without generating output
   * @param input - The input string to parse
   * @param inputFormat - The format of the input
   * @returns ParseResult containing proxies and metadata
   */
  parse(input: string, inputFormat: FormatType): ParseResult {
    if (!input.trim()) {
      return {
        proxies: [],
        unsupported: [],
        filteredCounts: {},
      };
    }

    const parser = FormatFactory.createParser(inputFormat);
    return parser.parse(input);
  }

  /**
   * Get all registered formats
   * @returns Array of registered format types
   */
  getRegisteredFormats(): FormatType[] {
    return FormatFactory.getRegisteredFormats();
  }

  /**
   * Check if a parser is registered for a format
   * @param format - The format type
   * @returns True if a parser is registered
   */
  hasParser(format: FormatType): boolean {
    return FormatFactory.hasParser(format);
  }

  /**
   * Check if a generator is registered for a format
   * @param format - The format type
   * @returns True if a generator is registered
   */
  hasGenerator(format: FormatType): boolean {
    return FormatFactory.hasGenerator(format);
  }

  /**
   * Get supported protocols for a specific format
   * @param format - The format type
   * @returns Set of supported protocol types
   */
  getSupportedProtocols(format: FormatType): Set<string> {
    const generator = FormatFactory.createGenerator(format);
    return generator.getSupportedProtocols();
  }
}

/**
 * Convenience function for format conversion
 * @param input - The input string to convert
 * @param inputFormat - The format of the input
 * @param outputFormat - The desired output format
 * @returns ConversionResult containing output and metadata
 */
export function convert(
  input: string,
  inputFormat: FormatType,
  outputFormat: FormatType
): ConversionResult {
  const converter = new FormatConverter();
  return converter.convert(input, inputFormat, outputFormat);
}

/**
 * Convenience function for parsing input
 * @param input - The input string to parse
 * @param inputFormat - The format of the input
 * @returns ParseResult containing proxies and metadata
 */
export function parseInput(input: string, inputFormat: FormatType): ParseResult {
  const converter = new FormatConverter();
  return converter.parse(input, inputFormat);
}
