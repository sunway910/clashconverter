/**
 * QuantumultX Generator Unit Tests
 * Tests for lib/quantumultx/quantumultx-generator.ts
 */

import '../../core/registry'; // Initialize protocol adapters
import { QuanxGenerator } from '../quantumultx-generator';
import type { ProxyNode } from '../../types';

describe('QuanxGenerator', () => {
  let generator: QuanxGenerator;

  beforeEach(() => {
    generator = new QuanxGenerator();
  });

  describe('format property', () => {
    it('should return quantumultx format type', () => {
      expect(generator.format).toBe('quantumultx');
    });
  });

  describe('filterProxies method', () => {
    it('should return only supported protocols (SS, SSR, VMess, Trojan, HTTP, SOCKS5)', () => {
      const mockProxies = [
        { name: 'SS-Node', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass', cipher: 'aes-256-gcm' },
        { name: 'SSR-Node', type: 'ssr', server: '2.2.2.2', port: 2, password: 'pass', cipher: 'aes-256-cfb', protocol: 'origin', obfs: 'plain' },
        { name: 'VMess-Node', type: 'vmess', server: '3.3.3.3', port: 3, uuid: 'uuid', tls: false, network: 'tcp' },
        { name: 'Trojan-Node', type: 'trojan', server: '4.4.4.4', port: 4, password: 'pass' },
        { name: 'HTTP-Node', type: 'http', server: '5.5.5.5', port: 5, username: 'user', password: 'pass' },
        { name: 'SOCKS5-Node', type: 'socks5', server: '6.6.6.6', port: 6 },
        { name: 'VLESS-Node', type: 'vless', server: '7.7.7.7', port: 7, uuid: 'uuid' },
        { name: 'Hysteria-Node', type: 'hysteria', server: '8.8.8.8', port: 8, auth: 'auth' },
        { name: 'Hysteria2-Node', type: 'hysteria2', server: '9.9.9.9', port: 9, password: 'pass' },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      // QuantumultX supports: SS, SSR, VMess, Trojan, HTTP, SOCKS5
      // Does NOT support: VLESS, Hysteria, Hysteria2
      expect(filtered.length).toBe(6);
      expect(filtered.map((p: any) => p.type)).toEqual(
        expect.arrayContaining(['ss', 'ssr', 'vmess', 'trojan', 'http', 'socks5'])
      );
      expect(filtered.map((p: any) => p.type)).not.toEqual(
        expect.arrayContaining(['vless', 'hysteria', 'hysteria2'])
      );
    });

    it('should preserve proxy properties after filtering', () => {
      const mockProxies = [
        { name: 'test-ss', type: 'ss', server: '1.1.1.1', port: 1, password: 'pass', cipher: 'aes-256-gcm' },
        { name: 'test-vmess', type: 'vmess', server: '2.2.2.2', port: 2, uuid: 'uuid' },
      ] as any;

      const filtered = generator.filterProxies(mockProxies);

      expect(filtered.length).toBe(2);
      expect(filtered[0].name).toBe('test-ss');
      expect(filtered[0].server).toBe('1.1.1.1');
      expect(filtered[1].name).toBe('test-vmess');
    });
  });

  describe('getSupportedProtocols method', () => {
    it('should return set of supported protocols', () => {
      const supported = generator.getSupportedProtocols();

      expect(supported.has('ss')).toBe(true);
      expect(supported.has('ssr')).toBe(true);
      expect(supported.has('vmess')).toBe(true);
      expect(supported.has('trojan')).toBe(true);
      expect(supported.has('http')).toBe(true);
      expect(supported.has('socks5')).toBe(true);

      // These should NOT be supported
      expect(supported.has('vless')).toBe(false);
      expect(supported.has('hysteria')).toBe(false);
      expect(supported.has('hysteria2')).toBe(false);
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

    it('should generate complete QuantumultX configuration', () => {
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
      expect(result).toContain('[general]');
      expect(result).toContain('[dns]');
      expect(result).toContain('[server_local]');
      expect(result).toContain('[policy]');
      expect(result).toContain('[filter_remote]');
      expect(result).toContain('[filter_local]');
    });

    it('should include proxy nodes in server_local section', () => {
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

    it('should include policy groups', () => {
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

      expect(result).toContain('[policy]');
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

      expect(result).toContain('shadowsocks');
      expect(result).toContain('ss.example.com');
      expect(result).toContain('8388');
      expect(result).toContain('aes-256-gcm');
    });

    it('should format SSR proxy correctly', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'SSR-Test',
          type: 'ssr',
          server: 'ssr.example.com',
          port: 8388,
          password: 'ssrpassword',
          cipher: 'aes-256-cfb',
          protocol: 'auth_chain_a',
          obfs: 'tls1.2_ticket_auth',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('shadowsocks');
      expect(result).toContain('ssr.example.com');
      expect(result).toContain('ssr-protocol=auth_chain_a');
      expect(result).toContain('obfs=tls1.2_ticket_auth');
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

      expect(result).toContain('vmess');
      expect(result).toContain('vmess.example.com');
      expect(result).toContain('obfs=wss');
      expect(result).toContain('obfs-uri=/path');
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

      expect(result).toContain('trojan');
      expect(result).toContain('trojan.example.com');
      expect(result).toContain('over-tls=true');
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

      expect(result).toContain('http');
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
        } as any,
      ];

      const result = generator.generate(mockProxies);

      expect(result).toContain('socks5');
      expect(result).toContain('socks5.example.com');
      expect(result).toContain('1080');
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

      // VLESS should be filtered out, so no proxy should appear in server_local
      const serverLocalSection = result.match(/\[server_local\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(serverLocalSection).not.toContain('VLESS-Node');
    });

    it('should filter out Hysteria nodes', () => {
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

      const serverLocalSection = result.match(/\[server_local\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(serverLocalSection).not.toContain('Hysteria-Node');
    });

    it('should filter out Hysteria2 nodes', () => {
      const mockProxies: ProxyNode[] = [
        {
          name: 'Hysteria2-Node',
          type: 'hysteria2',
          server: 'hysteria2.example.com',
          port: 8443,
          password: 'pass',
        } as any,
      ];

      const result = generator.generate(mockProxies);

      const serverLocalSection = result.match(/\[server_local\]([\s\S]*?)(?=\[|$)/)?.[1] || '';
      expect(serverLocalSection).not.toContain('Hysteria2-Node');
    });
  });
});
