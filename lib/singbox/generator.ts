/**
 * Sing-Box JSON generator using protocol adapters
 * Generates Sing-Box JSON configuration from ProxyNode array
 */

import type { ProxyNode } from '../types';
import { ProtocolAdapterRegistry } from '../adapters/protocol-adapter';
import { UnsupportedProtocolError } from '../errors';

// Protocols supported by sing-box (SSR and SOCKS5 are NOT supported)
export const SING_BOX_SUPPORTED_PROTOCOLS = new Set([
  'ss', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http',
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
 * Generate selector outbounds for different services
 * @param proxyNames - Array of proxy node names
 * @returns Array of selector outbound configurations
 */
function generateSelectorOutbounds(proxyNames: string[]): any[] {
  const proxyWithDirect = ['direct', ...proxyNames];
  const proxyWithAuto = ['auto', ...proxyNames];

  return [
    // Main selector
    {
      tag: 'select',
      type: 'selector',
      outbounds: proxyWithAuto,
    },
    // URL test (auto)
    {
      tag: 'auto',
      type: 'urltest',
      outbounds: proxyNames,
      url: 'https://www.gstatic.com/generate_204',
      interval: '1m',
      tolerance: 50,
    },
    // Service-specific selectors
    {
      tag: '🤖 OpenAI',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🌌 Google',
      type: 'selector',
      outbounds: proxyNames,
    },
    {
      tag: '📟 Telegram',
      type: 'selector',
      outbounds: proxyNames,
    },
    {
      tag: '🐦 Twitter',
      type: 'selector',
      outbounds: proxyNames,
    },
    {
      tag: '👤 Facebook',
      type: 'selector',
      outbounds: proxyNames,
    },
    {
      tag: '🛍️ Amazon',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🍎 Apple',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🧩 Microsoft',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🎮 Game',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '📺 Bilibili',
      type: 'selector',
      outbounds: ['direct'],
    },
    {
      tag: '🎬 MediaVideo',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🌏 !cn',
      type: 'selector',
      outbounds: proxyWithDirect,
    },
    {
      tag: '🌏 cn',
      type: 'selector',
      outbounds: ['direct', 'select'],
    },
    {
      tag: '🛑 AdBlock',
      type: 'selector',
      outbounds: ['block', 'direct'],
    },
    // System outbounds
    {
      tag: 'direct',
      type: 'direct',
    },
    {
      tag: 'block',
      type: 'block',
    },
    {
      tag: 'dns-out',
      type: 'dns',
    },
  ];
}

/**
 * Generate route rules
 * @returns Array of route rule configurations
 */
function generateRouteRules(): any[] {
  return [
    {
      protocol: 'dns',
      outbound: 'dns-out',
    },
    {
      network: 'udp',
      port: 443,
      outbound: 'block',
    },
    {
      clash_mode: 'direct',
      outbound: 'direct',
    },
    {
      clash_mode: 'global',
      outbound: 'select',
    },
    {
      domain: ['v2rayse.com', 'cfmem.com', 'vpnse.org', 'cff.pw', 'tt.vg'],
      outbound: 'select',
    },
    {
      domain: ['clash.razord.top', 'yacd.metacubex.one', 'yacd.haishan.me', 'd.metacubex.one'],
      outbound: 'direct',
    },
    {
      geosite: ['openai'],
      outbound: '🤖 OpenAI',
    },
    {
      geosite: ['google', 'github'],
      geoip: ['google'],
      outbound: '🌌 Google',
    },
    {
      geosite: ['telegram'],
      geoip: ['telegram'],
      outbound: '📟 Telegram',
    },
    {
      geosite: ['twitter'],
      geoip: ['twitter'],
      outbound: '🐦 Twitter',
    },
    {
      geosite: ['facebook', 'instagram'],
      geoip: ['facebook'],
      outbound: '👤 Facebook',
    },
    {
      geosite: ['amazon'],
      outbound: '🛍️ Amazon',
    },
    {
      geosite: ['apple-cn', 'apple'],
      outbound: '🍎 Apple',
    },
    {
      geosite: ['microsoft'],
      outbound: '🧩 Microsoft',
    },
    {
      geosite: ['category-games'],
      outbound: '🎮 Game',
    },
    {
      geosite: ['bilibili'],
      outbound: '📺 Bilibili',
    },
    {
      geosite: ['tiktok', 'netflix', 'hbo', 'disney', 'primevideo'],
      geoip: ['netflix'],
      outbound: '🎬 MediaVideo',
    },
    {
      geosite: ['geolocation-!cn'],
      outbound: '🌏 !cn',
    },
    {
      geosite: ['cn'],
      geoip: ['private', 'cn'],
      outbound: '🌏 cn',
    },
    {
      geosite: ['category-ads-all'],
      outbound: '🛑 AdBlock',
    },
  ];
}

/**
 * Generate DNS configuration
 * @returns DNS configuration object
 */
function generateDnsConfig(): any {
  return {
    servers: [
      {
        tag: 'proxyDns',
        address: '8.8.8.8',
        detour: 'select',
      },
      {
        tag: 'localDns',
        address: 'https://223.5.5.5/dns-query',
        detour: 'direct',
      },
      {
        tag: 'block',
        address: 'rcode://success',
      },
    ],
    rules: [
      {
        domain: ['ghproxy.com', 'cdn.jsdelivr.net', 'testingcf.jsdelivr.net'],
        server: 'localDns',
      },
      {
        geosite: ['category-ads-all'],
        server: 'block',
      },
      {
        server: 'localDns',
        outbound: 'any',
        disable_cache: true,
      },
      {
        geosite: ['cn'],
        server: 'localDns',
      },
      {
        server: 'localDns',
        clash_mode: 'direct',
      },
      {
        server: 'proxyDns',
        clash_mode: 'global',
      },
      {
        geosite: ['geolocation-!cn'],
        server: 'proxyDns',
      },
    ],
    strategy: 'ipv4_only',
  };
}

/**
 * Main function to generate sing-box configuration using adapters
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
    log: {
      disabled: false,
      level: 'info',
      timestamp: true,
    },
    dns: generateDnsConfig(),
    inbounds: [
      {
        sniff: true,
        type: 'mixed',
        listen: '127.0.0.1',
        listen_port: 1081,
      },
      {
        stack: 'system',
        auto_route: true,
        inet4_address: '172.19.0.1/30',
        mtu: 9000,
        sniff: true,
        strict_route: true,
        type: 'tun',
        platform: {
          http_proxy: {
            enabled: true,
            server: '127.0.0.1',
            server_port: 1081,
          },
        },
      },
    ],
    outbounds: [
      ...generateSelectorOutbounds(proxyNames),
      ...proxyOutbounds,
    ],
    route: {
      geoip: {
        download_url: 'https://github.com/soffchen/sing-geoip/releases/latest/download/geoip.db',
        download_detour: 'select',
      },
      geosite: {
        download_url: 'https://github.com/soffchen/sing-geosite/releases/latest/download/geosite.db',
        download_detour: 'select',
      },
      rules: generateRouteRules(),
      auto_detect_interface: true,
      final: 'select',
    },
    experimental: {
      cache_file: {
        enabled: true,
        path: 'cache.db',
      },
    },
  };

  return JSON.stringify(config, null, 2);
}
