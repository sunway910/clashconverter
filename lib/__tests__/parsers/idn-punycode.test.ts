/**
 * Tests for IDN hostname handling in proxy link parsing:
 * non-ASCII hostnames must be converted to Punycode automatically.
 * Uses parseProxyLink / parseMultipleProxies - the public entry points
 * where hostname normalization is applied.
 */

import { describe, it, expect } from 'vitest';
import { parseProxyLink, parseMultipleProxies } from '../../parsers/index';
import { base64Encode } from '../../utils';

describe('IDN hostnames in proxy link parsing', () => {
  it('converts IDN host in ss:// link (fully base64 format)', () => {
    const payload = base64Encode('aes-256-gcm:password123@中文.com:8388');
    const parsed = parseProxyLink(`ss://${payload}#中文节点`);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.port).toBe(8388);
  });

  it('converts IDN host in vmess:// link', () => {
    const json = JSON.stringify({
      v: '2',
      ps: 'vmess节点',
      add: '中文.com',
      port: '443',
      id: 'b831381d-6324-4d53-ad4f-8cda48b30811',
      aid: '0',
      scy: 'auto',
      net: 'tcp',
    });
    const parsed = parseProxyLink(`vmess://${base64Encode(json)}`);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.port).toBe(443);
  });

  it('converts percent-encoded IDN host and sni in trojan:// link', () => {
    // WHATWG URL percent-encodes the host of non-special schemes - the parser
    // must recover the IDN hostname and convert it to Punycode
    const parsed = parseProxyLink(
      'trojan://password123@中文.com:443?sni=中文.com&allowInsecure=0#trojan节点'
    );

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.sni).toBe('xn--fiq228c.com');
    expect(config.port).toBe(443);
    expect(parsed!.name).toBe('trojan节点');
  });

  it('converts IDN host and servername in vless:// link', () => {
    const parsed = parseProxyLink(
      'vless://b831381d-6324-4d53-ad4f-8cda48b30811@中文.com:443?type=ws&security=tls&sni=中文.com#vless节点'
    );

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.servername).toBe('xn--fiq228c.com');
  });

  it('converts IDN host and sni in hysteria2:// link', () => {
    const parsed = parseProxyLink(
      'hysteria2://password123@中文.com:443/?insecure=1&sni=中文.com#hy2节点'
    );

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.sni).toBe('xn--fiq228c.com');
    expect(config.port).toBe(443);
  });

  it('converts IDN endpoint in wg:// link', () => {
    const parsed = parseProxyLink('wg://privkey@中文.com:51820?publickey=peerkey#wg节点');

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.server).toBe('xn--fiq228c.com');
    expect(config.port).toBe(51820);
  });

  it('converts IDN hosts through parseMultipleProxies end to end', () => {
    const payload = base64Encode('aes-256-gcm:password123@中文.com:8388');
    const { proxies } = parseMultipleProxies(
      [`ss://${payload}#ss-idn`, 'trojan://password123@日本.jp:443#trojan-idn'].join('\n')
    );

    expect(proxies).toHaveLength(2);
    expect((proxies[0] as any).server).toBe('xn--fiq228c.com');
    expect((proxies[1] as any).server).toBe('xn--wgv71a.jp');
  });
});
