/**
 * Integration tests for Surge format conversion
 * Tests the complete flow: proxy links -> Surge 5 conf
 * Surge generator supports SS, VMess, SSR (external), Trojan, HTTP
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Surge Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    // Load test fixtures
    testInput = loadInputFile('surge');
    testExpected = loadExpectedFile('surge', 'conf');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to the expected Surge 5 config (byte-exact)', () => {
      // 1. Parse input (proxy links)
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      expect(parseResult.proxies.length).toBeGreaterThan(0);

      // 2. Generate Surge 5 config
      const generator = FormatFactory.createGenerator('surge');
      const output = generator.generate(parseResult.proxies);

      // 3. Output is deterministic (no timestamps) - compare byte-exact
      expect(output).toBe(testExpected);
    });
  });

  describe('Config structure', () => {
    it('should produce all required sections', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surge');
      const output = generator.generate(parseResult.proxies);

      expect(output).toContain('[General]');
      expect(output).toContain('[Proxy]');
      expect(output).toContain('[Proxy Group]');
      expect(output).toContain('[Rule]');
      expect(output).toContain('[URL Rewrite]');
      expect(output).toContain('DIRECT = direct');
      expect(output).toContain('🟢 Proxy = select, "♻️ 自动选择"');
      expect(output).toContain('FINAL,"🐟 漏网之鱼",dns-failed');
    });

    it('should not contain dangling group references', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surge');
      const output = generator.generate(parseResult.proxies);

      // Region groups use explicit node lists, not external group references
      expect(output).not.toContain('include-other-group');
      expect(output).not.toContain('✈️ 机场');
    });
  });

  describe('Protocol filtering', () => {
    it('should support SS, VMess, SSR, Trojan, HTTP and filter the rest', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surge');
      const supportedProtocols = generator.getSupportedProtocols();

      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('ssr')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);

      expect(supportedProtocols.has('socks5')).toBe(false);
      expect(supportedProtocols.has('vless')).toBe(false);
      expect(supportedProtocols.has('hysteria')).toBe(false);
      expect(supportedProtocols.has('hysteria2')).toBe(false);

      // 6 of the 12 input links survive filtering
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toBe(6);
      expect(filtered.every(p => ['ss', 'vmess', 'ssr', 'trojan', 'http'].includes(p.type))).toBe(true);
    });

    it('should keep unsupported protocols out of the [Proxy] section', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surge');
      const output = generator.generate(parseResult.proxies);

      const proxySectionMatch = output.match(/\[Proxy\]\n([\s\S]*?)\n\n\[Proxy Group\]/);
      expect(proxySectionMatch).toBeTruthy();
      const proxySection = proxySectionMatch![1];
      expect(proxySection).not.toMatch(/=\s*(vless|hysteria|hysteria2|socks5),/);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('surge');
      expect(generator.format).toBe('surge');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('surge');

      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });
});
