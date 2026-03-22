/**
 * Surfboard Generator Unit Tests
 * Tests for lib/surfboard/surfboard-generator.ts
 */

import '../../core/registry'; // Initialize protocol adapters
import { SurfboardGenerator } from '../surfboard-generator';
import type { ProxyNode } from '../../types';

describe('SurfboardGenerator', () => {
  let generator: SurfboardGenerator;

  beforeEach(() => {
    generator = new SurfboardGenerator();
  });

  describe('format property', () => {
    it('should return surfboard format type', () => {
      expect(generator.format).toBe('surfboard');
    });
  });

  describe('filterProxies method', () => {
    it('should return only supported protocols (SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2)', () => {
      const mockProxies = [
        { name: 'SS-Node', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass', cipher: 'aes-256-gcm' },
        { name: 'VMess-Node', type: 'vmess', server: '2.2.2.2', port: 2, uuid: 'uuid', tls: false, network: 'tcp' },
        { name: 'Trojan-Node', type: 'trojan', server: '3.3.3.3', port: 3, password: 'pass' },
        { name: 'HTTP-Node', type: 'http', server: '4.4.4.4', port: 4, username: 'user', password: 'pass' },
        { name: 'SOCKS5-Node', type: 'socks5', server: '5.5.5.5', port: 5 },
        { name: 'Hysteria2-Node', type: 'hysteria2', server: '6.6.6.6', port: 6, password: 'pass' },
        { name: 'SSR-Node', type: 'ssr', server: '7.7.7.7', port: 7, password: 'pass', cipher: 'aes-256-cfb' },
        { name: 'VLESS-Node', type: 'vless', server: '8.8.8.8', port: 8, uuid: 'uuid' },
        { name: 'Hysteria-Node', type: 'hysteria', server: '9.9.9.9', port: 9, auth: 'auth' },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      // Surfboard supports: SS, VMess, Trojan, HTTP, SOCKS5, Hysteria2
      // Does NOT support: SSR, VLESS, Hysteria (v1)
      expect(filtered.length).toBe(6);
      expect(filtered.map((p: any) => p.type)).toEqual(
        expect.arrayContaining(['ss', 'vmess', 'trojan', 'http', 'socks5', 'hysteria2'])
      );
      expect(filtered.map((p: any) => p.type)).not.toEqual(
        expect.arrayContaining(['ssr', 'vless', 'hysteria'])
      );
    });

    it('should preserve proxy properties after filtering', () => {
      const mockProxies = [
        { name: 'test-ss', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass', cipher: 'aes-256-gcm' },
        { name: 'test-trojan', type: 'trojan', server: '2.2.2.2', port: 2, password: 'pass' },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      expect(filtered.length).toBe(2);
      expect(filtered[0].name).toBe('test-ss');
      expect(filtered[0].server).toBe('1.1.1.1');
      expect(filtered[1].name).toBe('test-trojan');
    });
  });

  describe('getSupportedProtocols method', () => {
    it('should return set of supported protocols', () => {
      const supported = generator.getSupportedProtocols();

      expect(supported.has('ss')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('http')).toBe(true);
      expect(supported.has('socks5')).toBe(true);
      expect(supported.has('hysteria2')).toBe(true);

      // These should NOT be supported
      expect(supported.has('ssr')).toBe(false);
      expect(supported.has('vless')).toBe(false);
      expect(supported.has('hysteria')).toBe(false);
    });
  });

  describe('generate method', () => {
    it('should implement BaseFormatGenerator interface', () => {
      expect(typeof generator.generateHeader).toBe('function');
      expect(typeof generator.generateBody).toBe('function');
      expect(typeof generator.generateFooter).toBe('function');
      expect(typeof generator.filterProxies).toBe('function');
      expect(typeof generator.getSupportedProtocols).toBe('function');
    });

    it('should have correct method signatures', () => {
      const headerResult = generator.generateHeader([]);
      expect(typeof headerResult).toBe('string');

      const mockProxies = [{ name: 'test', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass', cipher: 'aes-256-gcm' }] as any;
      const bodyResult = generator.generateBody(mockProxies);
      expect(typeof bodyResult).toBe('string');

      const footerResult = generator.generateFooter();
      expect(typeof footerResult).toBe('string');
    });

    it('should generate complete Surfboard configuration', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SS-HK',
          type: 'ss',
          server: 'hk.example.com',
          port: 443,
          password: 'password123',
          cipher: 'aes-256-gcm',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      // Check for main sections
      expect(result).toContain('[General]');
      expect(result).toContain('[Proxy]');
      expect(result).toContain('[Proxy Group]');
      expect(result).toContain('[Rule]');
    });

    it('should include proxy nodes in Proxy section', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'Test-Proxy',
          type: 'ss',
          server: 'test.example.com',
          port: 8388,
          password: 'testpass',
          cipher: 'chacha20-ietf-poly1305',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('Test-Proxy');
      expect(result).toContain('test.example.com');
      expect(result).toContain('8388');
    });

    it('should include proxy groups', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SS-Node',
          type: 'ss',
          server: '1.1.1.1',
          port: 443,
          password: 'pass',
          cipher: 'aes-256-gcm',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('[Proxy Group]');
      expect(result).toContain('🚀 节点选择');
      expect(result).toContain('🐟 漏网之鱼');
    });
  });

  describe('proxy node formatting', () => {
    it('should format SS proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SS-Test',
          type: 'ss',
          server: 'ss.example.com',
          port: 8388,
          password: 'sspassword',
          cipher: 'aes-256-gcm',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('ss,');
      expect(result).toContain('ss.example.com');
      expect(result).toContain('8388');
      expect(result).toContain('encrypt-method=aes-256-gcm');
    });

    it('should format VMess proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'VMess-Test',
          type: 'vmess',
          server: 'vmess.example.com',
          port: 443,
          uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          tls: true,
          network: 'ws',
          'ws-opts': {
            path: '/path',
            headers: { Host: 'example.com' },
          },
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('vmess,');
      expect(result).toContain('vmess.example.com');
      expect(result).toContain('tls=true');
    });

    it('should format Trojan proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'Trojan-Test',
          type: 'trojan',
          server: 'trojan.example.com',
          port: 443,
          password: 'trojanpass',
          sni: 'example.com',
          'skip-cert-verify': false,
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('trojan,');
      expect(result).toContain('trojan.example.com');
      expect(result).toContain('password=trojanpass');
    });

    it('should format HTTP proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'HTTP-Test',
          type: 'http',
          server: 'http.example.com',
          port: 8080,
          username: 'httpuser',
          password: 'httppass',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('http,');
      expect(result).toContain('http.example.com');
      expect(result).toContain('8080');
    });

    it('should format SOCKS5 proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SOCKS5-Test',
          type: 'socks5',
          server: 'socks5.example.com',
          port: 1080,
          username: 'socksuser',
          password: 'sockspass',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('socks5,');
      expect(result).toContain('socks5.example.com');
      expect(result).toContain('1080');
    });

    it('should format Hysteria2 proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'Hysteria2-Test',
          type: 'hysteria2',
          server: 'hysteria2.example.com',
          port: 8443,
          password: 'hypass',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('hysteria,');
      expect(result).toContain('hysteria2.example.com');
      expect(result).toContain('8443');
    });
  });

  describe('unsupported protocols', () => {
    it('should filter out VLESS nodes', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'VLESS-Node',
          type: 'vless',
          server: 'vless.example.com',
          port: 443,
          uuid: 'uuid',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      // VLESS should be filtered out, so no proxy should appear in Proxy section
      const proxySection = result.match(/\[Proxy\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(proxySection).not.toContain('VLESS-Node');
    });

    it('should filter out SSR nodes', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SSR-Node',
          type: 'ssr',
          server: 'ssr.example.com',
          port: 8388,
          password: 'pass',
          cipher: 'aes-256-cfb',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      const proxySection = result.match(/\[Proxy\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(proxySection).not.toContain('SSR-Node');
    });

    it('should filter out Hysteria v1 nodes', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'Hysteria-Node',
          type: 'hysteria',
          server: 'hysteria.example.com',
          port: 8443,
          auth: 'auth',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      const proxySection = result.match(/\[Proxy\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(proxySection).not.toContain('Hysteria-Node');
    });
  });
});
