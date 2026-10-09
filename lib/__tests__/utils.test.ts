/**
 * Tests for hostname Punycode (IDNA) conversion utilities
 */

import { describe, it, expect } from 'vitest';
import { toPunycode, normalizeProxyNodeHostnames } from '../utils';

describe('toPunycode', () => {
  it('converts IDN hostnames to Punycode', () => {
    expect(toPunycode('中文.com')).toBe('xn--fiq228c.com');
    expect(toPunycode('münchen.de')).toBe('xn--mnchen-3ya.de');
    expect(toPunycode('Bücher.example')).toBe('xn--bcher-kva.example');
    expect(toPunycode('test.中国')).toBe('test.xn--fiqs8s');
    expect(toPunycode('例え.jp')).toBe('xn--r8jz45g.jp');
  });

  it('recovers percent-encoded hostnames from non-special URL schemes', () => {
    // WHATWG URL percent-encodes IDN hosts of non-special schemes (trojan:// etc.)
    expect(toPunycode('%E4%B8%AD%E6%96%87.com')).toBe('xn--fiq228c.com');
  });

  it('passes ASCII values through unchanged', () => {
    expect(toPunycode('example.com')).toBe('example.com');
    expect(toPunycode('xn--fiq228c.com')).toBe('xn--fiq228c.com');
    expect(toPunycode('192.168.1.1')).toBe('192.168.1.1');
    expect(toPunycode('[::1]')).toBe('[::1]');
    expect(toPunycode('')).toBe('');
  });

  it('returns the original string when conversion fails', () => {
    // Malformed percent sequence cannot be decoded
    expect(toPunycode('50%off.example')).toBe('50%off.example');
  });
});

describe('normalizeProxyNodeHostnames', () => {
  it('converts server, sni, servername and ws-opts Host', () => {
    const node = {
      name: 'idn',
      type: 'vless',
      server: '中文.com',
      sni: '中文.com',
      servername: '日本.jp',
      'ws-opts': { path: '/', headers: { Host: '中文.com' } },
    };
    const result = normalizeProxyNodeHostnames(node);

    expect(result.server).toBe('xn--fiq228c.com');
    expect(result.sni).toBe('xn--fiq228c.com');
    expect(result.servername).toBe('xn--wgv71a.jp');
    expect((result as any)['ws-opts'].headers.Host).toBe('xn--fiq228c.com');
    // Unrelated fields untouched
    expect(result.name).toBe('idn');
  });

  it('leaves ASCII hostnames and missing fields untouched', () => {
    const node = {
      name: 'plain',
      type: 'ss',
      server: '192.168.1.1',
      port: 8388,
    };
    const result = normalizeProxyNodeHostnames(node);

    expect(result.server).toBe('192.168.1.1');
    expect(result.sni).toBeUndefined();
    expect(result.servername).toBeUndefined();
  });

  it('returns non-object input unchanged', () => {
    expect(normalizeProxyNodeHostnames(null)).toBe(null);
    expect(normalizeProxyNodeHostnames(undefined)).toBe(undefined);
    expect(normalizeProxyNodeHostnames('中文.com')).toBe('中文.com');
  });
});
