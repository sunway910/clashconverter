/**
 * Unit tests for LoonGenerator
 * Tests the formatProxyGroup method and edge cases
 */

import { describe, it, expect } from 'vitest';
import { LoonGenerator } from '../../loon/loon-generator';
import type { LoonProxyGroupConfig } from '../../loon/config/loon-config';
import type { ProxyNode } from '../../types';

// Test helper class to expose protected method for testing
class TestableLoonGenerator extends LoonGenerator {
  public testFormatProxyGroup(group: LoonProxyGroupConfig, proxyNames: string[]): string {
    return this.formatProxyGroup(group, proxyNames);
  }
}

describe('LoonGenerator', () => {
  describe('formatProxyGroup', () => {
    // Create a test generator instance
    const createTestGenerator = () => {
      const generator = new TestableLoonGenerator();
      return generator;
    };

    // Helper to call protected method for testing
    const callFormatProxyGroup = (
      generator: TestableLoonGenerator,
      group: LoonProxyGroupConfig,
      proxyNames: string[]
    ): string => {
      return generator.testFormatProxyGroup(group, proxyNames);
    };

    describe('with useAllProxies=true', () => {
      it('should include all proxy names when group proxies is empty', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: '🇭🇰 香港节点',
          type: 'select',
          proxies: [],
          useAllProxies: true,
        };
        const proxyNames = ['proxy1', 'proxy2', 'proxy3'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('🇭🇰 香港节点 = select,proxy1,proxy2,proxy3');
      });

      it('should merge group proxies with all proxy names', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: '🚀 手动切换',
          type: 'select',
          proxies: ['DIRECT'],
          useAllProxies: true,
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('🚀 手动切换 = select,DIRECT,proxy1,proxy2');
      });

      it('should handle empty proxy names array', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Empty Group',
          type: 'select',
          proxies: [],
          useAllProxies: true,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Empty Group = select');
      });

      it('should preserve order: group proxies first, then all proxies', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test Group',
          type: 'select',
          proxies: ['FIRST', 'SECOND'],
          useAllProxies: true,
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Test Group = select,FIRST,SECOND,proxy1,proxy2');
      });
    });

    describe('with useAllProxies=false', () => {
      it('should only include group proxies', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: '🚀 节点选择',
          type: 'select',
          proxies: ['🇭🇰 香港节点', '🇨🇳 台湾节点', 'DIRECT'],
          useAllProxies: false,
        };
        const proxyNames = ['proxy1', 'proxy2', 'proxy3'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('🚀 节点选择 = select,🇭🇰 香港节点,🇨🇳 台湾节点,DIRECT');
      });

      it('should handle empty group proxies', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Empty Group',
          type: 'select',
          proxies: [],
          useAllProxies: false,
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Empty Group = select');
      });

      it('should ignore proxy names when useAllProxies is false', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Select Group',
          type: 'select',
          proxies: ['DIRECT'],
          useAllProxies: false,
        };
        const proxyNames = ['proxy1', 'proxy2', 'proxy3'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        // Should not include any proxy names from proxyNames array
        expect(result).toBe('Select Group = select,DIRECT');
        expect(result).not.toContain('proxy1');
        expect(result).not.toContain('proxy2');
        expect(result).not.toContain('proxy3');
      });
    });

    describe('with img-url parameter', () => {
      it('should append img-url when useAllProxies=true', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: '🌍 国外媒体',
          type: 'select',
          proxies: ['🚀 节点选择'],
          useAllProxies: true,
          img: 'https://example.com/icon.png',
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe(
          '🌍 国外媒体 = select,🚀 节点选择,proxy1,proxy2,img-url=https://example.com/icon.png'
        );
      });

      it('should append img-url when useAllProxies=false', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: '🎯 全球直连',
          type: 'select',
          proxies: ['DIRECT', '🚀 节点选择'],
          useAllProxies: false,
          img: 'https://example.com/direct.png',
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe(
          '🎯 全球直连 = select,DIRECT,🚀 节点选择,img-url=https://example.com/direct.png'
        );
      });

      it('should append img-url when no proxies', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Icon Only',
          type: 'select',
          proxies: [],
          useAllProxies: false,
          img: 'https://example.com/test.png',
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Icon Only = select,img-url=https://example.com/test.png');
      });

      it('should handle special characters in img-url', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: ['DIRECT'],
          useAllProxies: false,
          img: 'https://cdn.example.com/path/to/icon?v=1&size=64',
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe(
          'Test = select,DIRECT,img-url=https://cdn.example.com/path/to/icon?v=1&size=64'
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty proxy names with useAllProxies=true', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: ['DIRECT'],
          useAllProxies: true,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Test = select,DIRECT');
      });

      it('should handle group proxies with empty strings', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: ['proxy1', '', 'proxy2'],
          useAllProxies: false,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        // Empty strings should be preserved in the list
        expect(result).toBe('Test = select,proxy1,,proxy2');
      });

      it('should handle proxy names with special characters', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: [],
          useAllProxies: true,
        };
        const proxyNames = ['Test Proxy 1', 'Test@Proxy#2', '测试代理'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Test = select,Test Proxy 1,Test@Proxy#2,测试代理');
      });

      it('should handle very long proxy names', () => {
        const generator = createTestGenerator();
        const longName = 'a'.repeat(100);
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: [],
          useAllProxies: true,
        };
        const proxyNames = [longName];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toContain(longName);
        expect(result).toBe(`Test = select,${longName}`);
      });

      it('should handle undefined useAllProxies (defaults to false)', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Test',
          type: 'select',
          proxies: ['DIRECT'],
          // useAllProxies is undefined
        };
        const proxyNames = ['proxy1', 'proxy2'];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        // Should default to false behavior (only group proxies)
        expect(result).toBe('Test = select,DIRECT');
      });

      it('should handle large number of proxies', () => {
        const generator = createTestGenerator();
        const proxyNames = Array.from({ length: 100 }, (_, i) => `proxy${i}`);
        const group: LoonProxyGroupConfig = {
          name: 'Large Group',
          type: 'select',
          proxies: [],
          useAllProxies: true,
        };

        const result = callFormatProxyGroup(generator, group, proxyNames);

        // Should start with name and type
        expect(result.startsWith('Large Group = select,proxy0')).toBe(true);
        // Should include all proxies
        expect(result).toContain('proxy99');
        // Should have correct number of commas (type + 100 proxies = 100 separators)
        const commaCount = (result.match(/,/g) || []).length;
        expect(commaCount).toBe(100);
      });
    });

    describe('different group types', () => {
      it('should handle select type', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Select',
          type: 'select',
          proxies: ['proxy1'],
          useAllProxies: false,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Select = select,proxy1');
      });

      it('should handle url-test type', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'URL Test',
          type: 'url-test',
          proxies: ['proxy1', 'proxy2'],
          url: 'http://www.gstatic.com/generate_204',
          interval: 300,
          useAllProxies: false,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('URL Test = url-test,proxy1,proxy2');
      });

      it('should handle fallback type', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Fallback',
          type: 'fallback',
          proxies: ['proxy1', 'proxy2'],
          url: 'http://www.gstatic.com/generate_204',
          interval: 300,
          useAllProxies: false,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Fallback = fallback,proxy1,proxy2');
      });

      it('should handle load-balance type', () => {
        const generator = createTestGenerator();
        const group: LoonProxyGroupConfig = {
          name: 'Load Balance',
          type: 'load-balance',
          proxies: ['proxy1', 'proxy2', 'proxy3'],
          useAllProxies: false,
        };
        const proxyNames: string[] = [];

        const result = callFormatProxyGroup(generator, group, proxyNames);

        expect(result).toBe('Load Balance = load-balance,proxy1,proxy2,proxy3');
      });
    });
  });

  describe('filterProxies', () => {
    it('should filter out unsupported protocols', () => {
      const generator = new LoonGenerator();
      const proxies: ProxyNode[] = [
        { type: 'ss', name: 'SS Proxy', server: '1.1.1.1', port: 443, cipher: 'aes-256-gcm', password: 'pass' },
        { type: 'ssr', name: 'SSR Proxy', server: '2.2.2.2', port: 443, cipher: 'aes-256-cfb', password: 'pass', protocol: 'origin', obfs: 'plain' },
        { type: 'vmess', name: 'VMess Proxy', server: '3.3.3.3', port: 443, uuid: 'uuid', cipher: 'auto' },
        { type: 'trojan', name: 'Trojan Proxy', server: '4.4.4.4', port: 443, password: 'pass' },
        { type: 'http', name: 'HTTP Proxy', server: '5.5.5.5', port: 80, username: 'user', password: 'pass' },
        { type: 'socks5', name: 'SOCKS5 Proxy', server: '6.6.6.6', port: 1080 },
        { type: 'vless', name: 'VLESS Proxy', server: '7.7.7.7', port: 443, uuid: 'uuid' },
        { type: 'hysteria', name: 'Hysteria Proxy', server: '8.8.8.8', port: 443, auth: 'pass' },
        { type: 'hysteria2', name: 'Hysteria2 Proxy', server: '9.9.9.9', port: 443, password: 'pass' },
      ];

      const filtered = generator.filterProxies(proxies);

      // Should only include SS, SSR, VMess, Trojan
      expect(filtered.length).toBe(4);
      expect(filtered.every(p => ['ss', 'ssr', 'vmess', 'trojan'].includes(p.type))).toBe(true);
      expect(filtered.find(p => p.type === 'http')).toBeUndefined();
      expect(filtered.find(p => p.type === 'socks5')).toBeUndefined();
      expect(filtered.find(p => p.type === 'vless')).toBeUndefined();
      expect(filtered.find(p => p.type === 'hysteria')).toBeUndefined();
      expect(filtered.find(p => p.type === 'hysteria2')).toBeUndefined();
    });

    it('should return empty array when no supported protocols', () => {
      const generator = new LoonGenerator();
      const proxies: ProxyNode[] = [
        { type: 'http', name: 'HTTP Proxy', server: '1.1.1.1', port: 80, username: 'user', password: 'pass' },
        { type: 'socks5', name: 'SOCKS5 Proxy', server: '2.2.2.2', port: 1080 },
      ];

      const filtered = generator.filterProxies(proxies);

      expect(filtered).toEqual([]);
    });

    it('should return all proxies when all are supported', () => {
      const generator = new LoonGenerator();
      const proxies: ProxyNode[] = [
        { type: 'ss', name: 'SS Proxy', server: '1.1.1.1', port: 443, cipher: 'aes-256-gcm', password: 'pass' },
        { type: 'trojan', name: 'Trojan Proxy', server: '2.2.2.2', port: 443, password: 'pass' },
      ];

      const filtered = generator.filterProxies(proxies);

      expect(filtered.length).toBe(2);
    });
  });

  describe('getSupportedProtocols', () => {
    it('should return correct supported protocols', () => {
      const generator = new LoonGenerator();
      const protocols = generator.getSupportedProtocols();

      expect(protocols.has('ss')).toBe(true);
      expect(protocols.has('ssr')).toBe(true);
      expect(protocols.has('vmess')).toBe(true);
      expect(protocols.has('trojan')).toBe(true);
      expect(protocols.has('http')).toBe(false);
      expect(protocols.has('socks5')).toBe(false);
      expect(protocols.has('vless')).toBe(false);
      expect(protocols.has('hysteria')).toBe(false);
      expect(protocols.has('hysteria2')).toBe(false);
    });

    it('should return Set with correct size', () => {
      const generator = new LoonGenerator();
      const protocols = generator.getSupportedProtocols();

      expect(protocols.size).toBe(4);
    });
  });
});
