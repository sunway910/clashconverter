/**
 * Integration tests for newly supported protocols: WireGuard, AnyTLS, Trojan (Trojan-Go)
 * Tests the complete flow: proxy links -> Clash Meta / Clash Premium / Sing-Box / links
 */

import { describe, it, expect } from 'vitest';
import { FormatFactory } from '@/lib/core/factory';

// Import registry to auto-initialize all formats
import '@/lib/core/registry';

const TEST_LINKS = [
  'wireguard://privkey123@wg.example.com:51820?publickey=pubkey123&address=10.7.0.2%2F32&mtu=1420&reserved=1%2C2%2C3#WG-Node',
  'anytls://pass@at.example.com:8443?sni=at.example.com&fp=chrome&allowInsecure=1#AnyTLS-Node',
  'trojan://pass@tj.example.com:443?type=ws&path=%2Fws&host=cdn.example.com#Trojan-WS-Node',
].join('\n');

describe('[Integration] WireGuard / AnyTLS / Trojan protocols', () => {
  const parser = FormatFactory.createParser('txt');
  const parsed = parser.parse(TEST_LINKS);

  it('parses all three protocol links', () => {
    expect(parsed.proxies).toHaveLength(3);
    expect(parsed.unsupported).toHaveLength(0);
    expect(parsed.proxies.map(p => p.type)).toEqual(['wireguard', 'anytls', 'trojan']);
  });

  it('generates Clash Meta YAML with full wireguard/anytls/trojan fields', () => {
    const generator = FormatFactory.createGenerator('clash-meta');
    const output = generator.generate(parsed.proxies);

    expect(output).toContain('"type":"wireguard"');
    expect(output).toContain('"private-key":"privkey123"');
    expect(output).toContain('"public-key":"pubkey123"');
    expect(output).toContain('"ip":"10.7.0.2"');
    expect(output).toContain('"reserved":[1,2,3]');
    expect(output).toContain('"type":"anytls"');
    expect(output).toContain('"password":"pass"');
    expect(output).toContain('"sni":"at.example.com"');
    expect(output).toContain('"client-fingerprint":"chrome"');
    expect(output).toContain('"network":"ws"');
    expect(output).toContain('"ws-opts"');
  });

  it('filters anytls but keeps wireguard for Clash Premium', () => {
    const generator = FormatFactory.createGenerator('clash-premium');
    const output = generator.generate(parsed.proxies);

    expect(output).toContain('"type":"wireguard"');
    expect(output).not.toContain('"type":"anytls"');
  });

  it('generates Sing-Box outbounds for all three protocols', () => {
    const generator = FormatFactory.createGenerator('sing-box');
    const config = JSON.parse(generator.generate(parsed.proxies));

    const outbounds = config.outbounds as Array<Record<string, any>>;
    const wg = outbounds.find(o => o.type === 'wireguard');
    const at = outbounds.find(o => o.type === 'anytls');
    const tj = outbounds.find(o => o.type === 'trojan');

    expect(wg).toBeDefined();
    expect(wg.private_key).toBe('privkey123');
    expect(wg.peer_public_key).toBe('pubkey123');
    expect(wg.local_address).toContain('10.7.0.2');
    expect(wg.reserved).toEqual([1, 2, 3]);

    expect(at).toBeDefined();
    expect(at.password).toBe('pass');
    expect(at.tls.server_name).toBe('at.example.com');
    expect(at.tls.insecure).toBe(true);

    expect(tj).toBeDefined();
    expect(tj.transport).toEqual({ type: 'ws', path: '/ws', headers: { Host: 'cdn.example.com' } });
  });

  it('round-trips back to proxy links', () => {
    const txtGenerator = FormatFactory.createGenerator('txt');
    const links = txtGenerator.generate(parsed.proxies);

    const reparsed = FormatFactory.createParser('txt').parse(links);
    expect(reparsed.proxies).toHaveLength(3);

    const byType = Object.fromEntries(reparsed.proxies.map(p => [p.type, p as any]));
    expect(byType.wireguard.server).toBe('wg.example.com');
    expect(byType.wireguard['public-key']).toBe('pubkey123');
    expect(byType.anytls.server).toBe('at.example.com');
    expect(byType.trojan.network).toBe('ws');
  });
});
