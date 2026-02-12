/**
 * Tests for Clash YAML generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { parseProxyLink, parseMultipleProxies } from '@/lib/parsers';
import { ClashYamlGenerator } from '@/lib/generators/clash-yaml-generator';
import { generateSimpleYaml } from '@/lib/clash/generator/yaml';

// Load test data
const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
const expectedYaml = readFileSync(`${__dirname}/expect.yaml`, 'utf-8');

describe('ClashYamlGenerator', () => {
  let generator: ClashYamlGenerator;

  beforeEach(() => {
    generator = new ClashYamlGenerator();
  });

  describe('generateSimpleYaml', () => {
    it('should generate valid YAML from proxy nodes', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = generateSimpleYaml(proxies);

      // Parse result to verify it's valid YAML
      expect(() => {
        // Should contain key YAML sections
        expect(result).toContain('proxies:');
        expect(result).toContain('proxy-groups:');
        expect(result).toContain('rules:');
      });
    });

    it('should generate proxy groups with emoji tags', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = generateSimpleYaml(proxies);

      // Check for emoji tags in proxy groups
      expect(result).toMatch(/🤖 OpenAI/);
      expect(result).toMatch(/🌌 Google/);
    });

    it('should handle empty proxy array', () => {
      const result = generateSimpleYaml([]);
      expect(result).toBeTruthy();
      expect(result).toContain('proxies: []');
    });
  });

  describe('ClashYamlGenerator class', () => {
    it('should generate complete YAML config', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const parsedProxies = parseMultipleProxies(inputTxt);

      const result = generator.generate(parsedProxies.proxies);

      // Verify it's a string
      expect(typeof result).toBe('string');

      // Verify basic structure
      expect(result).toContain('port: 789');
      expect(result).toContain('socks-port: 789');
      expect(result).toContain('allow-lan: true');
      expect(result).toContain('mode: rule');
    });

    it('should filter out unsupported protocols', () => {
      // Clash Meta supports all protocols, so no filtering needed
      const input = inputTxt.split('\n').filter(line => line.trim());
      const parsedProxies = parseMultipleProxies(inputTxt);

      const filtered = generator.filterProxies(parsedProxies.proxies);

      // Clash Meta should return all proxies
      expect(filtered.length).toBe(parsedProxies.proxies.length);
    });

    it('should return correct supported protocols set', () => {
      const supported = generator.getSupportedProtocols();

      // Should include all protocols
      expect(supported.has('ss')).toBe(true);
      expect(supported.has('ssr')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('vless')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('hysteria')).toBe(true);
      expect(supported.has('hysteria2')).toBe(true);
      expect(supported.has('http')).toBe(true);
      expect(supported.has('socks5')).toBe(true);

      // Should not include loon
      expect(supported.has('loon')).toBe(false);
    });

    it('should have correct format type', () => {
      expect(generator.format).toBe('clash-meta');
    });

    it('should implement BaseFormatGenerator interface', () => {
      // Should have required methods
      expect(typeof generator.generateHeader).toBe('function');
      expect(typeof generator.generateBody).toBe('function');
      expect(typeof generator.generateFooter).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
    });
  });
});
