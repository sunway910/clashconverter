/**
 * Helper functions for loading test fixtures
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Get the path to the test directory
 */
export function getTestDir(): string {
  return join(process.cwd(), 'test');
}

/**
 * Load input.txt from a format-specific test directory
 */
export function loadInputFile(formatDir: string): string {
  const filePath = join(getTestDir(), formatDir, 'input.txt');
  return readFileSync(filePath, 'utf-8');
}

/**
 * Load expected output file from a format-specific test directory
 */
export function loadExpectedFile(formatDir: string, extension: string): string {
  const filePath = join(getTestDir(), formatDir, `expect.${extension}`);
  return readFileSync(filePath, 'utf-8');
}

/**
 * Get all supported test format directories
 */
export function getTestFormats(): string[] {
  return ['clash-meta', 'clash-premium', 'sing-box', 'loon'];
}
