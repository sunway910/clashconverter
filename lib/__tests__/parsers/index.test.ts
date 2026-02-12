/**
 * Tests for parser (lib level)
 */

import { describe, it, expect } from 'vitest';
import { parseProxyLink, parseMultipleProxies } from '../../parsers/index';

describe('Parser Functions', () => {
  describe('parseProxyLink', () => {
    it('should parse ss proxy link', () => {
      const ssLink = 'ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test';
      const parsed = parseProxyLink(ssLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('ss');
      expect(parsed?.config.server).toBe('198.57.27.218');
      expect(parsed?.config.port).toBe(5004);
      expect(parsed?.config.password).toBe('C5MeD6Ft3CWlJId');
    });

    it('should parse vmess proxy link', () => {
      const vmessLink = 'vmess://eyJhbGciOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=';
      const parsed = parseProxyLink(vmessLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('vmess');
    });

    it('should parse vless proxy link', () => {
      const vlessLink = 'vless://abc-def-ghi-jkl-mno@1.2.3.4:7777?encryption=none&security=tls&type=tcp&headerType=none#test';
      const parsed = parseProxyLink(vlessLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('vless');
      expect(parsed?.config.server).toBe('1.2.3.4');
      expect(parsed?.config.port).toBe(7777);
    });

    it('should parse trojan proxy link', () => {
      const trojanLink = 'trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443#v2rayse_test';
      const parsed = parseProxyLink(trojanLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('trojan');
      expect(parsed?.config.server).toBe('ca-trojan.bonds.id');
      expect(parsed?.config.port).toBe(443);
    });

    it('should parse hysteria2 proxy link', () => {
      const hysteria2Link = 'hysteria2://45cf663d-cd77-4674-b1c0-7c2f29ac5d2f2f@1.123.132.101:30336/?insecure=1&sni=bing.com#sgp-optimize-Hysteria2';
      const parsed = parseProxyLink(hysteria2Link);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('hysteria2');
      expect(parsed?.config.server).toBe('1.123.132.101');
      expect(parsed?.config.port).toBe(30336);
    });

    it('should parse http proxy link', () => {
      const httpLink = 'http://username:password@124.15.12.24:251';
      const parsed = parseProxyLink(httpLink);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('http');
      expect(parsed?.config.username).toBe('username');
      expect(parsed?.config.password).toBe('password');
      expect(parsed?.config.server).toBe('124.15.12.24');
      expect(parsed?.config.port).toBe(251);
    });

    it('should parse socks5 proxy link', () => {
      const socks5Link = 'socks5://124.15.12.24:2312';
      const parsed = parseProxyLink(socks5Link);

      expect(parsed).toBeTruthy();
      expect(parsed?.config?.type).toBe('socks5');
      expect(parsed?.config.server).toBe('124.15.12.24');
      expect(parsed?.config.port).toBe(2312);
    });

    it('should return null for invalid proxy link', () => {
      const invalidLink = 'invalid://link';
      const parsed = parseProxyLink(invalidLink);

      expect(parsed).toBeNull();
    });

    it('should return null for empty link', () => {
      const parsed = parseProxyLink('');

      expect(parsed).toBeNull();
    });
  });

  describe('parseMultipleProxies', () => {
    it('should parse multiple proxy links', () => {
      const input = `ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test1
vmess://eyJhbGciOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=
trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443#test1
http://username:password@124.15.12.24:251
socks5://124.15.12.24:2312`;

      const { proxies, unsupported } = parseMultipleProxies(input);

      // Should parse 5 valid proxies
      expect(proxies.length).toBe(5);
      expect(unsupported.length).toBe(0);
    });

    it('should filter out comment lines', () => {
      const input = `ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test
# This is a comment
vmess://eyJhbGciOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=
trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443#test1`;

      const { proxies, unsupported } = parseMultipleProxies(input);

      // Should parse 3 valid proxies (skip comment)
      expect(proxies.length).toBe(3);
      expect(unsupported.length).toBe(0);
    });

    it('should handle duplicate names correctly', () => {
      const input = `ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test1
ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test2
ss://YWVzLTEyOC1nY206QzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#test3`;

      const { proxies } = parseMultipleProxies(input);

      // Should parse 3 proxies with correct numbering
      expect(proxies.length).toBe(3);
      expect(proxies[0].name).toBe('test1');
      expect(proxies[1].name).toBe('test2');
      expect(proxies[2].name).toBe('test3');
    });
  });
});