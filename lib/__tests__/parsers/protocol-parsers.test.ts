/**
 * Tests for newly added protocol parsers (wireguard, anytls, trojan-go enhancements)
 * and sing-box input parsing for wireguard / anytls outbounds
 */

import { describe, it, expect } from 'vitest';
import { parseWireguard, parseAnytls, parseTrojan } from '../../parsers/protocol-parsers';
import { parseSingBoxToProxies } from '../../singbox/parser';

describe('WireGuard parser', () => {
  it('parses a full wireguard:// link', () => {
    const link =
      'wireguard://a3plbXFxZ3JvdW5kLWNvbmZpZy1rZXk=@vpn.example.com:5443?publickey=abc123&address=10.7.0.2%2F32&mtu=1420#My%20WG%20Node';
    const parsed = parseWireguard(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.type).toBe('wireguard');
    expect(config.server).toBe('vpn.example.com');
    expect(config.port).toBe(5443);
    expect(config['private-key']).toBe('a3plbXFxZ3JvdW5kLWNvbmZpZy1rZXk=');
    expect(config['public-key']).toBe('abc123');
    expect(config.ip).toBe('10.7.0.2');
    expect(config.mtu).toBe(1420);
    expect(parsed!.name).toBe('My WG Node');
  });

  it('parses wg:// shorthand with underscore aliases and reserved', () => {
    const link =
      'wg://privkey@peer.example.org?public_key=peerkey&pre_shared_key=psk123&address=10.7.0.2/32,fd42:42:42::1/128&allowed_ips=0.0.0.0/0,::/0&reserved=1,2,3&remote_dns_resolve=1&dns=1.1.1.1,8.8.8.8#WG-Alias';
    const parsed = parseWireguard(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.type).toBe('wireguard');
    expect(config['public-key']).toBe('peerkey');
    expect(config['pre-shared-key']).toBe('psk123');
    expect(config.ip).toBe('10.7.0.2');
    expect(config.ipv6).toBe('fd42:42:42::1');
    expect(config['allowed-ips']).toEqual(['0.0.0.0/0', '::/0']);
    expect(config.reserved).toEqual([1, 2, 3]);
    expect(config['remote-dns-resolve']).toBe(true);
    expect(config.dns).toEqual(['1.1.1.1', '8.8.8.8']);
    expect(parsed!.name).toBe('WG-Alias');
  });

  it('defaults port to 51820 when missing', () => {
    const parsed = parseWireguard('wg://k@s.example.com?publickey=pk1');

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.port).toBe(51820);
  });

  it('rejects links without private key or public key', () => {
    // No @userinfo means no private key
    expect(parseWireguard('wg://s.example.com:51820?publickey=pk1')).toBeNull();
    // Missing publickey param
    expect(parseWireguard('wg://k@s.example.com:51820')).toBeNull();
  });
});

describe('AnyTLS parser', () => {
  it('parses anytls:// link with all params', () => {
    const link =
      'anytls://pass%40word@any.example.com:8443?sni=example.com&alpn=h2%2Ch3&fp=chrome&allowInsecure=1&udp=1&min-idle-session=3#ATL-Node';
    const parsed = parseAnytls(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.type).toBe('anytls');
    expect(config.server).toBe('any.example.com');
    expect(config.port).toBe(8443);
    expect(config.password).toBe('pass@word');
    expect(config.sni).toBe('example.com');
    expect(config.alpn).toEqual(['h2', 'h3']);
    expect(config['client-fingerprint']).toBe('chrome');
    expect(config['skip-cert-verify']).toBe(true);
    expect(config.udp).toBe(true);
    expect(config['min-idle-session']).toBe(3);
    expect(parsed!.name).toBe('ATL-Node');
  });

  it('defaults port to 443 and maps fingerprint aliases', () => {
    const parsed = parseAnytls('anytls://pass@any.example.com?fingerprint=firefox');

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.port).toBe(443);
    expect(config['client-fingerprint']).toBe('firefox');
  });

  it('rejects links without password userinfo', () => {
    expect(parseAnytls('anytls://any.example.com:443')).toBeNull();
  });
});

describe('Trojan-Go parser enhancements', () => {
  it('parses trojan ws link into ws-opts', () => {
    const link =
      'trojan://pass@ws.example.com:443?type=ws&path=%2Fws&host=cdn.example.com&sni=ws.example.com#Trojan-WS';
    const parsed = parseTrojan(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.network).toBe('ws');
    expect(config['ws-opts']).toEqual({
      path: '/ws',
      headers: { Host: 'cdn.example.com' },
    });
  });

  it('parses trojan-go encryption=ss into ss-opts', () => {
    const link =
      'trojan://pass@tg.example.com:443?encryption=ss%3Baes-128-gcm%3Bsspass&type=ws&path=%2Fws#TrojanGo';
    const parsed = parseTrojan(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config['ss-opts']).toEqual({
      enabled: true,
      method: 'aes-128-gcm',
      password: 'sspass',
    });
  });

  it('parses grpc link with alpn and fingerprint', () => {
    const link = 'trojan://pass@g.example.com:443?type=grpc&serviceName=ts&alpn=h2&fp=safari#Trojan-GRPC';
    const parsed = parseTrojan(link);

    expect(parsed).toBeTruthy();
    const config = parsed!.config as any;
    expect(config.network).toBe('grpc');
    expect(config['grpc-opts']).toEqual({ 'grpc-service-name': 'ts' });
    expect(config.alpn).toEqual(['h2']);
    expect(config['client-fingerprint']).toBe('safari');
  });
});

describe('Sing-Box input parsing (wireguard / anytls outbounds)', () => {
  it('converts wireguard outbound to ProxyNode', () => {
    const json = JSON.stringify({
      outbounds: [
        {
          type: 'wireguard',
          tag: 'wg-out',
          server: 'vpn.example.com',
          server_port: 51820,
          local_address: ['10.7.0.2/32', 'fd42:42:42::1/128'],
          private_key: 'priv',
          peer_public_key: 'pub',
          pre_shared_key: 'psk',
          reserved: [2, 3, 4],
          mtu: 1420,
        },
      ],
    });
    const { proxies } = parseSingBoxToProxies(json);

    expect(proxies.length).toBe(1);
    const node = proxies[0] as any;
    expect(node.type).toBe('wireguard');
    expect(node.ip).toBe('10.7.0.2');
    expect(node.ipv6).toBe('fd42:42:42::1');
    expect(node['private-key']).toBe('priv');
    expect(node['public-key']).toBe('pub');
    expect(node['pre-shared-key']).toBe('psk');
    expect(node.reserved).toEqual([2, 3, 4]);
    expect(node.mtu).toBe(1420);
  });

  it('converts anytls outbound to ProxyNode', () => {
    const json = JSON.stringify({
      outbounds: [
        {
          type: 'anytls',
          tag: 'at-out',
          server: 'any.example.com',
          server_port: 8443,
          password: 'secret',
          tls: {
            enabled: true,
            server_name: 'any.example.com',
            insecure: true,
            alpn: ['h2', 'h3'],
          },
        },
      ],
    });
    const { proxies } = parseSingBoxToProxies(json);

    expect(proxies.length).toBe(1);
    const node = proxies[0] as any;
    expect(node.type).toBe('anytls');
    expect(node.password).toBe('secret');
    expect(node.sni).toBe('any.example.com');
    expect(node['skip-cert-verify']).toBe(true);
    expect(node.alpn).toEqual(['h2', 'h3']);
  });
});
