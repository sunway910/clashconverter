/**
 * Integration tests for Clash Meta format conversion
 * Tests the complete flow: proxy links -> Clash Meta YAML
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';
import { loadInputFile, loadExpectedFile } from './helpers/fixture-loader';
import { parseYAMLForComparison } from './helpers/comparison-utils';
import { parse as parseYAML } from 'yaml';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] Clash Meta Format Conversion', () => {
  let testInput: string;
  let testExpected: string;

  beforeEach(() => {
    // Load test fixtures
    testInput = loadInputFile('clash-meta');
    testExpected = loadExpectedFile('clash-meta', 'yaml');
  });

  describe('Full conversion flow', () => {
    it('should convert proxy links to expected Clash Meta YAML', () => {
      // 1. Parse input (proxy links)
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      expect(parseResult.proxies.length).toBeGreaterThan(0);
      expect(parseResult.unsupported.length).toBe(0);

      // 2. Generate Clash Meta YAML
      const generator = FormatFactory.createGenerator('clash-meta');
      const output = generator.generate(parseResult.proxies);

      // 3. Compare with expected output (order-insensitive)
      const { actual, expected } = parseYAMLForComparison(output, testExpected);
      expect(actual).toEqual(expected);
    });

    it('should support all 9 proxy protocols', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-meta');
      const supportedProtocols = generator.getSupportedProtocols();

      // Clash Meta should support all protocols
      expect(supportedProtocols.has('ss')).toBe(true);
      expect(supportedProtocols.has('ssr')).toBe(true);
      expect(supportedProtocols.has('vmess')).toBe(true);
      expect(supportedProtocols.has('vless')).toBe(true);
      expect(supportedProtocols.has('trojan')).toBe(true);
      expect(supportedProtocols.has('hysteria')).toBe(true);
      expect(supportedProtocols.has('hysteria2')).toBe(true);
      expect(supportedProtocols.has('http')).toBe(true);
      expect(supportedProtocols.has('socks5')).toBe(true);

      // All proxies should pass through filter
      const filtered = generator.filterProxies(parseResult.proxies);
      expect(filtered.length).toBe(parseResult.proxies.length);
    });
  });

  describe('Generator interface compliance', () => {
    it('should have correct format property', () => {
      const generator = FormatFactory.createGenerator('clash-meta');
      expect(generator.format).toBe('clash-meta');
    });

    it('should implement required methods', () => {
      const generator = FormatFactory.createGenerator('clash-meta');

      expect(typeof generator.generate).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
    });
  });

  describe('YAML output structure', () => {
    it('should produce valid YAML with required sections', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-meta');
      const output = generator.generate(parseResult.proxies);

      // Basic YAML validation - should contain expected sections
      expect(output).toContain('proxies:');
      expect(output).toContain('proxy-groups:');
      expect(output).toContain('rules:');
    });

    it('should include all parsed proxies in output', () => {
      const parser = FormatFactory.createParser('txt');
      const parseResult = parser.parse(testInput);

      const generator = FormatFactory.createGenerator('clash-meta');
      const output = generator.generate(parseResult.proxies);

      // Parse YAML and count proxies in the proxies array
      const parsed = parseYAML(output);
      const proxyCount = parsed.proxies?.length || 0;

      expect(proxyCount).toBe(parseResult.proxies.length);
    });
  });
});
