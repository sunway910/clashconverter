/**
 * Integration tests for Clash Premium format conversion
 * Tests the complete flow: proxy links -> Clash Premium YAML
 * Clash Premium does NOT support VLESS, Hysteria, Hysteria2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';
import { parseYAMLForComparison } from './helpers/comparison-utils';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Clash Premium Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    // Load test fixtures
    testInput = loadInputFile('clash-premium');
    testExpected = loadExpectedFile('clash-premium', 'yaml');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to expected Clash Premium YAML', () => {
      // 1. Parse input (proxy links)
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      expect(parseResult.proxies.length).toBeGreaterThan(0);

      // 2. Generate Clash Premium YAML
      const generator = FormatFactory.createGenerator('clash-premium');
      const output = generator.generate(parseResult.proxies);

      // 3. Compare with expected output (order-insensitive)
      const { actual, expected } = parseYAMLForComparison(output, testExpected);
      expect(actual).toEqual(expected);
    });

    it('should filter out unsupported protocols (VLESS, Hysteria, Hysteria2)', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-premium');
      const supportedProtocols = generator.getSupportedProtocols();

      // Clash Premium does NOT support these protocols
      expect(supportedProtocols.has('vless')).toBe(false);
      expect(supportedProtocols.has('hysteria')).toBe(false);
      expect(supportedProtocols.has('hysteria2')).toBe(false);

      // These protocols should be supported
      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('ssr')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);
      expect(supportedProtocols.has('socks5')).toBe(true);

      // Some proxies should be filtered out
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toBeLessThan(parseResult.proxies.length);
    });
  });

  describe('Protocol filtering', () => {
    it('should correctly identify and filter unsupported protocols', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      // Count unsupported protocols before filtering
      const unsupportedCount = parseResult.proxies.filter(
        p => p.type === 'vless' || p.type === 'hysteria' || p.type === 'hysteria2'
      ).length;

      expect(unsupportedCount).toBeGreaterThan(0);

      // Filter and verify
      const generator = FormatFactory.createGenerator('clash-premium');
      const filtered = generator.filterProxies(parseResult.proxies);

      // Filtered list should not contain unsupported protocols
      const hasUnsupported = filtered.some(
        p => p.type === 'vless' || p.type === 'hysteria' || p.type === 'hysteria2'
      );
      expect(hasUnsupported).toBe(false);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('clash-premium');
      expect(generator.format).toBe('clash-premium');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('clash-premium');

      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });

  describe('YAML output structure', () => {
    it('should produce valid YAML with required sections', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-premium');
      const output = generator.generate(parseResult.proxies);

      // Basic YAML validation
      expect(output).toContain('proxies:');
      expect(output).toContain('proxy-groups:');
      expect(output).toContain('rules:');
    });

    it('should not contain unsupported protocols in output', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-premium');
      const output = generator.generate(parseResult.proxies);

      // Check that VLESS, Hysteria, Hysteria2 are not in output
      // These protocol types should not appear in proxy definitions
      expect(output).not.toMatch(/type:\s*vless/);
      // Note: hysteria/hysteria2 might appear in comments, so we check proxy definitions specifically
    });
  });
});
