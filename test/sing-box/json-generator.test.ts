/**
 * Tests for Sing-Box JSON generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { parseProxyLink, parseMultipleProxies } from '@/lib/parsers';
import { SingBoxJsonGenerator } from '@/lib/generators/singbox-json-generator';

// Load test data
const inputTxt = readFileSync(`${__dirname}/input.txt`, 'utf-8');
const expectedJson = readFileSync(`${__dirname}/expect.json`, 'utf-8');

describe('SingBoxJsonGenerator', () => {
  let generator: SingBoxJsonGenerator;

  beforeEach(() => {
    generator = new SingBoxJsonGenerator();
  });

  describe('generateSingBoxConfig', () => {
    it('should generate valid JSON from proxy nodes', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = JSON.parse(generator.generate(proxies));

      // Verify basic structure
      expect(result).toHaveProperty('log');
      expect(result).toHaveProperty('dns');
      expect(result).toHaveProperty('inbounds');
      expect(result).toHaveProperty('outbounds');
      expect(result).toHaveProperty('route');
    });

    it('should generate DNS configuration', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = JSON.parse(generator.generate(proxies));

      // Check DNS servers
      expect(result.dns).toHaveProperty('servers');
      expect(result.dns.servers).toBeInstanceOf(Array);
      expect(result.dns.servers.length).toBeGreaterThan(0);
    });

    it('should generate inbounds with mixed type', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = JSON.parse(generator.generate(proxies));

      // Check inbounds
      expect(result.inbounds).toBeInstanceOf(Array);
      expect(result.inbounds.length).toBeGreaterThan(0);

      // Should have mixed type inbound
      const mixedInbound = result.inbounds.find((bound: any) => bound.type === 'mixed');
      expect(mixedInbound).toBeDefined();
      expect(mixedInbound?.sniff).toBe(true);
    });

    it('should generate selector outbounds with service tags', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = JSON.parse(generator.generate(proxies));

      // Find selector outbounds
      const selectors = result.outbounds.filter((bound: any) => bound.type === 'selector');

      expect(selectors.length).toBeGreaterThan(0);

      // Check for specific service tags
      const openai = selectors.find((s: any) => s.tag === '🤖 OpenAI');
      const google = selectors.find((s: any) => s.tag === '🌌 Google');
      expect(openai).toBeDefined();
      expect(google).toBeDefined();
    });

    it('should generate route rules', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const result = JSON.parse(generator.generate(proxies));

      // Check route configuration
      expect(result.route).toHaveProperty('rules');
      expect(result.route.rules).toBeInstanceOf(Array);
      expect(result.route.rules.length).toBeGreaterThan(0);

      // Check for specific rules
      const dnsRule = result.route.rules.find((r: any) => r.protocol === 'dns');
      expect(dnsRule).toBeDefined();
    });

    it('should return error when no proxies provided', () => {
      const result = generator.generate([]);

      expect(() => {
        JSON.parse(result);
      }).toThrow('No proxies found');
    });
  });

  describe('convertToSingBoxOutbound', () => {
    it('should convert ss proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'ss');

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'shadowsocks');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('password', proxy.password);
      }
    });

    it('should convert vmess proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'vmess');

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'vmess');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('uuid', proxy.uuid);
        expect(result).toHaveProperty('packet_encoding', 'xudp');
      }
    });

    it('should convert vless proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'vless');

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'vless');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('uuid', proxy.uuid);
      }
    });

    it('should convert trojan proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'trojan';

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'trojan');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('password', proxy.password);
        expect(result).toHaveProperty('tls');
      }
    });

    it('should convert hysteria2 proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'hysteria2';

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'hysteria2');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('password', proxy.password);
        expect(result).toHaveProperty('tls');
      }
    });

    it('should convert http proxy correctly', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const proxy = input.map(line => parseProxyLink(line)).filter(Boolean).find((p: any) => p.type === 'http';

      if (proxy) {
        const result = generator['convertToSingBoxOutbound'](proxy);

        expect(result).toHaveProperty('type', 'http');
        expect(result).toHaveProperty('server', proxy.server);
        expect(result).toHaveProperty('server_port', proxy.port);
        expect(result).toHaveProperty('users');
        expect(result).toHaveProperty('set_system_proxy', true);
      }
    });
  });

  describe('SingBoxJsonGenerator class', () => {
    it('should filter out SSR and SOCKS5 protocols', () => {
      const input = inputTxt.split('\n').filter(line => line.trim());
      const allProxies = input.map(line => parseProxyLink(line)).filter(Boolean);

      const parsedProxies = parseMultipleProxies(inputTxt);
      const filtered = generator.filterProxies(allProxies);

      // SSR and SOCKS5 should be filtered out
      const ssrProxies = allProxies.filter((p: any) => p.type === 'ssr');
      const socks5Proxies = allProxies.filter((p: any) => p.type === 'socks5');

      expect(filtered.length).toBeLessThan(allProxies.length);
      expect(filtered.some((p: any) => p.type === 'ssr')).toBe(false);
      expect(filtered.some((p: any) => p.type === 'socks5')).toBe(false);
    });

    it('should return correct supported protocols set', () => {
      const supported = generator.getSupportedProtocols();

      // Should include all protocols except SSR and SOCKS5
      expect(supported.has('ss')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('vless')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('hysteria')).toBe(true);
      expect(supported.has('hysteria2')).toBe(true);
      expect(supported.has('http')).toBe(true);

      // Should NOT include SSR and SOCKS5
      expect(supported.has('ssr')).toBe(false);
      expect(supported.has('socks5')).toBe(false);
    });

    it('should have correct format type', () => {
      expect(generator.format).toBe('sing-box');
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
