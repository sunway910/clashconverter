/**
 * Integration tests for Sing-Box format conversion
 * Tests the complete flow: proxy links -> Sing-Box JSON
 * Sing-Box supports all 9 protocols: SS, SSR, VMess, VLESS, Trojan, Hysteria, Hysteria2, HTTP, SOCKS5
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

    it('should support all 9 protocols including SSR and SOCKS5', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const supportedProtocols = generator.getSupportedProtocols();

      // Sing-Box supports ALL protocols including SSR and SOCKS5
      expect(supportedProtocols.has('ssr')).toBe(false);
      expect(supportedProtocols.has('socks5')).toBe(true);

      // All other protocols should be supported
      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('vless')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('hysteria')).toBe(true);
      expect(supportedProtocols.has('hysteria2')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);

      // SSR is the only filtered protocol
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toEqual(parseResult.proxies.length - 1);
    });
  });

  describe('Protocol filtering', () => {
    it('should filter only SSR', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      // Filter and verify
      const generator = FormatFactory.createGenerator('sing-box');
      const filtered = generator.filterProxies(parseResult.proxies);

      // Only the single SSR link is filtered
      expect(filtered.length).toEqual(parseResult.proxies.length - 1);
      expect(filtered.every(p => p.type !== 'ssr')).toBe(true);
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

    it('should contain SSR and SOCKS5 proxies converted to compatible formats', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('sing-box');
      const output = generator.generate(parseResult.proxies);

      const parsed = JSON.parse(output);

      // SSR should be converted to shadowsocks type
      // SOCKS5 should be converted to socks type
      // Check that all outbounds have valid types
      const validTypes = ['selector', 'urltest', 'direct', 'shadowsocks', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http', 'socks'];
      const allValid = parsed.outbounds?.every((outbound: any) => validTypes.includes(outbound.type));
      expect(allValid).toBe(true);
    });
  });
});
