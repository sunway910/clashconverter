/**
 * Integration tests for Sing-Box format conversion
 * Tests the complete flow: proxy links -> Sing-Box JSON
 * Sing-Box does NOT support SSR and SOCKS5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';
import { parseJSONForComparison } from './helpers/comparison-utils';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Sing-Box Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    // Load test fixtures
    testInput = loadInputFile('sing-box');
    testExpected = loadExpectedFile('sing-box', 'json');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to valid Sing-Box JSON', () => {
      // 1. Parse input (proxy links)
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      expect(parseResult.proxies.length).toBeGreaterThan(0);

      // 2. Generate Sing-Box JSON
      const generator = FormatFactory.createGenerator('sing-box');
      const output = generator.generate(parseResult.proxies);

      // 3. Verify it's valid JSON
      const parsed = JSON.parse(output);

      // 4. Verify structure
      expect(parsed).toHaveProperty('outbounds');
      expect(Array.isArray(parsed.outbounds)).toBe(true);

      // 5. Verify at least some proxies were converted
      expect(parsed.outbounds.length).toBeGreaterThan(0);
    });

    it('should filter out unsupported protocols (SSR, SOCKS5)', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const supportedProtocols = generator.getSupportedProtocols();

      // Sing-Box does NOT support SSR and SOCKS5
      expect(supportedProtocols.has('ssr')).toBe(false);
      expect(supportedProtocols.has('socks5')).toBe(false);

      // These protocols should be supported
      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('vless')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('hysteria')).toBe(true);
      expect(supportedProtocols.has('hysteria2')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);

      // Some proxies should be filtered out
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toBeLessThanOrEqual(parseResult.proxies.length);
    });
  });

  describe('Protocol filtering', () => {
    it('should correctly identify and filter unsupported protocols', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      // Filter and verify
      const generator = FormatFactory.createGenerator('sing-box');
      const filtered = generator.filterProxies(parseResult.proxies);

      // Filtered list should not contain unsupported protocols
      const hasUnsupported = filtered.some(
        p => p.type === 'ssr' || p.type === 'socks5'
      );
      expect(hasUnsupported).toBe(false);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('sing-box');
      expect(generator.format).toBe('sing-box');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('sing-box');

      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });

  describe('JSON output structure', () => {
    it('should produce valid JSON', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const output = generator.generate(parseResult.proxies);

      // Should be valid JSON (no throw)
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should contain outbounds array', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const output = generator.generate(parseResult.proxies);

      const parsed = JSON.parse(output);
      expect(parsed.outbounds).toBeDefined();
      expect(Array.isArray(parsed.outbounds)).toBe(true);
    });

    it('should not contain SSR or SOCKS5 in output', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const output = generator.generate(parseResult.proxies);

      const parsed = JSON.parse(output);

      // Check that no SSR or SOCKS5 proxies are in outbounds
      const hasUnsupported = parsed.outbounds?.some(
        (outbound: any) => outbound.type === 'ssr' || outbound.type === 'socks5'
      );

      expect(hasUnsupported).toBe(false);
    });
  });
});
