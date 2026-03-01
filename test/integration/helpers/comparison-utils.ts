/**
 * Comparison utilities for different output formats
 * These functions return parsed values for comparison rather than using expect directly
 */

import { parse as parseYAML } from 'yaml';

/**
 * Normalize whitespace and remove empty lines
 */
export function normalizeLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Parse YAML content for comparison
 * Returns parsed object for test assertions
 */
export function parseYAMLForComparison(actual: string, expected: string): { actual: unknown; expected: unknown } {
  const actualObj = parseYAML(actual);
  const expectedObj = parseYAML(expected);
  return { actual: actualObj, expected: expectedObj };
}

/**
 * Parse JSON content for comparison
 * Returns parsed object for test assertions
 */
export function parseJSONForComparison(actual: string, expected: string): { actual: unknown; expected: unknown } {
  const actualObj = JSON.parse(actual);
  const expectedObj = JSON.parse(expected);
  return { actual: actualObj, expected: expectedObj };
}

/**
 * Parse INI content for comparison
 * Returns normalized lines for test assertions
 */
export function parseINIForComparison(actual: string, expected: string): { actual: string[]; expected: string[] } {
  const actualLines = normalizeLines(actual);
  const expectedLines = normalizeLines(expected);
  return { actual: actualLines, expected: expectedLines };
}
