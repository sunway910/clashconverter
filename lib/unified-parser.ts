import { ProxyNode } from './types';
import { parseMultipleProxies } from './parsers';
import { parseYamlToProxies } from './yaml-parser';
import { parseSingBoxToProxies } from './sing-box-parser';

/**
 * Format type for input/output
 */
export type FormatType = 'txt' | 'clash-meta' | 'clash-premium' | 'sing-box';

/**
 * Parse input based on the specified format
 * @param input - The input string to parse
 * @param format - The format type (txt, clash-meta, clash-premium, sing-box)
 * @returns Object containing proxies array, unsupported protocols, and filtered counts
 */
export function parseInput(input: string, format: FormatType): {
  proxies: ProxyNode[];
  unsupported: string[];
  filteredCounts: Record<string, number>;
} {
  switch (format) {
    case 'txt':
      const result = parseMultipleProxies(input);
      return { ...result, filteredCounts: {} };
    case 'clash-meta':
    case 'clash-premium':
      // Both clash-meta and clash-premium use YAML format
      const proxies = parseYamlToProxies(input);
      return { proxies, unsupported: [], filteredCounts: {} };
    case 'sing-box':
      return parseSingBoxToProxies(input);
    default:
      return { proxies: [], unsupported: [], filteredCounts: {} };
  }
}
