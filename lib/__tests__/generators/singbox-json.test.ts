/**
 * Tests for Sing-Box JSON generator (lib level)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SingBoxJsonGenerator } from '../../generators/singbox-json-generator';
import { parseProxyLink } from '../../parsers';

describe('SingBoxJsonGenerator (lib)', () => {
  let generator: SingBoxJsonGenerator;

  beforeEach(() => {
    generator = new SingBoxJsonGenerator();
  });

  describe('format property', () => {
    it('should return sing-box format type', () => {
      expect(generator.format).toBe('sing-box');
    });
  });

  describe('filterProxies method', () => {
    it('should filter out SSR and SOCKS5 protocols', () => {
      const mockProxies = [
        { name: 'test1', type: 'ss', server: '1.1.1.1', port: 1 },
        { name: 'test2', type: 'ssr', server: '2.2.2.2', port: 2 }, // Should be filtered
        { name: 'test3', type: 'vmess', server: '3.3.3.3', port: 3, uuid: 'abc' },
        { name: 'test4', type: 'vless', server: '4.4.4.4', port: 4, uuid: 'def' },
        { name: 'test5', type: 'trojan', server: '5.5.5.5', port: 5, password: 'pass' },
        { name: 'test6', type: 'hysteria2', server: '6.6.6.6', port: 6, password: 'pass2' },
        { name: 'test7', type: 'http', server: '7.7.7.7', port: 7, username: 'user', password: 'pass' },
        { name: 'test8', type: 'socks5', server: '8.8.8.8', port: 8 }, // Should be filtered
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      // Should exclude ssr and socks5
      expect(filtered.length).toBeLessThan(mockProxies.length);
      expect(filtered.some((p: any) => p.type === 'ssr')).toBe(false);
      expect(filtered.some((p: any) => p.type === 'socks5')).toBe(false);
    });

    it('should preserve supported proxy properties', () => {
      const mockProxies = [
        { name: 'test', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass' },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      expect(filtered[0].name).toBe('test');
      expect(filtered[0].server).toBe('1.1.1.1');
      expect(filtered[0].port).toBe(1);
    });
  });

  describe('getSupportedProtocols method', () => {
    it('should return set of supported protocols (excludes SSR and SOCKS5)', () => {
      const supported = generator.getSupportedProtocols();

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
  });

  describe('generate methods', () => {
    it('should implement BaseFormatGenerator interface', () => {
      expect(typeof generator.generateHeader).toBe('function');
      expect(typeof generator.generateBody).toBe('function');
      expect(typeof generator.generateFooter).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
    });

    it('should have correct method signatures', () => {
      // generateHeader should accept ProxyNode[] and return string
      const headerResult = generator.generateHeader([]);
      expect(typeof headerResult).toBe('string');

      // generateBody should accept ProxyNode[] and return string
      const mockProxies = [{ name: 'test', type: 'ss', server: '1.1.1.1', port: 1 }] as any;
      const bodyResult = generator.generateBody(mockProxies);
      expect(typeof bodyResult).toBe('string');

      // generateFooter should return string
      const footerResult = generator.generateFooter();
      expect(typeof footerResult).toBe('string');
    });
  });

  describe('proxy parsing integration', () => {
    it('should parse ss proxy correctly', () => {
      const ssLink = 'ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test';
      const parsed = parseProxyLink(ssLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('ss');
      expect(parsed?.config.server).toBe('198.57.27.218');
      expect(parsed?.config.port).toBe(5004);
    });

    it('should parse vmess proxy correctly', () => {
      const vmessLink = 'vmess://eyJhbGciOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=';
      const parsed = parseProxyLink(vmessLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('vmess');
    });

    it('should parse trojan proxy correctly', () => {
      const trojanLink = 'trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443#v2rayse_test';
      const parsed = parseProxyLink(trojanLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('trojan');
      expect(parsed?.config.server).toBe('ca-trojan.bonds.id');
      expect(parsed?.config.port).toBe(443);
    });

    it('should parse hysteria2 proxy correctly', () => {
      const hysteria2Link = 'hysteria2://45cf663d-cd77-4674-b1c0-7c2f29ac5d2f2f@1.123.132.101:30336/?insecure=1&sni=bing.com#sgp-optimize-Hysteria2';
      const parsed = parseProxyLink(hysteria2Link);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('hysteria2');
      expect(parsed?.config.server).toBe('1.123.132.101');
      expect(parsed?.config.port).toBe(30336);
    });

    it('should parse http proxy correctly', () => {
      const httpLink = 'http://username:password@124.15.12.24:251';
      const parsed = parseProxyLink(httpLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('http');
      expect(parsed?.config.username).toBe('username');
      expect(parsed?.config.password).toBe('password');
      expect(parsed?.config.server).toBe('124.15.12.24');
      expect(parsed?.config.port).toBe(251);
    });
  });

  describe('generateSingBoxConfig integration', () => {
    it('should generate valid JSON structure', () => {
      const mockProxies = [
        { name: 'ss-test', type: 'ss', server: '1.1.1.1', port: 1, password: 'test' },
        { name: 'vmess-test', type: 'vmess', server: '2.2.2.2', port: 2, uuid: 'test-uuid' },
        { name: 'vless-test', type: 'vless', server: '3.3.3.3', port: 3, uuid: 'test-uuid-2' },
        { name: 'trojan-test', type: 'trojan', server: '4.4.4.4', port: 4, password: 'test-pass' },
        { name: 'hysteria2-test', type: 'hysteria2', server: '6.6.6.6', port: 6, password: 'test-pass2' },
        { name: 'http-test', type: 'http', server: '7.7.7.7', port: 7, username: 'user', password: 'pass' },
      ] as any;

      const result = generator.generateBody(mockProxies);

      // Verify JSON is valid
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);

      // Verify basic structure
      expect(parsed).toHaveProperty('log');
      expect(parsed).toHaveProperty('dns');
      expect(parsed).toHaveProperty('inbounds');
      expect(parsed).toHaveProperty('outbounds');
      expect(parsed).toHaveProperty('route');
    });

    it('should generate DNS configuration', () => {
      const mockProxies = [{ name: 'test', type: 'ss', server: '1.1.1.1', port: 1 }] as any;
      const result = generator.generateBody(mockProxies);

      const parsed = JSON.parse(result);

      expect(parsed.dns).toHaveProperty('servers');
      expect(parsed.dns.servers).toBeInstanceOf(Array);
    });

    it('should generate outbounds configuration', () => {
      const mockProxies = [
        { name: 'test1', type: 'ss', server: '1.1.1.1', port: 1 },
        { name: 'test2', type: 'vmess', server: '2.2.2.2', port: 2, uuid: 'abc' },
        { name: 'test3', type: 'vless', server: '3.3.3.3', port: 3, uuid: 'def' },
        { name: 'test4', type: 'trojan', server: '4.4.4.4', port: 4, password: 'pass' },
        { name: 'test5', type: 'hysteria2', server: '6.6.6.6', port: 6, password: 'pass2' },
        { name: 'test6', type: 'http', server: '7.7.7.7', port: 7, username: 'user', password: 'pass' },
      ] as any;

      const result = generator.generateBody(mockProxies);
      const parsed = JSON.parse(result);

      expect(parsed.outbounds).toBeInstanceOf(Array);
      expect(parsed.outbounds.length).toBeGreaterThan(0);
    });
  });
});
