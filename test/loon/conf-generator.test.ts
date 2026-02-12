/**
 * Tests for Loon configuration generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { parseProxyLink, parseMultipleProxies } from '@/lib/parsers';

// Note: Loon generator doesn't exist yet, but we can test the expected output format
// This test verifies that test data structure is correct for future Loon generator

describe('Loon Configuration', () => {
  describe('Expected Configuration Format', () => {
    it('should have valid Loon configuration structure', () => {
      const expectedConf = readFileSync(`${__dirname}/expect.conf`, 'utf-8');

      // Parse lines to verify structure
      const lines = expectedConf.split('\n');

      // Should have [General] section
      expect(lines.some(line => line.includes('[General]'))).toBe(true);

      // Should have DNS configuration
      expect(lines.some(line => line.includes('dns-server='))).toBe(true);

      // Should have proxy configuration
      expect(lines.some(line => line.includes('v2rayse_test ='))).toBe(true);
      expect(lines.some(line => line.includes('v2rayse_test 2 ='))).toBe(true);
      expect(lines.some(line => line.includes('v2rayse_test 3 ='))).toBe(true);

      // Should have [Proxy] section
      expect(lines.some(line => line.includes('[Proxy]'))).toBe(true);

      // Should have [Proxy Group] section with emoji groups
      expect(lines.some(line => line.includes('[Proxy Group]'))).toBe(true);
      expect(lines.some(line => line.includes('🚀 节点选择'))).toBe(true);
      expect(lines.some(line => line.includes('📲 电报消息'))).toBe(true);

      // Should have [Rule] section
      expect(lines.some(line => line.includes('[Rule]'))).toBe(true);
    });

    it('should have proper proxy link formats', () => {
      const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
      const lines = inputTxt.split('\n').filter(line => line.trim());

      // Should contain ss:// link
      expect(lines.some(line => line.startsWith('ss://'))).toBe(true);

      // Should contain vmess:// link
      expect(lines.some(line => line.startsWith('vmess://'))).toBe(true);

      // Should contain trojan:// link
      expect(lines.some(line => line.startsWith('trojan://'))).toBe(true);

      // Should contain http:// link
      expect(lines.some(line => line.startsWith('http://')).toBe(true);

      // Should contain socks5:// link
      expect(lines.some(line => line.startsWith('socks5://'))).toBe(true);

      // Should contain hysteria2:// link
      expect(lines.some(line => line.startsWith('hysteria2://'))).toBe(true);

      // Should contain vless// link
      expect(lines.some(line => line.startsWith('vless://'))).toBe(true);

      // Should contain hysteria:// link
      expect(lines.some(line => line.startsWith('hysteria://'))).toBe(true);
    });

    it('should parse all proxy types correctly', () => {
      const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
      const lines = inputTxt.split('\n').filter(line => line.trim());

      const proxies = lines.map(line => parseProxyLink(line)).filter(Boolean);

      // Should successfully parse multiple proxy types
      const types = new Set(proxies.map(p => p.type));

      expect(types.has('ss')).toBe(true);
      expect(types.has('vmess')).toBe(true);
      expect(types.has('trojan')).toBe(true);
      expect(types.has('http')).toBe(true);
      expect(types.has('socks5')).toBe(true);
      expect(types.has('hysteria')).toBe(true);
      expect(types.has('hysteria2')).toBe(true);
      expect(types.has('vless')).toBe(true);
    });

    it('should handle subscription link', () => {
      const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
      const lines = inputTxt.split('\n').filter(line => line.trim());

      // Last line should be a subscription link
      const lastLine = lines[lines.length - 1];

      expect(lastLine).toBeTruthy();
      expect(lastLine?.startsWith('https://t.me/')).toBe(true);
    });
  });

  describe('Proxy Parsing Integration', () => {
    it('should parse input and get proxy nodes', () => {
      const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');

      const { proxies, unsupported } = parseMultipleProxies(inputTxt);

      // Should parse multiple proxies
      expect(proxies.length).toBeGreaterThan(0);
      expect(proxies.length).toBe(8); // Based on test/input.txt having 8 proxy links + 1 subscription

      // Should have no unsupported protocols for Loon (Loon supports most protocols)
      expect(unsupported.length).toBe(0);
    });

    it('should preserve proxy properties correctly', () => {
      const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
      const lines = inputTxt.split('\n').filter(line => line.trim() && !line.startsWith('https://'));

      const proxies = lines.map(line => parseProxyLink(line)).filter(Boolean);

      // Check SS proxy
      const ssProxy = proxies.find((p: any) => p.type === 'ss');
      expect(ssProxy).toBeDefined();
      expect(ssProxy?.server).toBeTruthy();
      expect(ssProxy?.port).toBeDefined();
      expect(ssProxy?.password).toBeDefined();

      // Check VMess proxy
      const vmessProxy = proxies.find((p: any) => p.type === 'vmess');
      expect(vmessProxy).toBeDefined();
      expect(vmessProxy?.server).toBeTruthy();
      expect(vmessProxy?.port).toBeDefined();
      expect(vmessProxy?.uuid).toBeDefined();

      // Check Trojan proxy
      const trojanProxy = proxies.find((p: any) => p.type === 'trojan');
      expect(trojanProxy).toBeDefined();
      expect(trojanProxy?.server).toBeTruthy();
      expect(trojanProxy?.port).toBeDefined();
      expect(trojanProxy?.password).toBeDefined();
    });
  });
});
