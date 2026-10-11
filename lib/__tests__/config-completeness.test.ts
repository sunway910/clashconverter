/**
 * Round-trip and validation behavior tests for the completed config field set
 */

import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import { parseSS, parseSSR, parseVmess, parseSocks5, parseHysteria2 } from '../parsers/protocol-parsers';
import { ProtocolAdapterRegistry } from '../adapters/protocol-adapter';
import { validateProxyNode, safeValidateProxyNode } from '../types/validators';
import { base64Encode } from '../utils';
import type { VMessProxyNode } from '../types';
import type { ProxyNode } from '../types';

// Auto-initialize format/adapter registries
import '../core/registry';

const UUID = 'b9984674-f771-4e67-a198-c7e60720bac2';

function vmessLink(net: string, extra: Record<string, unknown>): string {
  const json = JSON.stringify({
    v: '2',
    ps: 'vm-ws',
    add: 'example.com',
    port: 443,
    id: UUID,
    aid: 0,
    scy: 'auto',
    net,
    ...extra,
  });
  return `vmess://${base64Encode(json)}`;
}

describe('VMess ws transport round trip', () => {
  it('preserves ws path and Host header through parse -> link -> parse', () => {
    const parsed = parseVmess(vmessLink('ws', { path: '/ray', host: 'cdn.example.com', tls: 'tls' }));
    expect(parsed).toBeTruthy();
    const node = parsed!.config as VMessProxyNode;

    expect(node['ws-opts']).toEqual({ path: '/ray', headers: { Host: 'cdn.example.com' } });
    expect(node.tls).toBe(true);

    const link = ProtocolAdapterRegistry.get('vmess')!.toLink(node);
    const reparsed = parseVmess(link)!;
    expect((reparsed.config as VMessProxyNode)['ws-opts']).toEqual({
      path: '/ray',
      headers: { Host: 'cdn.example.com' },
    });
  });

  it('keeps non-ASCII names and quotes intact (JSON.stringify link body)', () => {
    const node = {
      name: '测试"引号"节点',
      type: 'vmess',
      server: 'example.com',
      port: 443,
      uuid: UUID,
      alterId: 0,
      cipher: 'auto',
      network: 'tcp',
    };
    const link = ProtocolAdapterRegistry.get('vmess')!.toLink(node as unknown as ProxyNode);
    const reparsed = parseVmess(link)!;
    expect(reparsed.config.name).toBe('测试"引号"节点');
  });
});

describe('Hysteria2 obfs / ports', () => {
  it('parses and re-emits obfs, obfs-password and port hopping', () => {
    const link = 'hysteria2://pass@1.2.3.4:443/?obfs=salamander&obfs-password=op&ports=20000-30000&sni=example.com#h2';
    const node = parseHysteria2(link)!.config;

    expect((node as any).obfs).toBe('salamander');
    expect((node as any)['obfs-password']).toBe('op');
    expect((node as any).ports).toBe('20000-30000');

    const link2 = ProtocolAdapterRegistry.get('hysteria2')!.toLink(node);
    expect(link2).toContain('obfs=salamander');
    expect(link2).toContain('obfs-password=op');
    expect(link2).toContain('mport=20000-30000');
  });
});

describe('SS SIP002 plugin', () => {
  it('parses obfs-local plugin parameters from links', () => {
    const link = `ss://${base64Encode('aes-128-gcm:pass')}@example.com:8388/?plugin=${encodeURIComponent('obfs-local;obfs=http;obfs-host=example.com')}#ss-obfs`;
    const node = parseSS(link)!.config;

    expect((node as any).plugin).toBe('obfs');
    expect((node as any)['plugin-opts']).toEqual({ mode: 'http', host: 'example.com' });
  });
});

describe('SOCKS5 tls / udp flags', () => {
  it('parses tls and udp params', () => {
    const node = parseSocks5('socks5://1.2.3.4:1080?tls=1&udp=0#s5')!.config;

    expect((node as any).tls).toBe(true);
    expect((node as any).udp).toBe(false);
  });
});

describe('SSR key normalization', () => {
  it('maps link protoparam/obfsparam to Clash standard keys', () => {
    const plain = `1.2.3.4:443:origin:aes-128-gcm:plain:${base64Encode('pass')}/?protoparam=${base64Encode('p1')}&obfsparam=${base64Encode('o1')}&remarks=${base64Encode('ssr1')}`;
    const node = parseSSR(`ssr://${base64Encode(plain)}`)!.config;

    expect((node as any)['protocol-param']).toBe('p1');
    expect((node as any)['obfs-param']).toBe('o1');
  });

  it('canonicalizes legacy protocolparam keys during validation', () => {
    const node = validateProxyNode({
      name: 'ssr-legacy',
      type: 'ssr',
      server: '1.2.3.4',
      port: 443,
      cipher: 'aes-128-gcm',
      password: 'pass',
      protocol: 'origin',
      obfs: 'plain',
      protocolparam: 'legacy-p',
    });

    expect((node as any)['protocol-param']).toBe('legacy-p');
  });

  it('round-trips standard keys through Clash YAML input', () => {
    const yamlConfig = [
      'proxies:',
      '  - name: ssr-yaml',
      '    type: ssr',
      '    server: 1.2.3.4',
      '    port: 443',
      '    cipher: aes-128-gcm',
      '    password: pass',
      '    protocol: origin',
      '    obfs: plain',
      '    protocol-param: p1',
      '    obfs-param: o1',
    ].join('\n');
    const doc = parse(yamlConfig) as any;
    const validated = safeValidateProxyNode(doc.proxies[0]);

    expect(validated).toBeTruthy();
    expect((validated as any)['protocol-param']).toBe('p1');
  });
});

describe('validators do not inject defaults', () => {
  it('keeps optional vmess fields unset when absent', () => {
    const node = validateProxyNode({
      name: 'v',
      type: 'vmess',
      server: '1.2.3.4',
      port: 443,
      uuid: UUID,
    }) as any;

    expect(node.cipher).toBeUndefined();
    expect(node.network).toBeUndefined();
    expect(node.alterId).toBeUndefined();
    expect(node.udp).toBeUndefined();
  });
});

describe('common Clash fields passthrough', () => {
  it('keeps tfo / ip-version / interface-name through validation and Clash output', () => {
    const node = validateProxyNode({
      name: 'c',
      type: 'ss',
      server: '1.2.3.4',
      port: 8388,
      cipher: 'aes-128-gcm',
      password: 'pass',
      tfo: true,
      'ip-version': 'ipv6',
      'interface-name': 'en0',
    });

    const obj = ProtocolAdapterRegistry.get('ss')!.toClashJson(node);
    expect(obj.tfo).toBe(true);
    expect(obj['ip-version']).toBe('ipv6');
    expect(obj['interface-name']).toBe('en0');
  });
});

describe('hysteria bandwidth normalization', () => {
  it('accepts "100 Mbps" style strings from YAML input', () => {
    const node = validateProxyNode({
      name: 'hy',
      type: 'hysteria',
      server: '1.2.3.4',
      port: 443,
      auth_str: 'auth',
      up: '150 Mbps',
      down: '300 Mbps',
    }) as any;

    expect(node.up).toBe(150);
    expect(node.down).toBe(300);
  });
});
