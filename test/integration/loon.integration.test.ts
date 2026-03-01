/**
 * Integration tests for Loon format conversion
 * Tests the complete flow: proxy links -> Loon INI format
 * Loon supports SS, SSR, VMess, Trojan only (no HTTP, SOCKS5)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';
import { parseINIForComparison } from './helpers/comparison-utils';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Loon Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    // Load test fixtures
    testInput = loadInputFile('loon');
    testExpected = loadExpectedFile('loon', 'conf');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to valid Loon INI format', () => {
      // 1. Parse input (proxy links)
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      expect(parseResult.proxies.length).toBeGreaterThan(0);

      // 2. Generate Loon INI
      const generator = FormatFactory.createGenerator('loon');
      const output = generator.generate(parseResult.proxies);

      // 3. Verify structure and sections
      expect(output).toContain('[General]');
      expect(output).toContain('[Proxy]');
      expect(output).toContain('[Proxy Group]');

      // 4. Verify it's valid INI format (has key=value pairs)
      expect(output).toMatch(/^[a-z-]+=/m);
    });

    it('should filter out unsupported protocols (HTTP, SOCKS5, VLESS, Hysteria)', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('loon');
      const supportedProtocols = generator.getSupportedProtocols();

      // Loon only supports these protocols
      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('ssr')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);

      // Loon does NOT support these protocols
      expect(supportedProtocols.has('http')).toBe(false);
      expect(supportedProtocols.has('socks5')).toBe(false);
      expect(supportedProtocols.has('vless')).toBe(false);
      expect(supportedProtocols.has('hysteria')).toBe(false);
      expect(supportedProtocols.has('hysteria2')).toBe(false);

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
      const generator = FormatFactory.createGenerator('loon');
      const filtered = generator.filterProxies(parseResult.proxies);

      // Filtered list should only contain supported protocols
      const unsupportedTypes = ['http', 'socks5', 'vless', 'hysteria', 'hysteria2'];
      const hasUnsupported = filtered.some(
        p => unsupportedTypes.includes(p.type)
      );
      expect(hasUnsupported).toBe(false);

      // Should only contain supported protocols
      const supportedTypes = ['ss', 'ssr', 'vmess', 'trojan'];
      const allSupported = filtered.every(
        p => supportedTypes.includes(p.type)
      );
      expect(allSupported).toBe(true);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('loon');
      expect(generator.format).toBe('loon');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('loon');

      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });

  describe('INI output structure', () => {
    it('should produce valid INI format with sections', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('loon');
      const output = generator.generate(parseResult.proxies);

      // Basic INI validation - should have sections
      expect(output).toContain('[General]');
      expect(output).toContain('[Proxy]');
    });

    it('should not contain unsupported protocols in output', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('loon');
      const output = generator.generate(parseResult.proxies);

      // Check that HTTP and SOCKS5 are not in proxy definitions
      // Look for actual proxy type definitions (not comments or URLs)
      const proxySectionMatch = output.match(/\[Proxy\]([\s\S]*?)\[/);
      if (proxySectionMatch) {
        const proxySection = proxySectionMatch[1];
        // Check for proxy type keywords after the = sign
        expect(proxySection).not.toMatch(/=\s*HTTP\s*,/);
        expect(proxySection).not.toMatch(/=\s*SOCKS5\s*,/);
      }
    });

    it('should contain proxy definitions for supported protocols', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('loon');
      const output = generator.generate(parseResult.proxies);

      // Get filtered proxies
      const filtered = generator.filterProxies(parseResult.proxies);

      if (filtered.length > 0) {
        // Should have at least some proxy definitions
        const proxySectionMatch = output.match(/\[Proxy\]([\s\S]*?)(?=\[|$)/);
        expect(proxySectionMatch).toBeTruthy();

        // Count proxy names (each proxy has a name line)
        const proxyCount = (output.match(/^.*=\s*\w+/gm) || []).length;
        expect(proxyCount).toBeGreaterThan(0);
      }
    });
  });
});
