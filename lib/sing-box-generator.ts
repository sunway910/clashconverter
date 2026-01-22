import { ProxyNode } from './types';

// Protocols supported by sing-box (SSR and SOCKS5 are NOT supported)
export const SING_BOX_SUPPORTED_PROTOCOLS = new Set([
  'ss', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'http',
]);

// Convert proxy node to sing-box outbound format
function convertToSingBoxOutbound(proxy: ProxyNode): any {
  const base = {
    tag: proxy.name,
    server: proxy.server,
    server_port: proxy.port,
  };

  switch (proxy.type) {
    case 'ss':
      return {
        ...base,
        type: 'shadowsocks',
        method: proxy.cipher || 'aes-128-gcm',
        password: proxy.password,
      };

    case 'ssr':
      // sing-box doesn't support SSR, but we'll create a basic shadowsocks fallback
      return {
        ...base,
        type: 'shadowsocks',
        method: proxy.cipher || 'aes-128-gcm',
        password: proxy.password,
      };

    case 'vmess':
      const vmessOut: any = {
        ...base,
        type: 'vmess',
        uuid: proxy.uuid,
        packet_encoding: 'xudp',
        security: proxy.cipher || 'auto',
        alter_id: 0,
      };
      // Only add transport if network is ws (as object with type field)
      if (proxy.network === 'ws') {
        vmessOut.transport = { type: 'ws' };
      }
      return vmessOut;

    case 'vless':
      const vlessOut: any = {
        ...base,
        type: 'vless',
        uuid: proxy.uuid,
      };
      // Only set flow if it has a value (sing-box doesn't accept empty strings)
      if (proxy.flow) {
        vlessOut.flow = proxy.flow;
      }

      if (proxy.tls || proxy.servername) {
        vlessOut.tls = {
          enabled: true,
        };
      }

      if (proxy['reality-opts']) {
        if (!vlessOut.tls) vlessOut.tls = { enabled: true };
        vlessOut.tls.reality = {
          enabled: true,
          public_key: proxy['reality-opts']['public-key'] || '',
          short_id: proxy['reality-opts']['short-id'] || '',
        };
      }

      return vlessOut;

    case 'trojan':
      return {
        ...base,
        type: 'trojan',
        password: proxy.password,
        tls: {
          enabled: true,
          insecure: proxy['skip-cert-verify'] || false,
        },
      };

    case 'hysteria':
      return {
        ...base,
        type: 'hysteria',
        auth: proxy.auth_str || proxy.auth || '',
        up_mbps: proxy.up || 10,
        down_mbps: proxy.down || 50,
      };

    case 'hysteria2':
      // For hysteria2, only include tls with enabled: true to match template
      return {
        ...base,
        type: 'hysteria2',
        password: proxy.password,
        tls: {
          enabled: true,
        },
      };

    case 'http':
      return {
        ...base,
        type: 'http',
        users: [
          {
            username: proxy.username,
            password: proxy.password,
          },
        ],
        set_system_proxy: true,
      };

    default:
      throw new Error(`Unsupported proxy type: ${proxy.type}`);
  }
}

// Generate selector outbounds for different services
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

// Generate route rules
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

// Generate DNS configuration
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

// Main function to generate sing-box configuration
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
