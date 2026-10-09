/**
 * Integration tests for IDN hostname conversion:
 * non-ASCII hostnames in any input format must be converted to Punycode
 */

import { describe, it, expect } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

describe('[Integration] IDN Punycode Conversion', () => {
  it('converts IDN host from proxy links through Clash Meta output', () => {
    const input = [
      'trojan://password123@中文.com:443?sni=中文.com&allowInsecure=0#trojan-idn',
      'hysteria2://password123@日本.jp:443/?insecure=1&sni=日本.jp#hy2-idn',
    ].join('\n');

    const parseResult = FormatFactory.createParser('txt').parse(input);
    expect(parseResult.proxies).toHaveLength(2);
    expect((parseResult.proxies[0] as any).server).toBe('xn--fiq228c.com');
    expect((parseResult.proxies[1] as any).server).toBe('xn--wgv71a.jp');

    const output = FormatFactory.createGenerator('clash-meta').generate(parseResult.proxies);
    expect(output).toContain('"server":"xn--fiq228c.com"');
    expect(output).toContain('"server":"xn--wgv71a.jp"');
  });

  it('keeps Clash YAML nodes with IDN servers (previously dropped by validation)', () => {
    const yaml = [
      'proxies:',
      '  - name: "中文节点"',
      '    type: ss',
      '    server: 中文.com',
      '    port: 8388',
      '    cipher: aes-256-gcm',
      '    password: "pass123"',
    ].join('\n');

    const parseResult = FormatFactory.createParser('clash-meta').parse(yaml);
    expect(parseResult.proxies).toHaveLength(1);
    expect((parseResult.proxies[0] as any).server).toBe('xn--fiq228c.com');
  });

  it('converts IDN host from Sing-Box JSON input', () => {
    const input = JSON.stringify({
      outbounds: [
        {
          type: 'shadowsocks',
          tag: 'idn-node',
          server: '中文.com',
          server_port: 8388,
          method: 'aes-128-gcm',
          password: 'pass123',
        },
      ],
    });

    const parseResult = FormatFactory.createParser('sing-box').parse(input);
    expect(parseResult.proxies).toHaveLength(1);
    expect((parseResult.proxies[0] as any).server).toBe('xn--fiq228c.com');
  });
});
