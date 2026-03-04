/**
 * Sing-Box Generator Unit Tests
 * Tests for lib/singbox/generator.ts
 */

import '../../core/registry'; // Initialize protocol adapters
import { generateSingBoxConfig, generateDnsConfig, generateInbounds, generateOutbounds, generateRouteRules, generateRuleSets, generateExperimental } from '../generator';
import type { ProxyNode } from '../../types';

describe('generateSingBoxConfig', () => {
  const mockProxies: ProxyNode[] = [
    {
      tag: 'test-proxy',
      type: 'ss',
      server: 'example.com',
      server_port: 8388,
      method: 'chacha20-ietf-poly1305',
      password: 'test-password'
    }
  ];

  it('generates valid JSON structure', () => {
    const result = generateSingBoxConfig(mockProxies);
    const config = JSON.parse(result);

    expect(config).toHaveProperty('dns');
    expect(config).toHaveProperty('experimental');
    expect(config).toHaveProperty('inbounds');
    expect(config).toHaveProperty('outbounds');
    expect(config).toHaveProperty('route');
  });

  it('handles empty proxy array', () => {
    const result = generateSingBoxConfig([]);
    expect(result).toContain('error');
  });
});

describe('generateDnsConfig', () => {
  it('returns correct DNS servers structure with remote/local/block tags', () => {
    const dns = generateDnsConfig();

    expect(dns.servers).toHaveLength(3);
    expect(dns.servers[0]).toMatchObject({
      tag: 'remote',
      address: '1.1.1.1',
      detour: '节点选择'
    });
    expect(dns.servers[1]).toMatchObject({
      tag: 'local',
      address: 'https://223.5.5.5/dns-query',
      detour: 'direct'
    });
    expect(dns.servers[2]).toMatchObject({
      tag: 'block',
      address: 'rcode://refused'
    });
  });

  it('includes final and disable_cache settings', () => {
    const dns = generateDnsConfig();

    expect(dns.final).toBe('remote');
    expect(dns.disable_cache).toBe(false);
  });

  it('includes strategy ipv4_only', () => {
    const dns = generateDnsConfig();
    expect(dns.strategy).toBe('ipv4_only');
  });

  it('includes correct DNS rules structure', () => {
    const dns = generateDnsConfig();

    expect(dns.rules).toBeDefined();
    expect(Array.isArray(dns.rules)).toBe(true);

    // Check for clash_mode rules
    const globalRule = dns.rules.find((r: any) => r.clash_mode === '全局代理');
    const directRule = dns.rules.find((r: any) => r.clash_mode === '关闭代理');

    expect(globalRule).toBeDefined();
    expect(globalRule?.server).toBe('remote');
    expect(directRule).toBeDefined();
    expect(directRule?.server).toBe('local');
  });
});

describe('generateExperimental', () => {
  it('includes clash_api configuration', () => {
    const experimental = generateExperimental();

    expect(experimental.clash_api).toBeDefined();
    expect(experimental.clash_api).toMatchObject({
      default_mode: '海外代理',
      external_controller: '127.0.0.1:9090',
      secret: ''
    });
  });

  it('includes simplified cache_file configuration without path', () => {
    const experimental = generateExperimental();

    expect(experimental.cache_file).toBeDefined();
    expect(experimental.cache_file).toMatchObject({
      enabled: true
    });
    expect(experimental.cache_file).not.toHaveProperty('path');
  });
});

describe('generateInbounds', () => {
  it('returns array with 3 inbounds (TUN, SOCKS, Mixed)', () => {
    const inbounds = generateInbounds();

    expect(inbounds).toHaveLength(3);
    expect(inbounds[0].type).toBe('tun');
    expect(inbounds[1].type).toBe('socks');
    expect(inbounds[2].type).toBe('mixed');
  });

  it('TUN inbound has required fields', () => {
    const inbounds = generateInbounds();
    const tun = inbounds[0];

    expect(tun.domain_strategy).toBe('prefer_ipv4');
    expect(tun.endpoint_independent_nat).toBe(true);
    expect(tun.address).toEqual([
      '172.19.0.1/30',
      '2001:0470:f9da:fdfa::1/64'
    ]);
    expect(tun.sniff_override_destination).toBe(true);
    expect(tun.stack).toBe('system');
    expect(tun.strict_route).toBe(true);
    expect(tun.auto_route).toBe(true);
    expect(tun.mtu).toBe(9000);
  });

  it('SOCKS inbound has correct configuration', () => {
    const inbounds = generateInbounds();
    const socks = inbounds[1];

    expect(socks.type).toBe('socks');
    expect(socks.listen_port).toBe(2333);
    expect(socks.tag).toBe('socks-in');
    expect(socks.users).toEqual([]);
    expect(socks.domain_strategy).toBe('prefer_ipv4');
    expect(socks.listen).toBe('127.0.0.1');
    expect(socks.sniff).toBe(true);
    expect(socks.sniff_override_destination).toBe(true);
  });

  it('Mixed inbound has correct configuration', () => {
    const inbounds = generateInbounds();
    const mixed = inbounds[2];

    expect(mixed.type).toBe('mixed');
    expect(mixed.listen_port).toBe(2334);
    expect(mixed.tag).toBe('mixed-in');
    expect(mixed.users).toEqual([]);
    expect(mixed.domain_strategy).toBe('prefer_ipv4');
    expect(mixed.listen).toBe('127.0.0.1');
    expect(mixed.sniff).toBe(true);
    expect(mixed.sniff_override_destination).toBe(true);
  });
});

describe('generateOutbounds', () => {
  it('returns exactly 3 base outbounds (selector, urltest, direct)', () => {
    const proxyNames = ['proxy1', 'proxy2'];
    const proxyOutbounds = [];
    const outbounds = generateOutbounds(proxyNames, proxyOutbounds);

    // Should have 3 base outbounds
    expect(outbounds.length).toBe(3);

    const selector = outbounds.find((o: any) => o.tag === '节点选择');
    const auto = outbounds.find((o: any) => o.tag === '自动选择');
    const direct = outbounds.find((o: any) => o.tag === 'direct');

    expect(selector).toBeDefined();
    expect(auto).toBeDefined();
    expect(direct).toBeDefined();
  });

  it('selector outbound has correct structure', () => {
    const proxyNames = ['proxy1', 'proxy2'];
    const proxyOutbounds = [];
    const outbounds = generateOutbounds(proxyNames, proxyOutbounds);
    const selector = outbounds.find((o: any) => o.tag === '节点选择');

    expect(selector).toMatchObject({
      type: 'selector',
      tag: '节点选择',
      outbounds: expect.arrayContaining(['自动选择', ...proxyNames])
    });
  });

  it('urltest outbound has correct structure', () => {
    const proxyNames = ['proxy1', 'proxy2'];
    const proxyOutbounds = [];
    const outbounds = generateOutbounds(proxyNames, proxyOutbounds);
    const auto = outbounds.find((o: any) => o.tag === '自动选择');

    expect(auto).toMatchObject({
      type: 'urltest',
      tag: '自动选择'
    });
    expect(auto?.outbounds).toEqual(expect.arrayContaining(proxyNames));
  });

  it('does NOT include service-specific selectors', () => {
    const proxyNames = ['proxy1', 'proxy2'];
    const proxyOutbounds = [];
    const outbounds = generateOutbounds(proxyNames, proxyOutbounds);

    const serviceSelectors = ['🤖 OpenAI', '🌌 Google', '📟 Telegram', '🐦 Twitter'];

    serviceSelectors.forEach(tag => {
      const found = outbounds.find((o: any) => o.tag === tag);
      expect(found).toBeUndefined();
    });
  });
});

describe('generateRouteRules', () => {
  it('includes action-based rules (sniff, hijack-dns, reject)', () => {
    const rules = generateRouteRules();

    const sniffRule = rules.find((r: any) => r.action === 'sniff');
    const dnsRule = rules.find((r: any) => r.action === 'hijack-dns');
    const rejectRule = rules.find((r: any) => r.action === 'reject');

    expect(sniffRule).toBeDefined();
    expect(dnsRule).toBeDefined();
    expect(rejectRule).toBeDefined();
  });

  it('includes ip_is_private rule', () => {
    const rules = generateRouteRules();

    const privateRule = rules.find((r: any) => r.ip_is_private === true);
    expect(privateRule).toBeDefined();
    expect(privateRule?.outbound).toBe('direct');
  });

  it('includes clash_mode rules with outbound mapping', () => {
    const rules = generateRouteRules();

    const globalRule = rules.find((r: any) => r.clash_mode === '全局代理');
    const directRule = rules.find((r: any) => r.clash_mode === '关闭代理');

    expect(globalRule).toBeDefined();
    expect(globalRule?.outbound).toBe('节点选择');
    expect(directRule).toBeDefined();
    expect(directRule?.outbound).toBe('direct');
  });

  it('uses rule_set references instead of geosite/geoip arrays', () => {
    const rules = generateRouteRules();

    const cnRule = rules.find((r: any) =>
      r.rule_set && r.rule_set.includes('geosite-cn') && r.rule_set.includes('geoip-cn')
    );

    expect(cnRule).toBeDefined();
    expect(cnRule?.outbound).toBe('direct');
  });

  it('does NOT use geosite/geoip arrays', () => {
    const rules = generateRouteRules();

    const hasOldGeosite = rules.some((r: any) => r.geosite && Array.isArray(r.geosite));
    const hasOldGeoip = rules.some((r: any) => r.geoip && Array.isArray(r.geoip));

    expect(hasOldGeosite).toBe(false);
    expect(hasOldGeoip).toBe(false);
  });
});

describe('generateRuleSets', () => {
  it('returns array with 3 rule sets', () => {
    const ruleSets = generateRuleSets();

    expect(ruleSets).toHaveLength(3);
  });

  it('includes geosite-cn rule set', () => {
    const ruleSets = generateRuleSets();
    const geositeCn = ruleSets.find((rs: any) => rs.tag === 'geosite-cn');

    expect(geositeCn).toBeDefined();
    expect(geositeCn).toMatchObject({
      tag: 'geosite-cn',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs'
    });
  });

  it('includes category-ads-all rule set', () => {
    const ruleSets = generateRuleSets();
    const adsRule = ruleSets.find((rs: any) => rs.tag === 'category-ads-all');

    expect(adsRule).toBeDefined();
    expect(adsRule).toMatchObject({
      tag: 'category-ads-all',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs'
    });
  });

  it('includes geoip-cn rule set', () => {
    const ruleSets = generateRuleSets();
    const geoipCn = ruleSets.find((rs: any) => rs.tag === 'geoip-cn');

    expect(geoipCn).toBeDefined();
    expect(geoipCn).toMatchObject({
      tag: 'geoip-cn',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/Loyalsoldier/geoip/release/srs/cn.srs'
    });
  });

  it('all rule sets use download_detour 节点选择', () => {
    const ruleSets = generateRuleSets();

    ruleSets.forEach((rs: any) => {
      expect(rs.download_detour).toBe('节点选择');
    });
  });
});

describe('generateSingBoxConfig integration', () => {
  it('generates config matching template structure', () => {
    const mockProxies: ProxyNode[] = [
      {
        tag: 'test-proxy',
        type: 'ss',
        server: 'example.com',
        server_port: 8388,
        method: 'chacha20-ietf-poly1305',
        password: 'test-password'
      }
    ];

    const result = generateSingBoxConfig(mockProxies);
    const config = JSON.parse(result);

    // Verify DNS structure
    expect(config.dns).toMatchObject({
      servers: expect.arrayContaining([
        expect.objectContaining({ tag: 'remote' }),
        expect.objectContaining({ tag: 'local' }),
        expect.objectContaining({ tag: 'block' })
      ]),
      final: 'remote',
      disable_cache: false,
      strategy: 'ipv4_only'
    });

    // Verify Experimental structure
    expect(config.experimental).toMatchObject({
      clash_api: {
        default_mode: '海外代理',
        external_controller: '127.0.0.1:9090',
        secret: ''
      },
      cache_file: {
        enabled: true
      }
    });

    // Verify Inbounds structure
    expect(config.inbounds).toHaveLength(3);
    expect(config.inbounds[0]).toMatchObject({
      type: 'tun',
      domain_strategy: 'prefer_ipv4',
      endpoint_independent_nat: true,
      sniff_override_destination: true
    });

    // Verify Outbounds structure - should have 节点选择 and 自动选择
    expect(config.outbounds.some((o: any) => o.tag === '节点选择')).toBe(true);
    expect(config.outbounds.some((o: any) => o.tag === '自动选择')).toBe(true);

    // Should NOT have service-specific selectors
    expect(config.outbounds.some((o: any) => o.tag === '🤖 OpenAI')).toBe(false);

    // Verify Route structure
    expect(config.route).toHaveProperty('rules');
    expect(config.route).toHaveProperty('rule_set');
    expect(config.route.rule_set).toHaveLength(3);
  });
});
