/**
 * Integration tests for Surfboard format conversion
 * Flow: proxy links -> Surfboard conf
 * Supported: SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Surfboard Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    testInput = loadInputFile('surfboard');
    testExpected = loadExpectedFile('surfboard', 'conf');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to the expected Surfboard config (byte-exact)', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);
      expect(parseResult.proxies.length).toBeGreaterThan(0);

      const generator = FormatFactory.createGenerator('surfboard');
      const output = generator.generate(parseResult.proxies);

      // Output is deterministic (no timestamps) - compare byte-exact
      expect(output).toBe(testExpected);
    });
  });

  describe('Config structure', () => {
    it('should produce all required sections', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surfboard');
      const output = generator.generate(parseResult.proxies);

      expect(output).toContain('[General]');
      expect(output).toContain('[Proxy]');
      expect(output).toContain('[Proxy Group]');
      expect(output).toContain('[Rule]');
      expect(output).toContain('🟢 Proxy = select, "♻️ 自动选择"');
      expect(output).toContain('FINAL,"🐟 漏网之鱼"');
    });

    it('should use Surfboard-compatible syntax only', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surfboard');
      const output = generator.generate(parseResult.proxies);

      // No Surge-only syntax
      expect(output).not.toContain('= smart,');
      expect(output).not.toContain('policy-regex-filter');
      expect(output).not.toContain('extended-matching');
      expect(output).not.toContain('%APPEND%');
      expect(output).not.toContain('include-other-group');
    });
  });

  describe('Protocol filtering', () => {
    it('should support SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2 and filter the rest', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('surfboard');
      const supportedProtocols = generator.getSupportedProtocols();

      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);
      expect(supportedProtocols.has('socks5')).toBe(true);
      expect(supportedProtocols.has('hysteria2')).toBe(true);
      expect(supportedProtocols.has('ssr')).toBe(false);
      expect(supportedProtocols.has('vless')).toBe(false);

      // 8 of the 12 input links survive filtering
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toBe(8);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('surfboard');
      expect(generator.format).toBe('surfboard');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('surfboard');
      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });
});
