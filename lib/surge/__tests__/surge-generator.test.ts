/**
 * Tests for Surge generator (lib level)
 */

import { describe, it, expect } from 'vitest';
import { SurgeGenerator } from '../surge-generator';

describe('SurgeGenerator', () => {
  const generator = new SurgeGenerator();

  describe('format property', () => {
    it('should return surge format type', () => {
      expect(generator.format).toBe('surge');
    });
  });

  describe('filterProxies', () => {
    it('should keep only SS, VMess, SSR, Trojan, HTTP', () => {
      const mockProxies = [
        { name: 'ss1', type: 'ss', server: '1.1.1.1', port: 1, cipher: 'aes-256-gcm', password: 'p' },
        { name: 'vm1', type: 'vmess', server: '2.2.2.2', port: 2, uuid: 'u' },
        { name: 'ssr1', type: 'ssr', server: '3.3.3.3', port: 3, cipher: 'dummy', password: 'p', protocol: 'origin', obfs: 'plain' },
        { name: 'tj1', type: 'trojan', server: '4.4.4.4', port: 4, password: 'p' },
        { name: 'http1', type: 'http', server: '5.5.5.5', port: 5, username: 'u', password: 'p' },
        { name: 'socks', type: 'socks5', server: '6.6.6.6', port: 6 },
        { name: 'vl', type: 'vless', server: '7.7.7.7', port: 7, uuid: 'u' },
        { name: 'hy', type: 'hysteria', server: '8.8.8.8', port: 8, auth_str: 'a' },
        { name: 'hy2', type: 'hysteria2', server: '9.9.9.9', port: 9, password: 'p' },
      ] as any[];

      const filtered = generator.filterProxies(mockProxies as any);

      expect(filtered.map(p => p.name)).toEqual(['ss1', 'vm1', 'ssr1', 'tj1', 'http1']);
    });
  });

  describe('getSupportedProtocols', () => {
    it('should return the surge-supported protocol set', () => {
      const supported = generator.getSupportedProtocols();
      expect(supported.has('ss')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('ssr')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('http')).toBe(true);
      expect(supported.has('socks5')).toBe(false);
      expect(supported.has('vless')).toBe(false);
    });
  });

  describe('proxy line formatting', () => {
    it('should format an SS node', () => {
      const output = generator.generate([
        { name: 'ss1', type: 'ss', server: '1.2.3.4', port: 5004, cipher: 'aes-256-gcm', password: 'secret' },
      ] as any);

      expect(output).toContain('ss1 = ss,1.2.3.4,5004,encrypt-method=aes-256-gcm,password=secret,tfo=false,udp-relay=false');
    });

    it('should format a VMess node with ws transport', () => {
      const output = generator.generate([
        { name: 'vm1', type: 'vmess', server: '1.2.3.4', port: 443, uuid: 'uuid-1', tls: false, network: 'ws', alterId: 0, cipher: 'auto', 'skip-cert-verify': false },
      ] as any);

      expect(output).toContain('vm1 = vmess,1.2.3.4,443,username=uuid-1,tls=false,vmess-aead=false,tls13=false,ws=true,sni=1.2.3.4,skip-cert-verify=false,tfo=false,udp-relay=false');
    });

    it('should format an SSR node as external ssr-local policy', () => {
      const output = generator.generate([
        { name: 'ssr1', type: 'ssr', server: '20.1.1.1', port: 59814, cipher: 'dummy', password: 'pw', protocol: 'origin', obfs: 'plain' },
      ] as any);

      expect(output).toContain('ssr1 = external,exec=/usr/bin/ssr-local,args=-l,args=1080,args=-s,args=20.1.1.1,args=-p,args=59814,args=-m,args=dummy,args=-k,args=pw,args=-o,args=plain,args=-O,args=origin,local-port=1080,addresses=20.1.1.1,tfo=false,udp-relay=false');
    });

    it('should format a Trojan node', () => {
      const output = generator.generate([
        { name: 'tj1', type: 'trojan', server: 'ca.example.com', port: 443, password: 'pw', 'skip-cert-verify': true },
      ] as any);

      expect(output).toContain('tj1 = trojan,ca.example.com,443,password=pw,skip-cert-verify=true,tfo=false,udp-relay=false');
    });

    it('should format an HTTP node with credentials', () => {
      const output = generator.generate([
        { name: 'http1', type: 'http', server: '5.6.7.8', port: 251, username: 'user', password: 'pass' },
      ] as any);

      expect(output).toContain('http1 = http,5.6.7.8,251,username=user,password=pass');
    });
  });

  describe('group rendering', () => {
    it('should quote non-builtin policies and keep built-ins unquoted', () => {
      const output = generator.generate([
        { name: 'ss1', type: 'ss', server: '1.2.3.4', port: 1, cipher: 'aes-256-gcm', password: 'p' },
      ] as any);

      expect(output).toContain('🟢 Proxy = select, "♻️ 自动选择", "🇭🇰 香港", "🇺🇸 美国", "🇯🇵 日本", "🇸🇬 新加坡", "🇰🇷 韩国", "🇨🇳 台湾", "🚀 直接连接"');
      expect(output).toContain('⛔️ 广告拦截 = select, REJECT, "🚀 直接连接"');
      expect(output).toContain('🚀 直接连接 = select, DIRECT');
    });

    it('should render smart region groups with node lists and regex filters', () => {
      const output = generator.generate([
        { name: 'HK-Node', type: 'ss', server: '1.2.3.4', port: 1, cipher: 'aes-256-gcm', password: 'p' },
      ] as any);

      expect(output).toContain('♻️ 自动选择 = smart, "HK-Node", interval=300, timeout=5, udp-relay=true');
      expect(output).toContain('🇭🇰 香港 = smart, "HK-Node", policy-regex-filter=HongKong|HK|香港|🇭🇰, interval=300, timeout=5, udp-relay=true');
    });
  });

  describe('empty input', () => {
    it('should return a comment when no proxies are supported', () => {
      const output = generator.generate([
        { name: 'vl', type: 'vless', server: '1.2.3.4', port: 1, uuid: 'u' },
      ] as any);

      expect(output).toBe('# No proxies supported by Surge\n');
    });
  });
});
