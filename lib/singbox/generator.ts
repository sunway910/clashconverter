/**
 * Sing-Box JSON generator using protocol adapters
 * Generates Sing-Box JSON configuration from ProxyNode array
 *
 * Refactored to match template structure in test/sing-box/sing-box.json
 */

import type { ProxyNode } from '../types';
import { ProtocolAdapterRegistry } from '../adapters/protocol-adapter';
import { UnsupportedProtocolError } from '../errors';

// Protocols supported by sing-box (all protocols are now supported)
export const SING_BOX_SUPPORTED_PROTOCOLS = new Set([
  'ss', 'ssr', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http', 'socks5',
]);

/**
 * Convert proxy node to sing-box outbound format using adapters
 * @param proxy - ProxyNode to convert
 * @returns Sing-Box outbound configuration
 */
function convertToSingBoxOutbound(proxy: ProxyNode): any {
  const adapter = ProtocolAdapterRegistry.get(proxy.type);
  if (adapter) {
    return adapter.toSingBoxJson(proxy);
  }
  throw UnsupportedProtocolError.forFormat(proxy.type, 'sing-box');
}

/**
 * Phase 1: Generate DNS configuration with remote/local/block servers
 * @returns DNS configuration object
 */
export function generateDnsConfig(): any {
  return {
    servers: [
      {
        tag: 'remote',
        address: '1.1.1.1',
        detour: '节点选择',
      },
      {
        tag: 'local',
        address: 'https://223.5.5.5/dns-query',
        detour: 'direct',
      },
      {
        tag: 'block',
        address: 'rcode://refused',
      },
    ],
    rules: [
      {
        outbound: ['any'],
        server: 'local',
      },
      {
        clash_mode: '全局代理',
        server: 'remote',
      },
      {
        clash_mode: '关闭代理',
        server: 'local',
      },
      {
        rule_set: ['geosite-cn'],
        server: 'local',
      },
      {
        rule_set: ['category-ads-all'],
        server: 'block',
      },
    ],
    final: 'remote',
    disable_cache: false,
    strategy: 'ipv4_only',
  };
}

/**
 * Phase 2: Generate Experimental configuration with clash_api
 * @returns Experimental configuration object
 */
export function generateExperimental(): any {
  return {
    clash_api: {
      default_mode: '海外代理',
      external_controller: '127.0.0.1:9090',
      secret: '',
    },
    cache_file: {
      enabled: true,
    },
  };
}

/**
 * Phase 3: Generate Inbounds configuration (TUN, SOCKS, Mixed)
 * @returns Array of inbound configurations
 */
export function generateInbounds(): any[] {
  return [
    // TUN inbound
    {
      type: 'tun',
      auto_route: true,
      domain_strategy: 'prefer_ipv4',
      endpoint_independent_nat: true,
      address: [
        '172.19.0.1/30',
        '2001:0470:f9da:fdfa::1/64',
      ],
      mtu: 9000,
      sniff_override_destination: true,
      stack: 'system',
      strict_route: true,
    },
    // SOCKS inbound
    {
      type: 'socks',
      tag: 'socks-in',
      listen: '127.0.0.1',
      listen_port: 2333,
      sniff: true,
      sniff_override_destination: true,
      domain_strategy: 'prefer_ipv4',
      users: [],
    },
    // Mixed inbound
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '127.0.0.1',
      listen_port: 2334,
      sniff: true,
      sniff_override_destination: true,
      domain_strategy: 'prefer_ipv4',
      users: [],
    },
  ];
}

/**
 * Phase 4: Generate Outbounds configuration (simplified - only 3 base outbounds)
 * @param proxyNames - Array of proxy node names
 * @param proxyOutbounds - Array of converted proxy outbound configurations
 * @returns Array of outbound configurations
 */
export function generateOutbounds(proxyNames: string[], proxyOutbounds: any[]): any[] {
  // Build outbounds list for selector (includes 自动选择 and all proxies)
  const selectorOutbounds = ['自动选择', ...proxyNames];

  return [
    // Selector outbound (节点选择)
    {
      type: 'selector',
      tag: '节点选择',
      outbounds: selectorOutbounds,
    },
    // URL test outbound (自动选择)
    {
      type: 'urltest',
      tag: '自动选择',
      outbounds: proxyNames,
    },
    // Direct outbound
    {
      type: 'direct',
      tag: 'direct',
    },
    // Actual proxy outbounds
    ...proxyOutbounds,
  ];
}

/**
 * Phase 5: Generate Route rules (using action field and rule_set references)
 * @returns Array of route rule configurations
 */
export function generateRouteRules(): any[] {
  return [
    {
      action: 'sniff',
    },
    {
      protocol: 'dns',
      action: 'hijack-dns',
    },
    {
      clash_mode: '关闭代理',
      outbound: 'direct',
    },
    {
      clash_mode: '全局代理',
      outbound: '节点选择',
    },
    {
      rule_set: ['geosite-cn', 'geoip-cn'],
      outbound: 'direct',
    },
    {
      ip_is_private: true,
      outbound: 'direct',
    },
    {
      rule_set: ['category-ads-all'],
      action: 'reject',
    },
  ];
}

/**
 * Phase 6: Generate Rule Set configurations
 * @returns Array of rule set configurations
 */
export function generateRuleSets(): any[] {
  return [
    {
      tag: 'geosite-cn',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs',
      download_detour: '节点选择',
    },
    {
      tag: 'category-ads-all',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs',
      download_detour: '节点选择',
    },
    {
      tag: 'geoip-cn',
      type: 'remote',
      format: 'binary',
      url: 'https://raw.githubusercontent.com/Loyalsoldier/geoip/release/srs/cn.srs',
      download_detour: '节点选择',
    },
  ];
}

/**
 * Phase 7: Main function to generate sing-box configuration
 * @param proxies - Array of ProxyNode objects
 * @returns Sing-Box JSON configuration string
 */
export function generateSingBoxConfig(proxies: ProxyNode[]): string {
  if (proxies.length === 0) {
    return JSON.stringify({ error: 'No proxies found' }, null, 2);
  }

  const proxyNames = proxies.map((p) => p.name);
  const proxyOutbounds = proxies.map(convertToSingBoxOutbound);

  const config = {
    dns: generateDnsConfig(),
    experimental: generateExperimental(),
    inbounds: generateInbounds(),
    outbounds: generateOutbounds(proxyNames, proxyOutbounds),
    route: {
      auto_detect_interface: true,
      rules: generateRouteRules(),
      rule_set: generateRuleSets(),
    },
  };

  return JSON.stringify(config, null, 2);
}
