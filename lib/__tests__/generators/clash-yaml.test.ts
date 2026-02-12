/**
 * Tests for Clash YAML generator (lib level)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClashYamlGenerator } from '../../generators/clash-yaml-generator';
import { parseProxyLink } from '../../parsers';

describe('ClashYamlGenerator (lib)', () => {
  let generator: ClashYamlGenerator;

  beforeEach(() => {
    generator = new ClashYamlGenerator();
  });

  describe('format property', () => {
    it('should return clash-meta format type', () => {
      expect(generator.format).toBe('clash-meta');
    });
  });

  describe('filterProxies method', () => {
    it('should return all proxies (Clash Meta supports all protocols)', () => {
      const mockProxies = [
        { name: 'test1', type: 'ss', server: '1.1.1.1', port: 1 },
        { name: 'test2', type: 'vless', server: '2.2.2.2', port: 2, uuid: 'abc' },
        { name: 'test3', type: 'hysteria2', server: '3.3.3.3', port: 3, password: 'test' },
        { name: 'test4', type: 'socks5', server: '4.4.4.4', port: 4 },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      // Clash Meta should return all proxies
      expect(filtered.length).toBe(mockProxies.length);
      expect(filtered).toEqual(mockProxies);
    });

    it('should preserve proxy properties', () => {
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
    it('should return set of all supported protocols', () => {
      const supported = generator.getSupportedProtocols();

      expect(supported.has('ss')).toBe(true);
      expect(supported.has('ssr')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('vless')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('hysteria')).toBe(true);
      expect(supported.has('hysteria2')).toBe(true);
      expect(supported.has('http')).toBe(true);
      expect(supported.has('socks5')).toBe(true);
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
      expect(parsed?.config.password).toBe('C5MeD6Ft3CWlJId');
    });

    it('should parse vmess proxy correctly', () => {
      const vmessLink = 'vmess://eyJhbGciOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=';
      const parsed = parseProxyLink(vmessLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('vmess');
    });

    it('should parse vless proxy correctly', () => {
      const vlessLink = 'vless://abc-def-ghi-jkl-mno@1.2.3.4:7777?encryption=none&security=tls&type=tcp&headerType=none#test';
      const parsed = parseProxyLink(vlessLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('vless');
      expect(parsed?.config.server).toBe('1.2.3.4');
      expect(parsed?.config.port).toBe(7777);
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

    it('should parse socks5 proxy correctly', () => {
      const socks5Link = 'socks5://124.15.12.24:2312';
      const parsed = parseProxyLink(socks5Link);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('socks5');
      expect(parsed?.config.server).toBe('124.15.12.24');
      expect(parsed?.config.port).toBe(2312);
    });
  });
});
