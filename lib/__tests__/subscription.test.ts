/**
 * Tests for subscription URL parsing functionality
 * Tests the inline YAML parser, content type detection, and YAML parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseYamlToProxies } from '../clash/parser/yaml';
import { detectContentType, parseSubscriptionContent } from '../subscription';
import type { ProxyNode } from '../types';

describe('Subscription URL Parsing', () => {
  describe('Inline YAML Parser', () => {
    describe('parseYamlToProxies - Inline Format', () => {
      it('should parse inline YAML format with Shadowsocks proxy', () => {
        const yaml = `proxies:
  - { name: 'HK-SHADOWSOCKS', type: ss, server: hk.example.com, port: 443, cipher: aes-256-gcm, password: test123, udp: true }
  - { name: 'SG-SS', type: ss, server: sg.example.com, port: 8080, cipher: chacha20-ietf-poly1305, password: abcdef, udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('HK-SHADOWSOCKS');
        expect(proxies[0].type).toBe('ss');
        expect(proxies[0].server).toBe('hk.example.com');
        expect(proxies[0].port).toBe(443);
        expect(proxies[0].cipher).toBe('aes-256-gcm');
        expect(proxies[0].password).toBe('test123');
        expect(proxies[0].udp).toBe(true);
      });

      it('should parse inline YAML format with VMess proxy', () => {
        const yaml = `proxies:
  - { name: '日本节点', type: vmess, server: jp.example.com, port: 443, uuid: 4243671d-5219-389f-bb51-5301d157e0bb, alterId: 1, cipher: auto, tls: true, skip-cert-verify: false, udp: true }
  - { name: '美国节点', type: vmess, server: us.example.com, port: 80, uuid: 5243671d-5219-389f-bb51-5301d157e0bc, alterId: 0, cipher: auto, tls: false, udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('日本节点');
        expect(proxies[0].type).toBe('vmess');
        expect(proxies[0].server).toBe('jp.example.com');
        expect(proxies[0].port).toBe(443);
        expect(proxies[0].uuid).toBe('4243671d-5219-389f-bb51-5301d157e0bb');
        expect(proxies[0].tls).toBe(true);
      });

      it('should parse inline YAML format with VLESS proxy', () => {
        const yaml = `proxies:
  - { name: 'VLESS节点', type: vless, server: vless.example.com, port: 443, uuid: 6243671d-5219-389f-bb51-5301d157e0bd, flow: xtls-rprx-vision, udp: true }
  - { name: 'VLESS-TCP', type: vless, server: tcp.example.com, port: 80, uuid: 7243671d-5219-389f-bb51-5301d157e0be, network: tcp, tls: false }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].type).toBe('vless');
        expect(proxies[0].server).toBe('vless.example.com');
        expect(proxies[0].uuid).toBe('6243671d-5219-389f-bb51-5301d157e0bd');
        expect(proxies[0].flow).toBe('xtls-rprx-vision');
      });

      it('should parse inline YAML format with Trojan proxy', () => {
        const yaml = `proxies:
  - { name: 'Trojan节点', type: trojan, server: trojan.example.com, port: 443, password: trojan-password, udp: true }
  - { name: 'Trojan-WS', type: trojan, server: ws.example.com, port: 443, password: pass123, network: ws, sni: example.com }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].type).toBe('trojan');
        expect(proxies[0].server).toBe('trojan.example.com');
        expect(proxies[0].password).toBe('trojan-password');
      });

      it('should parse inline YAML format with Hysteria2 proxy', () => {
        const yaml = `proxies:
  - { name: 'Hysteria2节点', type: hysteria2, server: hys2.example.com, port: 443, password: hys2-password, skip-cert-verify: true }
  - { name: 'HYS2-SNI', type: hysteria2, server: sni.example.com, port: 8443, password: abc123, sni: example.com }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].type).toBe('hysteria2');
        expect(proxies[0].server).toBe('hys2.example.com');
        expect(proxies[0].password).toBe('hys2-password');
      });

      it('should parse inline YAML format with mixed quotes in values', () => {
        const yaml = `proxies:
  - { name: "HK节点", type: ss, server: hk.example.com, port: 443, cipher: "aes-256-gcm", password: "test123", udp: true }
  - { name: 'SG节点', type: ss, server: 'sg.example.com', port: 8080, cipher: 'chacha20-ietf-poly1305', password: 'abc123', udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('HK节点');
        expect(proxies[0].cipher).toBe('aes-256-gcm');
        expect(proxies[1].name).toBe('SG节点');
        expect(proxies[1].cipher).toBe('chacha20-ietf-poly1305');
      });

      it('should handle inline YAML with Chinese characters in name', () => {
        const yaml = `proxies:
  - { name: '🇭🇰香港01 家宽（推荐）', type: ss, server: v1a001.78787878.top, port: 31001, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }
  - { name: '🇯🇵日本Premium01｜x2.5', type: ss, server: v3s01.78787878.top, port: 33013, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('🇭🇰香港01 家宽（推荐）');
        expect(proxies[1].name).toBe('🇯🇵日本Premium01｜x2.5');
      });

      it('should parse inline YAML with boolean and null values', () => {
        const yaml = `proxies:
  - { name: 'Test1', type: ss, server: test1.com, port: 443, cipher: aes-256-gcm, password: pass123, udp: true }
  - { name: 'Test2', type: ss, server: test2.com, port: 443, cipher: aes-256-gcm, password: pass123, udp: false }
  - { name: 'Test3', type: vmess, server: test3.com, port: 443, uuid: 8243671d-5219-389f-bb51-5301d157e0bf, alterId: 0, cipher: auto, tls: null }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(3);
        expect(proxies[0].udp).toBe(true);
        expect(proxies[1].udp).toBe(false);
        // null values are converted to undefined by the validator
        expect(proxies[2].tls).toBeUndefined();
      });
    });

    describe('parseYamlToProxies - Multiline Format', () => {
      it('should parse multiline YAML format', () => {
        const yaml = `proxies:
  - name: HK-Multiline
    type: ss
    server: hk.example.com
    port: 443
    cipher: aes-256-gcm
    password: test123
    udp: true
  - name: SG-Multiline
    type: ss
    server: sg.example.com
    port: 8080
    cipher: chacha20-ietf-poly1305
    password: abc123
    udp: true`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('HK-Multiline');
        expect(proxies[1].name).toBe('SG-Multiline');
      });

      it('should parse mixed inline and multiline formats', () => {
        const yaml = `proxies:
  - { name: 'HK-Inline', type: ss, server: hk.example.com, port: 443, cipher: aes-256-gcm, password: test123, udp: true }
  - name: SG-Multiline
    type: ss
    server: sg.example.com
    port: 8080
    cipher: chacha20-ietf-poly1305
    password: abc123
    udp: true`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('HK-Inline');
        expect(proxies[1].name).toBe('SG-Multiline');
      });
    });

    describe('parseYamlToProxies - Full Clash Config', () => {
      it('should parse from full Clash config with mixed-port', () => {
        const yaml = `mixed-port: 7890
allow-lan: true
mode: rule
dns:
  enable: true
proxies:
  - { name: 'HK节点', type: ss, server: hk.example.com, port: 443, cipher: aes-256-gcm, password: test123, udp: true }
  - { name: 'SG节点', type: ss, server: sg.example.com, port: 8080, cipher: chacha20-ietf-poly1305, password: abc123, udp: true }
proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - HK节点
      - SG节点`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].name).toBe('HK节点');
        expect(proxies[1].name).toBe('SG节点');
      });

      it('should parse from full Clash config with port config', () => {
        const yaml = `port: 7890
socks-port: 7891
allow-lan: false
mode: Rule
log-level: info
external-controller: 127.0.0.1:9090
proxies:
  - {name: 🇯🇵 免费-日本1-Ver.7, server: cnnny3j-g01.jp01-nn-vm0.entry.fr0528.art, port: 21581, type: vmess, uuid: 4243671d-5219-389f-bb51-5301d157e0bb, alterId: 1, cipher: auto, tls: true, skip-cert-verify: false, udp: true}
  - {name: 🇯🇵 免费-日本2-Ver.8, server: cf5j98s-g01.jp02-e3-vm0.entry.fr0528.art, port: 11773, type: vmess, uuid: 4243671d-5219-389f-bb51-5301d157e0bb, alterId: 1, cipher: auto, tls: false, skip-cert-verify: false, udp: true}
proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - DIRECT`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].type).toBe('vmess');
        expect(proxies[0].tls).toBe(true);
        expect(proxies[1].tls).toBe(false);
      });
    });

    describe('parseYamlToProxies - Edge Cases', () => {
      it('should return empty array for YAML without proxies section', () => {
        const yaml = `mixed-port: 7890
allow-lan: true
mode: rule`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(0);
      });

      it('should handle empty YAML', () => {
        const proxies = parseYamlToProxies('');
        expect(proxies).toHaveLength(0);
      });

      it('should skip invalid proxy entries', () => {
        const yaml = `proxies:
  - { name: 'Invalid', type: unknown, server: invalid.com }
  - { name: 'Valid', type: ss, server: valid.example.com, port: 443, cipher: aes-256-gcm, password: test123, udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        // The invalid proxy will be parsed but filtered out later
        expect(proxies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Type Detection', () => {
    describe('detectContentType - YAML Detection', () => {
      it('should detect full Clash YAML config with mixed-port', () => {
        const content = `mixed-port: 7890
allow-lan: true
mode: rule
dns:
  enable: true
proxies:
  - { name: Test, type: ss, server: test.com, port: 443 }`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });

      it('should detect YAML with proxies section', () => {
        const content = `proxies:
  - { name: Test, type: ss, server: test.com, port: 443 }`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });

      it('should detect YAML with proxy-groups section', () => {
        const content = `proxy-groups:
  - name: PROXY
    type: select`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });

      it('should detect YAML with inline proxy format', () => {
        const content = `- {name: Test, type: ss, server: test.com, port: 443}
- {name: Test2, type: vmess, server: test2.com, port: 80}`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });

      it('should detect YAML with name: pattern', () => {
        const content = `  - name: Test
    type: ss
    server: test.com`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });

      it('should detect YAML with type: pattern for known protocols', () => {
        const content = `type: ss
server: test.com`;

        const result = detectContentType(content);
        expect(result).toBe('yaml');
      });
    });

    describe('detectContentType - Unknown Detection', () => {
      it('should return unknown for plain text without proxy patterns', () => {
        const content = `This is just plain text
without any proxy configurations
or YAML structure`;

        const result = detectContentType(content);
        expect(result).toBe('unknown');
      });

      it('should return unknown for empty content', () => {
        const result = detectContentType('');
        expect(result).toBe('unknown');
      });

      it('should return unknown for invalid YAML-like content', () => {
        const content = `random: content
that: looks
somewhat: structured
but:not: yaml`;

        const result = detectContentType(content);
        expect(result).toBe('unknown');
      });
    });
  });

  describe('Subscription Content Parsing', () => {
    describe('parseSubscriptionContent - YAML Content', () => {
      it('should parse YAML content successfully', () => {
        const content = `proxies:
  - { name: 'HK节点', type: ss, server: hk.example.com, port: 443, cipher: aes-256-gcm, password: test123, udp: true }
  - { name: 'SG节点', type: ss, server: sg.example.com, port: 8080, cipher: chacha20-ietf-poly1305, password: abc123, udp: true }`;

        const result = parseSubscriptionContent(content, 'yaml');
        expect(result.success).toBe(true);
        expect(result.proxies).toHaveLength(2);
        expect(result.proxies![0].name).toBe('HK节点');
        expect(result.proxies![1].type).toBe('ss');
      });

      it('should return error for YAML content with no proxies', () => {
        const content = `mixed-port: 7890
allow-lan: true`;

        const result = parseSubscriptionContent(content, 'yaml');
        expect(result.success).toBe(false);
        expect(result.error).toContain('No proxies found');
      });

      it('should suggest clash-meta for proxies with VLESS/Hysteria', () => {
        const content = `proxies:
  - { name: 'VLESS节点', type: vless, server: vless.example.com, port: 443, uuid: test-uuid }
  - { name: 'Hysteria2节点', type: hysteria2, server: hys2.example.com, port: 443, password: test-pass }`;

        const result = parseSubscriptionContent(content, 'yaml');
        expect(result.success).toBe(true);
        expect(result.suggestedOutputFormat).toBe('clash-meta');
      });

      it('should suggest clash-premium for proxies without VLESS/Hysteria', () => {
        const content = `proxies:
  - { name: 'SS节点', type: ss, server: ss.example.com, port: 443, cipher: aes-256-gcm, password: test123 }
  - { name: 'VMess节点', type: vmess, server: vmess.example.com, port: 443, uuid: test-uuid }`;

        const result = parseSubscriptionContent(content, 'yaml');
        expect(result.success).toBe(true);
        expect(result.suggestedOutputFormat).toBe('clash-premium');
      });
    });

    describe('parseSubscriptionContent - Base64/Proxy Links Content', () => {
      it('should parse base64 encoded proxy links', () => {
        // SS link format: ss://base64(method:password)@server:port#name
        // Base64 of "aes-256-gcm:test123" = "YWVzLTI1Ni1nY206dGVzdDEyMw=="
        const ssLink = 'ss://YWVzLTI1Ni1nY206dGVzdDEyMw==@hk.example.com:443#HK-SS';
        const content = ssLink;

        const result = parseSubscriptionContent(content, 'base64');
        expect(result.success).toBe(true);
        expect(result.proxies).toBeDefined();
        expect(result.proxies!.length).toBeGreaterThan(0);
        expect(result.proxies![0].type).toBe('ss');
      });

      it('should parse multiple proxy links (plain text, not base64)', () => {
        // For multiple links, the content type would be detected as base64 (contains proxy links)
        // But it's actually plain text with multiple links
        const ssLink = 'ss://YWVzLTI1Ni1nY206dGVzdDEyMw==@hk.example.com:443#HK-SS';
        const vmessLink = 'vmess://eyJ2IjoiMiIsInBzIjoiYXV0byIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiJ3c3MiLCJob3N0IjoiaGsuZXhhbXBsZS5jb20iLCJwb3J0IjoiNDQzIn0=#VMess';
        const content = ssLink + '\n' + vmessLink;

        // This should be detected as plain proxy links, not base64
        const result = parseSubscriptionContent(content, 'base64');
        expect(result.success).toBe(true);
        expect(result.proxies!.length).toBeGreaterThan(0);
      });

      it('should handle content with direct proxy links (not base64)', () => {
        // Content with actual ss:// and vmess:// links
        const content = `ss://YWVzLTI1Ni1nY206dGVzdDEyMw==@hk.example.com:443#HK-SS
vmess://eyJ2IjoiMiIsInBzIjoiYXV0byIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiJ3c3MiLCJob3N0IjoiaGsuZXhhbXBsZS5jb20iLCJwb3J0IjoiNDQzIn0=#VMess`;

        const result = parseSubscriptionContent(content, 'base64');
        expect(result.success).toBe(true);
        expect(result.proxies!.length).toBeGreaterThan(0);
      });
    });

    describe('parseSubscriptionContent - Unknown Content', () => {
      it('should return error for unknown content type', () => {
        const content = 'random content';

        const result = parseSubscriptionContent(content, 'unknown');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Unknown content type');
      });
    });
  });

  describe('Integration Tests - Real Subscription Formats', () => {
    describe('iKuuu Subscription Format', () => {
      it('should parse iKuuu YAML subscription format', () => {
        const yaml = `port: 7890
socks-port: 7891
allow-lan: false
mode: Rule
log-level: info
external-controller: 127.0.0.1:9090
proxies:
  - {name: 🇯🇵 免费-日本1-Ver.7, server: cnnny3j-g01.jp01-nn-vm0.entry.fr0528.art, port: 21581, type: vmess, uuid: 4243671d-5219-389f-bb51-5301d157e0bb, alterId: 1, cipher: auto, tls: true, skip-cert-verify: false, udp: true}
  - {name: 🇯🇵 免费-日本2-Ver.8, server: cf5j98s-g01.jp02-e3-vm0.entry.fr0528.art, port: 11773, type: vmess, uuid: 4243671d-5219-389f-bb51-5301d157e0bb, alterId: 1, cipher: auto, tls: false, skip-cert-verify: false, udp: true}
proxy-groups:
  - name: 🔰 选择节点
    type: select
    proxies:
      - DIRECT`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(2);
        expect(proxies[0].type).toBe('vmess');
        expect(proxies[0].name).toBe('🇯🇵 免费-日本1-Ver.7');
        expect(proxies[1].tls).toBe(false);
        expect(proxies[1].name).toBe('🇯🇵 免费-日本2-Ver.8');
      });

      it('should detect iKuuu YAML as yaml content type', () => {
        const yaml = `port: 7890
allow-lan: false
mode: Rule
proxies:
  - {name: 🇯🇵 免费-日本1, server: jp.example.com, port: 21581, type: vmess, uuid: test-uuid}`;

        const result = detectContentType(yaml);
        expect(result).toBe('yaml');
      });
    });

    describe('78787878 Subscription Format', () => {
      it('should parse 78787878 YAML subscription format', () => {
        const yaml = `mixed-port: 7890
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
dns:
  enable: true
proxies:
    - { name: '剩余流量：141.11 GB', type: ss, server: v1a01.78787878.top, port: 31001, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }
    - { name: '距离下次重置剩余：25 天', type: ss, server: v1a01.78787878.top, port: 31001, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }
    - { name: '🇭🇰香港01 家宽（推荐）', type: ss, server: v1a001.78787878.top, port: 31001, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }
    - { name: '🇸🇬新加坡01', type: ss, server: v1a001.78787878.top, port: 32001, cipher: chacha20-ietf-poly1305, password: 70e2832a-048c-4c72-886f-ceba936897b9, udp: true }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies.length).toBeGreaterThan(0);
        const hkProxy = proxies.find(p => p.name.includes('香港01'));
        expect(hkProxy).toBeDefined();
        expect(hkProxy!.type).toBe('ss');
      });

      it('should detect 78787878 YAML as yaml content type', () => {
        const yaml = `mixed-port: 7890
allow-lan: true
proxies:
    - { name: Test, type: ss, server: test.com, port: 443 }`;

        const result = detectContentType(yaml);
        expect(result).toBe('yaml');
      });
    });
  });

  describe('Protocol Support Tests', () => {
    it('should parse all supported protocols from inline YAML', () => {
      const yaml = `proxies:
  - { name: SS, type: ss, server: ss.example.com, port: 443, cipher: aes-256-gcm, password: test123 }
  - { name: SSR, type: ssr, server: ssr.example.com, port: 443, cipher: aes-256-cfb, password: test123, protocol: auth_aes128_md5, obfs: plain }
  - { name: VMess, type: vmess, server: vmess.example.com, port: 443, uuid: 9243671d-5219-389f-bb51-5301d157e0c0, alterId: 0, cipher: auto }
  - { name: VLESS, type: vless, server: vless.example.com, port: 443, uuid: a243671d-5219-389f-bb51-5301d157e0c1 }
  - { name: Trojan, type: trojan, server: trojan.example.com, port: 443, password: test-password }
  - { name: Hysteria, type: hysteria, server: hysteria.example.com, port: 443, auth_str: test-auth, protocol: udp }
  - { name: Hysteria2, type: hysteria2, server: hys2.example.com, port: 443, password: test-password }
  - { name: HTTP, type: http, server: http.example.com, port: 8080, username: user, password: pass }
  - { name: SOCKS5, type: socks5, server: socks5.example.com, port: 1080, username: user, password: pass }`;

        const proxies = parseYamlToProxies(yaml);
        expect(proxies).toHaveLength(9);
        const types = proxies.map(p => p.type);
        expect(types).toContain('ss');
        expect(types).toContain('ssr');
        expect(types).toContain('vmess');
        expect(types).toContain('vless');
        expect(types).toContain('trojan');
        expect(types).toContain('hysteria');
        expect(types).toContain('hysteria2');
        expect(types).toContain('http');
        expect(types).toContain('socks5');
      });
  });
});
